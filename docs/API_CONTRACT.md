# API 契约（M0骨架）

## 系统健康检查
### GET `/health`
- 响应：`{ ok: true, service: "zhida-api", version: "x.y.z", time: "ISO" }`

### GET `/version`
- 响应：`{ version: "x.y.z", gitCommit?: "<hash>" }`

## Auth（模拟）
### POST `/api/auth/mock`
- 请求：`{ role: "admin|coach|student", name?: string }`
- 响应：`{ ok: true, role, name }`

### POST `/api/auth/logout`
- 响应：`{ ok: true }`

## 说明
- M0 仅做“登录/权限骨架”。
- MVP 阶段再补充岗位/学生/匹配相关接口。

## MVP 接口占位（待实现）
### GET `/jobs`
- 查询参数：`keyword?`, `city?`, `education?`, `page?`, `pageSize?`
- 响应：`{ items: Job[], total: number }`

### POST `/student-profiles`
- 请求：`StudentProfileInput`
- 响应：`{ ok: true, id }`

### POST `/match`
- 请求：`{ studentId, topN?: number }`
- 响应：`{ results: MatchResult[] }`
