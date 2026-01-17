# 架构说明（Architecture）

## 1. 部署拓扑（最小版）

- 前端：Vercel（Next.js，仓库 `axjlkeke/zhida-v3`）
- 后端：云服务器 + Docker（仓库 `axjlkeke/zhida-api`）
- 访问路径：客户端 → `https://api-v3.zhidasihai.cn`（Nginx 443）→ `127.0.0.1:3001`（容器）

```
Internet
  │
  ▼
Vercel (zhida-v3)
  │ HTTPS
  ▼
Nginx (443)  ──>  zhida-api container (127.0.0.1:3001)
```

## 2. 服务器目录约定

- `/opt/zhida/infra`：基础设施（Postgres docker-compose）
- `/opt/zhida/zhida-api`：后端代码（git clone）
- `/opt/zhida/backups`：数据库备份
- `/etc/nginx/sites-available/zhida-api-v3`：Nginx 配置
- `/opt/zhida/zhida-v3`：**不强制**（前端由 GitHub + Vercel 交付）

## 3. 关键安全边界

- Postgres 仅绑定 `127.0.0.1:5432`
- API 仅绑定 `127.0.0.1:3001`
- 公网仅开放 `80/443`（由 Nginx 终结 TLS）
- 服务器安全组仅开放 `22/80/443`

## 4. 域名与证书

- API 域名：`api-v3.zhidasihai.cn`
- 证书：Certbot 自动续签（需定期 dry-run 验证）

## 5. CORS 策略

- 后端通过 `CORS_ALLOW_ORIGINS` 配置白名单
- 默认允许：`http://localhost:3000`、`https://*.vercel.app`、`https://app.<your-domain>`
