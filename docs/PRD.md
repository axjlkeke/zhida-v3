# 职达教育-央国企求职SaaS PRD（M0/MVP骨架）

## 1. 目标与范围
- 目标：完成 M0（仓库初始化 + 登录/权限骨架 + Postgres 接入占位 + docs SSOT + 部署联通验证）。
- MVP 闭环：岗位导入 → 学生画像 → 匹配推荐 → 交付清单 → 班主任审核发送。

## 2. MVP 范围（后续实现）
- 岗位导入（CSV/Excel）+ 去重 + 列表检索
- 学生画像建档 + 简历上传存储
- 匹配引擎 v0（硬过滤 + 软排序）
- 交付清单（Top N + 理由/风险）
- 班主任审核工作台

## 3. 非目标（M0不做）
- JD 拆解、简历优化、企业画像、offer 概率、薪资监控、6维测评
- Stripe 真支付

## 4. 页面清单（M0）
- `/login`：模拟登录/选择角色
- `/dashboard`：角色入口导航
- `/admin` `/coach` `/student`：权限示例页
- `/status`：部署联通状态页（显示后端 `/health` 结果）

## 5. M0 认证说明
- M0 使用本地模拟登录（localStorage）作为权限骨架占位。
- MVP 前替换为真实认证（NextAuth 或 Supabase Auth）。

## 6. 待确认（Backlog）
- 真实认证方案（NextAuth 或 Supabase Auth）
- 权限矩阵与细分功能
- 后端正式域名与 HTTPS 配置
