import subprocess
import time
import logging
import sys
from pathlib import Path
from datetime import datetime, time as dtime
import pytz
import shutil

# ---------------- CONFIG ----------------
BASE_DIR = Path(__file__).parent
REPO_DIR = BASE_DIR / "app"
REPO_URL = "https://github.com/YOUR_ORG/YOUR_REPO.git"  # CHANGE
BRANCH = "release"
CHECK_INTERVAL_SECONDS = 2 * 60 * 60  # 2 hours
IST = pytz.timezone("Asia/Kolkata")
# ----------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(BASE_DIR / "auto_deploy.log"),
        logging.StreamHandler(sys.stdout),
    ],
)

def run(cmd, cwd=None, allow_fail=False):
    result = subprocess.run(
        cmd,
        cwd=cwd,
        shell=True,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0 and not allow_fail:
        raise RuntimeError(result.stderr.strip())
    return result.stdout.strip()

# ---------------- DOCKER CHECKS ----------------

def docker_installed():
    return shutil.which("docker") is not None

def docker_running():
    return run("docker info", allow_fail=True) != ""

def docker_is_linux():
    info = run("docker info")
    return "OSType: linux" in info

# ---------------- GIT OPS ----------------

def clone_if_needed():
    if REPO_DIR.exists():
        return
    logging.info("Cloning repository...")
    run(f"git clone -b {BRANCH} {REPO_URL} {REPO_DIR}")

def has_changes():
    run("git fetch", cwd=REPO_DIR)
    local = run("git rev-parse HEAD", cwd=REPO_DIR)
    remote = run(f"git rev-parse origin/{BRANCH}", cwd=REPO_DIR)
    return local != remote

# ---------------- DEPLOY ----------------

def deploy():
    logging.info("Deploying latest changes safely...")

    run(f"git checkout {BRANCH}", cwd=REPO_DIR)
    run("git reset --hard", cwd=REPO_DIR)
    run("git clean -fd", cwd=REPO_DIR)
    run("git pull", cwd=REPO_DIR)

    run("docker compose down", cwd=REPO_DIR)
    run("docker compose up -d --build", cwd=REPO_DIR)

    logging.info("Deployment completed successfully.")

# ---------------- TIME WINDOW ----------------

def in_allowed_time_window():
    now = datetime.now(IST).time()
    return now >= dtime(22, 0) or now <= dtime(9, 0)

# ---------------- MAIN LOOP ----------------

def main():
    logging.info("Auto-deploy agent started (Windows, release branch).")

    if not docker_installed():
        logging.error("Docker is not installed. Install Docker Desktop manually.")
        sys.exit(1)

    if not docker_running():
        logging.error("Docker Desktop is not running. Start it manually once.")
        sys.exit(1)

    if not docker_is_linux():
        logging.error("Docker is NOT using Linux containers. Switch manually once.")
        sys.exit(1)

    clone_if_needed()

    while True:
        try:
            if in_allowed_time_window():
                logging.info("Within allowed deployment window.")
                if has_changes():
                    logging.info("Changes detected on release branch.")
                    deploy()
                else:
                    logging.info("No changes detected.")
            else:
                logging.info("Outside deployment window. Skipping.")
        except Exception as e:
            logging.error(f"Deploy error: {e}")

        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
