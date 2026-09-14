#!/usr/bin/env python3
"""
Release watcher for the Laptop Service Management stack.

Polls for a new published release, and — only inside the deployment window
(default 23:00–07:00 Asia/Kolkata) — deploys it:

  1. refuse if the checkout has local edits to tracked files
  2. fetch the release tag
  3. back up the database (pg_dump, custom format) before touching anything
  4. check out the tag and build images while the old containers keep serving
  5. `docker compose up -d` the app services (never `down`, never `-v`:
     the Postgres volume and its data are left alone)
  6. wait for the healthchecks; on failure roll back to the previous release

A release that fails is remembered and not retried on every poll.

Runs as the `deployer` service in docker-compose.yaml (it talks to the host's
Docker daemon through the mounted socket) or directly on the host:

    python3 deploy/auto_deploy.py            # watch forever
    python3 deploy/auto_deploy.py --once     # single check, ignores the window with --force
    python3 deploy/auto_deploy.py --status   # print config and state

Standard library only. Configuration is environment variables (see
deploy/README section in the main README and .env.example).
"""

from __future__ import annotations

import argparse
import fcntl
import json
import logging
import os
import re
import signal
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, time as dtime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

LOG = logging.getLogger("auto-deploy")


# --------------------------------------------------------------------------- config


def _env(name: str, default: str) -> str:
    value = os.environ.get(name, "").strip()
    return value if value else default


def _env_bool(name: str, default: bool) -> bool:
    value = os.environ.get(name, "").strip().lower()
    return default if not value else value in {"1", "true", "yes", "on"}


def _parse_hhmm(value: str) -> dtime:
    match = re.fullmatch(r"(\d{1,2}):(\d{2})", value)
    if not match or int(match[1]) > 23 or int(match[2]) > 59:
        raise ValueError(f"expected HH:MM, got {value!r}")
    return dtime(int(match[1]), int(match[2]))


@dataclass
class Config:
    enabled: bool
    repo_dir: Path
    release_source: str  # "github" | "git-tags"
    github_repo: str
    github_token: str
    git_url: str
    tag_pattern: re.Pattern[str]
    window_start: dtime
    window_end: dtime
    timezone: ZoneInfo
    poll_seconds: int
    services: list[str]
    health_services: list[str]
    health_timeout: int
    backup_dir: Path
    backup_keep: int
    state_file: Path

    @classmethod
    def from_env(cls) -> "Config":
        repo_dir = Path(_env("REPO_DIR", os.getcwd())).resolve()
        github_repo = _env("GITHUB_REPO", "pxndavinci/laptop-service-management")
        source = _env("RELEASE_SOURCE", "github")
        if source not in {"github", "git-tags"}:
            raise ValueError("RELEASE_SOURCE must be 'github' or 'git-tags'")
        services = _env("DEPLOY_SERVICES", "postgres backend frontend").split()
        return cls(
            enabled=_env_bool("AUTO_DEPLOY_ENABLED", False),
            repo_dir=repo_dir,
            release_source=source,
            github_repo=github_repo,
            github_token=os.environ.get("GITHUB_TOKEN", "").strip(),
            git_url=_env("GIT_URL", f"https://github.com/{github_repo}.git"),
            tag_pattern=re.compile(_env("TAG_PATTERN", r"^v?\d+\.\d+\.\d+$")),
            window_start=_parse_hhmm(_env("DEPLOY_WINDOW_START", "23:00")),
            window_end=_parse_hhmm(_env("DEPLOY_WINDOW_END", "07:00")),
            timezone=ZoneInfo(_env("DEPLOY_TIMEZONE", "Asia/Kolkata")),
            poll_seconds=max(60, int(_env("POLL_INTERVAL_SECONDS", "600"))),
            services=services,
            health_services=_env("HEALTH_SERVICES", "backend frontend").split(),
            health_timeout=max(30, int(_env("HEALTH_TIMEOUT_SECONDS", "300"))),
            backup_dir=Path(_env("BACKUP_DIR", str(repo_dir / "backups"))),
            backup_keep=max(1, int(_env("BACKUP_KEEP", "14"))),
            state_file=Path(_env("STATE_FILE", str(repo_dir / ".deploy" / "state.json"))),
        )


# --------------------------------------------------------------------------- helpers


class DeployError(Exception):
    """A step failed; the message is safe to log."""


def run(
    cmd: list[str],
    cfg: Config,
    *,
    check: bool = True,
    timeout: int = 1800,
    stdout=None,
) -> subprocess.CompletedProcess[str]:
    """Runs a command in the repo directory. Never uses a shell."""
    LOG.debug("$ %s", " ".join(cmd))
    try:
        result = subprocess.run(
            cmd,
            cwd=cfg.repo_dir,
            text=stdout is None,
            stdout=stdout if stdout is not None else subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            # docker-compose.yaml mounts ${PWD}; inside a container PWD is not set by a shell
            env={**os.environ, "PWD": str(cfg.repo_dir)},
        )
    except FileNotFoundError as exc:
        raise DeployError(f"command not found: {cmd[0]}") from exc
    except subprocess.TimeoutExpired as exc:
        raise DeployError(f"timed out after {timeout}s: {' '.join(cmd)}") from exc
    if check and result.returncode != 0:
        stderr = result.stderr if isinstance(result.stderr, str) else result.stderr.decode(errors="replace")
        tail = "\n".join(stderr.strip().splitlines()[-15:])
        raise DeployError(f"`{' '.join(cmd)}` exited {result.returncode}:\n{tail}")
    return result


def in_window(cfg: Config, now: datetime | None = None) -> bool:
    current = (now or datetime.now(cfg.timezone)).timetz().replace(tzinfo=None)
    start, end = cfg.window_start, cfg.window_end
    if start <= end:
        return start <= current < end
    return current >= start or current < end  # window crosses midnight


def seconds_until_window(cfg: Config, now: datetime | None = None) -> int:
    now = now or datetime.now(cfg.timezone)
    start = now.replace(
        hour=cfg.window_start.hour, minute=cfg.window_start.minute, second=0, microsecond=0
    )
    if start <= now:
        start += timedelta(days=1)
    return int((start - now).total_seconds())


def version_key(tag: str) -> tuple:
    """Sort key: numeric parts compare as numbers (v1.10.0 > v1.9.3)."""
    parts = re.split(r"[.\-+]", tag.lstrip("vV"))
    return tuple((0, int(part), "") if part.isdigit() else (1, 0, part) for part in parts)


# --------------------------------------------------------------------------- state


@dataclass
class State:
    deployed_tag: str | None = None
    deployed_commit: str | None = None
    deployed_at: str | None = None
    previous_tag: str | None = None
    failed_tags: list[str] = field(default_factory=list)
    github_etag: str | None = None
    github_latest: str | None = None

    @classmethod
    def load(cls, path: Path) -> "State":
        try:
            data = json.loads(path.read_text())
            return cls(**{key: data[key] for key in cls.__dataclass_fields__ if key in data})
        except FileNotFoundError:
            return cls()
        except (json.JSONDecodeError, TypeError) as exc:
            LOG.warning("state file %s unreadable (%s); starting fresh", path, exc)
            return cls()

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.__dict__, indent=2) + "\n")
        tmp.replace(path)  # atomic: a crash never leaves half a file


# --------------------------------------------------------------------------- releases


def latest_github_release(cfg: Config, state: State) -> str | None:
    """Tag of the latest published (non-draft, non-prerelease) GitHub release."""
    url = f"https://api.github.com/repos/{cfg.github_repo}/releases/latest"
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "lsm-auto-deploy"}
    if cfg.github_token:
        headers["Authorization"] = f"Bearer {cfg.github_token}"
    if state.github_etag and state.github_latest:
        headers["If-None-Match"] = state.github_etag  # 304s do not count against the rate limit
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            tag = json.load(response).get("tag_name")
            state.github_etag = response.headers.get("ETag")
            state.github_latest = tag
            return tag
    except urllib.error.HTTPError as exc:
        if exc.code == 304:
            return state.github_latest
        if exc.code == 404:
            return None  # no published release yet
        if exc.code in {403, 429}:
            raise DeployError(f"GitHub API rate limited ({exc.code}); set GITHUB_TOKEN") from exc
        raise DeployError(f"GitHub API error {exc.code}: {exc.reason}") from exc
    except urllib.error.URLError as exc:
        raise DeployError(f"cannot reach GitHub: {exc.reason}") from exc


def latest_git_tag(cfg: Config) -> str | None:
    """Highest version tag on the remote matching TAG_PATTERN."""
    output = run(["git", "ls-remote", "--tags", "--refs", cfg.git_url], cfg, timeout=120).stdout
    tags = [line.split("refs/tags/", 1)[1] for line in output.splitlines() if "refs/tags/" in line]
    tags = [tag for tag in tags if cfg.tag_pattern.match(tag)]
    return max(tags, key=version_key) if tags else None


def latest_release(cfg: Config, state: State) -> str | None:
    if cfg.release_source == "github":
        return latest_github_release(cfg, state)
    return latest_git_tag(cfg)


# --------------------------------------------------------------------------- docker


def compose(cfg: Config, *args: str, timeout: int = 1800, stdout=None, check: bool = True):
    return run(["docker", "compose", *args], cfg, timeout=timeout, stdout=stdout, check=check)


def service_status(cfg: Config) -> dict[str, dict]:
    """Service name -> {State, Health} for running containers of this project."""
    output = compose(cfg, "ps", "--all", "--format", "json", timeout=60).stdout.strip()
    if not output:
        return {}
    # Compose prints either a JSON array or one JSON object per line
    rows = json.loads(output) if output.startswith("[") else [json.loads(line) for line in output.splitlines()]
    return {row["Service"]: row for row in rows}


def wait_healthy(cfg: Config) -> None:
    deadline = time.monotonic() + cfg.health_timeout
    last = ""
    while time.monotonic() < deadline:
        status = service_status(cfg)
        summary = []
        healthy = True
        for name in cfg.health_services:
            row = status.get(name)
            state = row.get("State", "missing") if row else "missing"
            health = (row.get("Health") or "none") if row else "none"
            summary.append(f"{name}={state}/{health}")
            if state in {"exited", "dead"}:
                raise DeployError(f"{name} stopped during startup ({', '.join(summary)})")
            # Services without a healthcheck count once they are running
            if not (state == "running" and health in {"healthy", "none", ""}):
                healthy = False
        last = ", ".join(summary)
        if healthy:
            LOG.info("services healthy: %s", last)
            return
        time.sleep(5)
    raise DeployError(f"services not healthy after {cfg.health_timeout}s: {last}")


def backup_database(cfg: Config, label: str) -> Path | None:
    status = service_status(cfg).get("postgres")
    if not status or status.get("State") != "running":
        LOG.info("postgres is not running (first deploy?) — skipping backup")
        return None

    cfg.backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(cfg.timezone).strftime("%Y%m%d-%H%M%S")
    target = cfg.backup_dir / f"lsm-{stamp}-before-{re.sub(r'[^A-Za-z0-9._-]', '_', label)}.dump"
    partial = target.with_suffix(".dump.partial")
    with partial.open("wb") as handle:
        compose(
            cfg,
            "exec", "-T", "postgres",
            "sh", "-c", 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom',
            stdout=handle,
            timeout=1800,
        )
    if partial.stat().st_size == 0:
        partial.unlink(missing_ok=True)
        raise DeployError("database backup is empty")
    partial.rename(target)
    LOG.info("database backed up to %s (%d KB)", target, target.stat().st_size // 1024)

    backups = sorted(cfg.backup_dir.glob("lsm-*.dump"))
    for old in backups[: -cfg.backup_keep]:
        old.unlink(missing_ok=True)
        LOG.info("removed old backup %s", old.name)
    return target


# --------------------------------------------------------------------------- git


def git(cfg: Config, *args: str, timeout: int = 300) -> str:
    return run(["git", *args], cfg, timeout=timeout).stdout.strip()


def ensure_clean_checkout(cfg: Config) -> None:
    if not (cfg.repo_dir / ".git").exists():
        raise DeployError(f"{cfg.repo_dir} is not a git checkout")
    dirty = git(cfg, "status", "--porcelain", "--untracked-files=no")
    if dirty:
        raise DeployError(
            "checkout has local changes to tracked files; refusing to deploy over them:\n" + dirty
        )


def fetch_tag(cfg: Config, tag: str) -> str:
    git(cfg, "fetch", "--force", "--no-tags", cfg.git_url, f"refs/tags/{tag}:refs/tags/{tag}", timeout=600)
    return git(cfg, "rev-parse", f"refs/tags/{tag}^{{commit}}")


def current_ref(cfg: Config) -> str:
    return git(cfg, "rev-parse", "HEAD")


def checkout(cfg: Config, ref: str) -> None:
    git(cfg, "-c", "advice.detachedHead=false", "checkout", "--detach", ref)


def deployer_changed(cfg: Config, old: str, new: str) -> bool:
    """
    True when the watcher's code (deploy/) or its compose definition changed.
    The compose file is included because the deployer's env, mounts or user
    can change there alone; `up --no-deps deployer` is a no-op if its own
    service definition did not actually change.
    """
    changed = git(cfg, "diff", "--name-only", old, new, "--", "deploy/", "docker-compose.yaml")
    return bool(changed)


def restart_deployer_later(cfg: Config) -> None:
    """
    Rebuilds this watcher from a separate short-lived container, so the
    recreate is not cut off when compose stops the container running it.
    """
    LOG.info("watcher code or compose config changed in this release — recreating the deployer service")
    run(
        [
            "docker", "run", "-d", "--rm", "--name", "lsm-deployer-updater",
            "-v", "/var/run/docker.sock:/var/run/docker.sock",
            "-v", f"{cfg.repo_dir}:{cfg.repo_dir}",
            "-w", str(cfg.repo_dir),
            "-e", f"PWD={cfg.repo_dir}",
            "docker:cli",
            "sh", "-c", "sleep 5 && docker compose up -d --build --no-deps deployer",
        ],
        cfg,
        check=False,
        timeout=120,
    )


# --------------------------------------------------------------------------- deploy


def build_and_start(cfg: Config) -> None:
    LOG.info("building images for: %s", " ".join(cfg.services))
    compose(cfg, "build", *cfg.services, timeout=3600)
    LOG.info("starting services (data volumes are kept)")
    compose(cfg, "up", "-d", "--no-build", *cfg.services, timeout=900)
    wait_healthy(cfg)


def deploy(cfg: Config, state: State, tag: str) -> None:
    LOG.info("deploying release %s", tag)
    ensure_clean_checkout(cfg)
    commit = fetch_tag(cfg, tag)
    previous = current_ref(cfg)
    if previous == commit:
        LOG.info("checkout already at %s (%s); recording it as deployed", tag, commit[:10])
    else:
        backup_database(cfg, tag)

    checkout(cfg, commit)
    try:
        build_and_start(cfg)
    except DeployError as exc:
        LOG.error("deploy of %s failed: %s", tag, exc)
        state.failed_tags = sorted(set(state.failed_tags) | {tag})
        state.save(cfg.state_file)
        if previous != commit:
            rollback(cfg, previous)
        raise

    state.previous_tag = state.deployed_tag
    state.deployed_tag = tag
    state.deployed_commit = commit
    state.deployed_at = datetime.now(cfg.timezone).isoformat(timespec="seconds")
    state.save(cfg.state_file)
    LOG.info("release %s is live (%s)", tag, commit[:10])

    if previous != commit and deployer_changed(cfg, previous, commit):
        restart_deployer_later(cfg)


def rollback(cfg: Config, previous: str) -> None:
    LOG.warning("rolling back to %s", previous[:10])
    try:
        checkout(cfg, previous)
        build_and_start(cfg)
        LOG.warning(
            "rollback to %s succeeded. Database migrations from the failed release (if any) "
            "stay applied; the pre-deploy backup is in %s",
            previous[:10],
            cfg.backup_dir,
        )
    except DeployError as exc:
        LOG.critical("ROLLBACK FAILED — the app may be down. Manual action needed: %s", exc)


def check_once(cfg: Config, state: State, force_window: bool = False) -> None:
    if not force_window and not in_window(cfg):
        LOG.info(
            "outside the deploy window (%s–%s %s)",
            cfg.window_start.strftime("%H:%M"),
            cfg.window_end.strftime("%H:%M"),
            cfg.timezone.key,
        )
        return

    tag = latest_release(cfg, state)
    state.save(cfg.state_file)  # persist the GitHub ETag
    if not tag:
        LOG.info("no published release found")
        return
    if tag == state.deployed_tag:
        LOG.info("release %s is already deployed", tag)
        return
    if tag in state.failed_tags:
        LOG.warning(
            "release %s failed before and is skipped; publish a new release or remove it "
            "from failed_tags in %s",
            tag,
            cfg.state_file,
        )
        return
    deploy(cfg, state, tag)


# --------------------------------------------------------------------------- main


# Set by SIGTERM/SIGINT. Checked between steps, so a deploy that has started
# finishes (or rolls back) instead of dying half-built.
STOP = threading.Event()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--once", action="store_true", help="check once and exit")
    parser.add_argument("--force", action="store_true", help="with --once: ignore the time window")
    parser.add_argument("--status", action="store_true", help="print config and state, then exit")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)-8s %(message)s",
        stream=sys.stdout,
    )

    try:
        cfg = Config.from_env()
    except ValueError as exc:
        LOG.critical("invalid configuration: %s", exc)
        return 2

    state = State.load(cfg.state_file)

    if args.status:
        print(json.dumps({
            "enabled": cfg.enabled,
            "repo_dir": str(cfg.repo_dir),
            "source": cfg.release_source,
            "repo": cfg.github_repo if cfg.release_source == "github" else cfg.git_url,
            "window": f"{cfg.window_start:%H:%M}-{cfg.window_end:%H:%M} {cfg.timezone.key}",
            "in_window_now": in_window(cfg),
            "services": cfg.services,
            "state": state.__dict__,
        }, indent=2))
        return 0

    if not cfg.enabled and not args.once:
        LOG.warning(
            "AUTO_DEPLOY_ENABLED is not true — watcher is idle. Enable it only in the server "
            "checkout that should follow releases."
        )
        while True:  # stay up quietly so `docker compose up` does not report a crash loop
            time.sleep(3600)

    def _stop(signum, _frame):
        LOG.info("received %s — will stop after the current step", signal.Signals(signum).name)
        STOP.set()

    signal.signal(signal.SIGTERM, _stop)
    signal.signal(signal.SIGINT, _stop)

    # One watcher per checkout: a second copy exits instead of racing the first
    cfg.state_file.parent.mkdir(parents=True, exist_ok=True)
    lock = open(cfg.state_file.parent / "watcher.lock", "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        LOG.critical("another watcher is already running for %s", cfg.repo_dir)
        return 1

    LOG.info(
        "watching %s (%s) for releases; window %s–%s %s; every %ss",
        cfg.github_repo if cfg.release_source == "github" else cfg.git_url,
        cfg.release_source,
        cfg.window_start.strftime("%H:%M"),
        cfg.window_end.strftime("%H:%M"),
        cfg.timezone.key,
        cfg.poll_seconds,
    )

    if args.once:
        try:
            check_once(cfg, state, force_window=args.force)
            return 0
        except DeployError as exc:
            LOG.error("%s", exc)
            return 1

    failures = 0
    while not STOP.is_set():
        try:
            check_once(cfg, state)
            failures = 0
            delay = cfg.poll_seconds if in_window(cfg) else min(seconds_until_window(cfg), 6 * 3600)
        except DeployError as exc:
            failures += 1
            LOG.error("%s", exc)
            delay = min(cfg.poll_seconds * (2 ** min(failures - 1, 4)), 3600)
        except Exception:  # never let one bad iteration kill the watcher
            failures += 1
            LOG.exception("unexpected error")
            delay = min(cfg.poll_seconds * (2 ** min(failures - 1, 4)), 3600)
        LOG.debug("sleeping %ss", delay)
        STOP.wait(delay)
    LOG.info("watcher stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
