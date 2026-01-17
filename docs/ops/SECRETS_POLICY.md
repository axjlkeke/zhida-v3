# 密钥与凭据策略（Secrets Policy）

## 1. 原则

- 仓库内 **禁止** 存放明文密钥、密码、私钥
- 仅允许提交 `.env.example`（占位，无真实值）
- 生产密钥存放在密码管理器中
- 服务器上的 `.env` 与数据库密码 **禁止** 进入 GitHub
- 数据库仅在服务器本机 Docker 中运行，凭据仅保存于服务器 `.env`

## 2. 密钥存放引用（示例）

- 服务器 SSH 密钥：密码管理器 `zhida/ops/ssh-key`
- Nginx 证书相关信息：密码管理器 `zhida/ops/certbot`
- 数据库连接串：密码管理器 `zhida/prod/database-url`
- API 服务环境变量：密码管理器 `zhida/prod/zhida-api-env`

> 仅记录引用名，不记录任何明文内容。
