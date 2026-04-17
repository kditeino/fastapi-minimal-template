#!/usr/bin/env bash
# 在 .142 部署 Celery worker + beat 容器
# 前置:fba-backend 已经部署(fba-net + backend.env 已就绪)
# 用法:ssh kdit@192.168.0.142,然后 bash deploy-celery.sh

set -euo pipefail
export PATH=/usr/local/bin:$PATH

DEPLOY_DIR=/Users/kdit/fba-deploy
BACKEND_DIR="$DEPLOY_DIR/api"
ENV_FILE="$DEPLOY_DIR/backend.env"
NETWORK=fba-net

cd "$BACKEND_DIR"

echo "[1/4] 构建 worker 镜像"
docker build --target fba_celery_worker -t fba-celery-worker:latest .

echo "[2/4] 构建 beat 镜像"
docker build --target fba_celery_beat -t fba-celery-beat:latest .

echo "[3/4] 启动 worker 容器"
docker rm -f fba-celery-worker 2>/dev/null || true
docker run -d --name fba-celery-worker \
    --network $NETWORK \
    --add-host host.docker.internal:host-gateway \
    --env-file "$ENV_FILE" \
    --restart unless-stopped \
    fba-celery-worker:latest

echo "[4/4] 启动 beat 容器"
docker rm -f fba-celery-beat 2>/dev/null || true
docker run -d --name fba-celery-beat \
    --network $NETWORK \
    --add-host host.docker.internal:host-gateway \
    --env-file "$ENV_FILE" \
    --restart unless-stopped \
    fba-celery-beat:latest

echo "---"
docker ps --filter name=fba- --format "table {{.Names}}\t{{.Status}}"
