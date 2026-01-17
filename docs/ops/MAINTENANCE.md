# 运维与维护（Maintenance）

## 1. 例行检查（建议每周）

- 执行 `OPS_RUNBOOK.md` 的“一键验收”步骤
- 检查证书续签 dry-run 是否通过
- 检查 Nginx 错误日志是否有异常峰值
- 检查数据库备份脚本是否执行成功（`/opt/zhida/backups/cron.log`）

## 2. 变更管理

- 后端发布：统一按 `OPS_RUNBOOK.md` 的“标准发布”执行
- Nginx 配置变更后必须 `nginx -t` 并 `reload`
- 发布完成后必须验收 `/health`

## 3. 回滚策略（最小化）

- 使用上一个镜像重新启动容器
- 如无镜像版本管理：重新 `git checkout <tag>` 后构建镜像

## 4. 紧急故障处理

- 优先确认安全边界（`docker port zhida-api` 绑定是否为 `127.0.0.1`）
- 查看 `docker logs` 和 `nginx error.log`
- 必要时重启容器与 Nginx
- 数据库异常时优先查看 `zhida-postgres` 容器状态与日志
