# 运行手册（OPS Runbook）

> 目的：标准化线上验收、发布、排障流程，确保安全边界与可回滚。

## 0. 服务器登录

```bash
ssh ubuntu@82.157.16.151
# 或使用 root：
# ssh root@82.157.16.151
```

## 1. 一键验收（线上链路与安全边界）

目标：容器只监听 `127.0.0.1:3001`，公网只走 Nginx `443`，证书续签正常。

```bash
# 1) 容器状态
sudo docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# 2) 容器端口绑定（安全关键）
sudo docker port zhida-api

# 3) 本机直连容器健康检查
curl -sS http://127.0.0.1:3001/health && echo

# 4) 公网入口健康检查
curl -sS https://api-v3.zhidasihai.cn/health && echo

# 5) Nginx 配置与服务状态
sudo nginx -t
sudo systemctl status nginx --no-pager

# 6) 最近 Nginx 错误日志
sudo tail -n 80 /var/log/nginx/error.log

# 7) 证书续签 dry-run
sudo certbot renew --dry-run
```

验收通过标准：
- `docker port zhida-api` 输出包含 `3001/tcp -> 127.0.0.1:3001`
- 两个 `curl` 返回 `ok: true`
- `nginx -t` 通过，`nginx` 为 `active`
- `certbot renew --dry-run` 成功

## 2. 标准发布（更新后端代码并重启容器）

```bash
cd /opt/zhida/zhida-api

# 拉最新代码（只允许 fast-forward）
git pull --ff-only

# 构建新镜像
sudo docker build -t zhida-api:latest .

# 停旧容器
sudo docker rm -f zhida-api 2>/dev/null || true

# 启新容器（绑定 127.0.0.1，使用 env-file）
sudo docker run -d --name zhida-api --restart unless-stopped \
  --env-file /opt/zhida/zhida-api/.env \
  -p 127.0.0.1:3001:3001 \
  zhida-api:latest

# 看启动日志
sudo docker logs -n 120 zhida-api

# 立即验收
curl -sS http://127.0.0.1:3001/health && echo
curl -sS https://api-v3.zhidasihai.cn/health && echo
```

## 3. 本机数据库（Postgres）部署与绑定（仅回环）

> 目标：数据库不对公网开放，仅允许服务器本机访问。

```bash
# 安装 docker compose 插件
sudo docker compose version || (sudo apt-get update -y && sudo apt-get install -y docker-compose-plugin)

# 创建 infra 目录
sudo mkdir -p /opt/zhida/infra
sudo chown -R $USER:$USER /opt/zhida

cd /opt/zhida/infra

cat > docker-compose.yml <<'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: zhida-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: zhida
      POSTGRES_USER: zhida
      POSTGRES_PASSWORD: CHANGE_ME_STRONG_PASSWORD
    # 关键：只绑定到本机回环，公网无法访问 5432
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - zhida_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zhida -d zhida"]
      interval: 5s
      timeout: 5s
      retries: 20

volumes:
  zhida_pgdata:
EOF

# 生成强密码（只在服务器保存）
python3 - <<'PY'
import secrets, string
alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
pwd = ''.join(secrets.choice(alphabet) for _ in range(28))
print(pwd)
PY

# 替换 docker-compose.yml 里的 CHANGE_ME_STRONG_PASSWORD
nano docker-compose.yml

# 启动数据库
sudo docker compose up -d

# 验证健康
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
sudo docker logs -n 50 zhida-postgres
sudo docker exec -it zhida-postgres psql -U zhida -d zhida -c "select now();"
```

## 4. 后端环境变量：DATABASE_URL（本机 DB）

```bash
sudo mkdir -p /opt/zhida/zhida-api
sudo chown -R $USER:$USER /opt/zhida/zhida-api

cat >> /opt/zhida/zhida-api/.env <<'EOF'
# Local PostgreSQL (Docker) - only accessible on the server
DATABASE_URL="postgresql://zhida:YOUR_DB_PASSWORD@127.0.0.1:5432/zhida"
EOF

# 把 YOUR_DB_PASSWORD 替换成 docker-compose.yml 中的 POSTGRES_PASSWORD
nano /opt/zhida/zhida-api/.env
```

## 5. 数据库备份（每日）

```bash
sudo mkdir -p /opt/zhida/backups
sudo chown -R $USER:$USER /opt/zhida/backups

cat > /opt/zhida/backups/pg_backup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
TS=$(date +"%Y%m%d-%H%M%S")
OUT="/opt/zhida/backups/zhida-${TS}.sql.gz"
docker exec zhida-postgres pg_dump -U zhida -d zhida | gzip > "${OUT}"
# 保留最近14天
find /opt/zhida/backups -name "zhida-*.sql.gz" -mtime +14 -delete
echo "Backup written to ${OUT}"
EOF
chmod +x /opt/zhida/backups/pg_backup.sh

# 立刻试跑
/opt/zhida/backups/pg_backup.sh

# 每天凌晨 3 点自动备份
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/zhida/backups/pg_backup.sh >/opt/zhida/backups/cron.log 2>&1") | crontab -
```

## 6. Nginx 改配置后的标准动作

> 配置文件位置（只读提示）：`/etc/nginx/sites-available/zhida-api-v3`

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
```

## 7. 快速排障命令（按顺序）

```bash
# 容器状态与端口
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
sudo docker port zhida-api

# 容器日志
sudo docker logs -n 200 zhida-api

# Nginx 错误日志
sudo tail -n 200 /var/log/nginx/error.log

# 端口监听状态
sudo ss -lntp | egrep ':80|:443|:3001' || true
```

## 8. 安全硬要求（长期保持）

- 腾讯云安全组仅允许入站：`22 / 80 / 443`
- **严禁开放 3001**（仅允许服务器本机回环访问）
- **严禁开放 5432**（数据库仅允许服务器本机回环访问）

## 9. 最终版执行命令（本机 DB 版）

> 用于一键落地“前端不动、后端独立、DB 本机 docker”的最终设计。

```bash
# 目标：稳定优先的最终工程设计落地（前端不动、后端独立、DB本机docker）
# 现状：
# - 前端仓库：https://github.com/axjlkeke/zhida-v3 （Vercel 已部署）
# - API 域名：https://api-v3.zhidasihai.cn
# - 服务器：82.157.16.151 Ubuntu 22.04
# - 安全：公网仅 22/80/443；3001/5432 严禁对外

## A. 固化服务器目录结构
# /opt/zhida/infra        # postgres compose
# /opt/zhida/zhida-api    # 后端仓库
# /opt/zhida/backups      # pg备份
# /etc/nginx/sites-available/zhida-api-v3 # nginx站点

ssh ubuntu@82.157.16.151

sudo apt-get update -y
sudo apt-get install -y docker-compose-plugin git curl ca-certificates
sudo mkdir -p /opt/zhida/infra /opt/zhida/backups
sudo chown -R $USER:$USER /opt/zhida

cd /opt/zhida/infra

cat > docker-compose.yml <<'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: zhida-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: zhida
      POSTGRES_USER: zhida
      POSTGRES_PASSWORD: CHANGE_ME_STRONG_PASSWORD
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - zhida_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zhida -d zhida"]
      interval: 5s
      timeout: 5s
      retries: 20
volumes:
  zhida_pgdata:
EOF

python3 - <<'PY'
import secrets, string
alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
print(''.join(secrets.choice(alphabet) for _ in range(28)))
PY

nano docker-compose.yml

sudo docker compose up -d
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
sudo docker exec -it zhida-postgres psql -U zhida -d zhida -c "select now();"

cd /opt/zhida
git clone https://github.com/axjlkeke/zhida-api.git
cd /opt/zhida/zhida-api

cat > /opt/zhida/zhida-api/.env <<'EOF'
PORT=3001
DATABASE_URL="postgresql://zhida:YOUR_DB_PASSWORD@127.0.0.1:5432/zhida"
CORS_ALLOW_ORIGINS=http://localhost:3000,https://*.vercel.app
EOF
nano /opt/zhida/zhida-api/.env

sudo docker build -t zhida-api:latest .
sudo docker rm -f zhida-api 2>/dev/null || true
sudo docker run -d --name zhida-api --restart unless-stopped \
  --env-file /opt/zhida/zhida-api/.env \
  -p 127.0.0.1:3001:3001 \
  zhida-api:latest

curl http://127.0.0.1:3001/health
curl https://api-v3.zhidasihai.cn/health

cat > /opt/zhida/backups/pg_backup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
TS=$(date +"%Y%m%d-%H%M%S")
OUT="/opt/zhida/backups/zhida-${TS}.sql.gz"
docker exec zhida-postgres pg_dump -U zhida -d zhida | gzip > "${OUT}"
find /opt/zhida/backups -name "zhida-*.sql.gz" -mtime +14 -delete
echo "Backup written to ${OUT}"
EOF
chmod +x /opt/zhida/backups/pg_backup.sh
/opt/zhida/backups/pg_backup.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/zhida/backups/pg_backup.sh >/opt/zhida/backups/cron.log 2>&1") | crontab -
```
