# M1-Lite 规格说明（后端独立版）

## 1. 目标

- 后端仓库独立：`axjlkeke/zhida-api`
- Postgres 仅本机回环访问
- 提供岗位导入、学生画像、匹配、导出 API

## 2. 核心接口

### GET `/health`
- 响应：`{ ok: true, service, version, time }`

### POST `/jobs/import`
- 类型：`multipart/form-data`
- 字段：`file`（CSV）
- 去重规则：
  - 优先使用 `source_url` 唯一
  - 否则使用 `hash(company + title + city + deadline)`

### GET `/jobs`
- 查询：`page?`, `pageSize?`, `keyword?`, `city?`

### POST `/students`
- 请求：`StudentProfileInput`

### GET `/students/:id`
- 响应：`StudentProfile`

### POST `/match/run?studentId=...`
- 输出：`MatchResult[]`

### GET `/match/results?studentId=...`
- 输出：`MatchResult[]`

### GET `/match/export?studentId=...&format=csv|xlsx|pdf`
- 导出三种格式

## 3. 匹配规则（无模型）

### 硬过滤
- 学历、应届/社招、政治面貌、地区

### 软评分
- 专业关键词命中数
- 城市偏好命中
- `jd_text` 关键词命中

### 输出约束
- `reasons` 必须是可解释字符串数组

## 4. CSV 格式

### sample_jobs.csv
- `company`
- `title`
- `city`
- `education_required`
- `major_required`
- `political_required`
- `deadline`
- `source_url`
- `jd_text`

### sample_students.csv
- `name`
- `education`
- `major`
- `political_status`
- `grad_type`
- `region_preferences`

## 5. 验收步骤

1. 上传 `sample_jobs.csv` 至 `/jobs/import`
2. 创建学生档案 `/students`
3. 调用 `/match/run?studentId=...` 返回结果
4. 导出 `/match/export?studentId=...&format=csv|xlsx|pdf`
5. `/health` 返回 `ok: true`
