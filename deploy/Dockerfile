# syntax=docker/dockerfile:1
# Release watcher: Docker CLI + compose plugin (from docker:cli) plus Python and git.
FROM docker:cli
RUN apk add --no-cache python3 git tzdata
COPY auto_deploy.py /opt/lsm/auto_deploy.py
# Runs as the host user (compose `user:`), so HOME must be writable
ENV HOME=/tmp \
    DOCKER_CONFIG=/tmp/.docker \
    PYTHONUNBUFFERED=1 \
    GIT_CONFIG_COUNT=1 \
    GIT_CONFIG_KEY_0=safe.directory \
    GIT_CONFIG_VALUE_0=*
ENTRYPOINT ["python3", "/opt/lsm/auto_deploy.py"]
