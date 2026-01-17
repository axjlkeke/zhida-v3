# 🚀 项目上下文快速恢复文档

> **使用方法**: 每次开启新对话时，直接对AI说:  
> **"读取 PROJECT_CONTEXT.md,继续上次的工作"**

---

## 📊 项目基本信息

### 项目概况
- **项目名称**: 智达招聘平台 (zhidaweb)
- **技术栈**: 
  - 前端: React 18.3.1 + TypeScript + Vite + Tailwind CSS
  - 后端: NestJS + TypeScript + MySQL
  - AI集成: DeepSeek API
- **代码仓库**: https://github.com/axjlkeke/zhidaweb.git
- **部署平台**: 
  - 前端: Vercel (https://zhidaweb.vercel.app)
  - 后端: 阿里云 (/home/zhidaweb)
- **最新提交**: [查看 Git log]
- **当前分支**: main

### 目录结构
```
zhidaweb/
├── frontend/          # Vite + React 前端
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # 业务服务层
│   │   ├── contexts/      # React Context
│   │   └── types/         # TypeScript类型定义
│   └── dist/              # 构建输出
├── backend/           # NestJS 后端
│   ├── src/
│   │   ├── modules/       # 功能模块
│   │   ├── common/        # 通用代码
│   │   └── main.ts        # 入口文件
│   └── dist/              # 构建输出
└── docs/              # 文档目录（所有.md文件）
```

---

## 🎯 核心功能模块

### 1. 用户系统
- **登录认证**: 支持用户名/密码登录
- **权限管理**: 
  - 超级管理员: admin/admin123
  - 普通用户
- **个人中心**: 简历管理、AI分析、岗位收藏

### 2. AI功能（重点）
- **AI简历分析**: 
  - 文件解析 (PDF/Word)
  - 五维能力评分
  - 优劣势分析
  - 改进建议
- **AI岗位匹配**: 基于简历推荐岗位
- **AI面试系统**: 
  - 11大行业分类
  - 双维度筛选（企业/岗位）
  - 模拟面试对话
  - 题库管理
  - 面经管理

### 3. 岗位管理
- **岗位发布**: 管理员发布岗位
- **岗位筛选**: 
  - 薪资、经验、学历、地点
  - 行业、公司类型
- **岗位收藏**: 用户收藏心仪岗位
- **岗位申请**: 一键投递

### 4. 管理后台
- **Admin Dashboard**: 管理员总览
- **题库管理**: 面试题CRUD
- **面经管理**: 面试经验管理
- **岗位管理**: 发布/编辑/删除岗位

---

## 🔧 关键技术实现

### 前端核心服务
```typescript
// src/services/
- ai-provider.service.ts       // AI服务工厂
- deepseek.provider.ts          // DeepSeek API集成
- file-parser.service.ts        // 文件解析 (PDF/Word)
- resume-analysis.service.ts    // 简历分析算法
- interview-bank.service.ts     // 题库/面经服务
- permission.service.ts         // 权限管理
- user-management.service.ts    // 用户管理
```

### 后端核心模块
```typescript
// backend/src/modules/
- jobs/                         // 岗位模块
- user-profile/                 // 用户资料模块
- ai-analysis/                  // AI分析模块
- auth/                         // 认证模块
```

### 环境变量
```bash
# 前端 (.env)
VITE_DEEPSEEK_API_KEY=sk-xxx   # DeepSeek API密钥
VITE_API_BASE_URL=http://...   # 后端API地址

# 后端 (.env)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=xxx
DATABASE_NAME=zhidaweb
```

---

## 📝 最近完成的任务

### ✅ 已完成 (按时间倒序)

#### 2025-10-31: 部署脚本修复
- 修复部署路径: /root/zhidaweb → /home/zhidaweb
- Git提交: "🔧 修复部署脚本路径"

#### 2025-10-28: 简历分析功能
- 实现五维能力分析
- 创建 ResumeAnalysisSection 组件
- 修复 PDF 解析 worker 加载
- Vercel自动部署成功

#### 2025-10-27: AI面试系统
- 11大行业分类系统
- 双维度筛选（企业/岗位）
- DeepSeek API集成
- 题库+面经管理

#### 2025-10-26: 权限系统升级
- 超级管理员初始化
- User对象重构 AuthContext
- AdminDashboard 创建
- 移除付费限制

---

## ⏳ 待完成任务

### 高优先级
1. **后端 API 真实集成**
   - 连接 MySQL 数据库
   - 实现岗位 CRUD API
   - 实现用户认证 API
   
2. **AI 真实 API 调用**
   - DeepSeek API 生产环境配置
   - 简历分析 API 接入
   - 岗位匹配算法优化

3. **阿里云后端部署**
   - 配置 PM2 自动重启
   - 配置 Nginx 反向代理
   - 配置 SSL 证书

### 中优先级
4. **简历编辑功能**
   - 在线编辑简历
   - 实时预览分析变化
   
5. **岗位匹配推荐**
   - 基于分析结果推荐岗位
   - 显示匹配度百分比

6. **导出功能**
   - PDF 导出分析报告
   - Word 导出完整简历

### 低优先级
7. **简历版本管理**
8. **求职进度跟踪**
9. **企业端功能**

---

## 🚨 已知问题

### 编译警告（非阻塞）
```typescript
// 1. UserProfile.tsx - currentUser类型兼容性
// 影响: 部分个人资料显示逻辑
// 状态: 功能正常，仅类型警告

// 2. AdminPanel.tsx - currentUser比较逻辑  
// 影响: 权限判断
// 状态: 已有 AdminDashboard 替代

// 3. JobDetail.tsx - currentUser参数类型
// 影响: 岗位申请功能
// 状态: 功能正常，类型警告

// 4. AIResumeMatch.tsx - currentUser参数类型
// 影响: AI简历匹配
// 状态: 功能正常，类型警告
```

### 生产环境问题
- **Vercel环境变量**: 需确保 VITE_DEEPSEEK_API_KEY 已配置
- **后端部署**: 路径已修复为 /home/zhidaweb
- **MySQL连接**: 待配置生产数据库

---

## 🔍 快速定位代码

### 查找功能实现
```bash
# AI相关
grep -r "DeepSeek" src/services/
grep -r "resumeAnalysis" src/

# 权限相关
grep -r "UserManagementService" src/services/
grep -r "PermissionService" src/services/

# 岗位相关
grep -r "JobService" backend/src/modules/

# 面试相关
grep -r "InterviewBankService" src/services/
```

### 查找配置文件
```bash
# 前端配置
cat vite.config.ts
cat .env

# 后端配置
cat backend/nest-cli.json
cat backend/.env

# 部署脚本
ls -l deploy-*.sh
cat deploy-to-aliyun.sh
```

---

## 📚 重要文档索引

### 快速参考
- **DO_THIS_NOW.md** - 最新任务和操作指南
- **COMPLETION_SUMMARY.md** - 功能完成总结
- **DEPLOYMENT_SUMMARY.md** - 最新部署报告

### 功能文档
- **AI_QUICK_START.md** - AI功能快速入门
- **AI_RESUME_TEST_GUIDE.md** - 简历分析测试
- **AI_INTERVIEW_COMPLETE.md** - 面试系统完整文档
- **RESUME_ANALYSIS_ENHANCEMENT.md** - 简历分析详细指南

### 部署文档
- **ALIYUN_DEPLOY_GUIDE.md** - 阿里云部署指南
- **ALIYUN_STEP_BY_STEP.md** - 阿里云分步教程
- **DEPLOYMENT_GUIDE.md** - 通用部署指南
- **VERCEL_DEBUG_GUIDE.md** - Vercel调试指南

### 架构文档
- **BACKEND_ARCHITECTURE_PART*.md** - 后端架构文档（8部分）
- **ARCHITECTURE_REVIEW.md** - 架构审查
- **FRONTEND_BACKEND_INTEGRATION_GUIDE.md** - 前后端集成

### 管理文档
- **ADMIN_FEATURES_SUMMARY.md** - 管理员功能总结
- **ADMIN_DEPLOYMENT_GUIDE.md** - 管理员部署指南

---

## 🎬 快速启动命令

### 本地开发
```bash
# 前端开发
npm run dev                    # 启动开发服务器 (localhost:5173)
npm run build                  # 构建生产版本
npm run preview                # 预览生产构建

# 后端开发
cd backend
npm run start:dev              # 启动开发服务器 (localhost:3001)
npm run build                  # 构建后端
npm run start:prod             # 启动生产服务器
```

### Git操作
```bash
# 查看状态
git status
git log --oneline -10          # 最近10次提交

# 提交代码
git add -A
git commit -m "feat: 功能描述"
git push origin main

# 查看远程
git remote -v
```

### 部署操作
```bash
# 前端部署 (Vercel自动)
git push origin main           # 推送后自动部署

# 后端部署 (阿里云)
bash deploy-to-aliyun.sh       # 执行部署脚本
ssh user@aliyun "cd /home/zhidaweb/backend && pm2 restart all"

# 查看部署状态
bash check-status.sh
```

### 调试命令
```bash
# 前端调试
npm run build                  # 检查编译错误
cat dist/index.html            # 查看构建输出

# 后端调试
cd backend && npm run build
node dist/main.js              # 手动启动检查

# 诊断脚本
bash diagnose.sh               # 全面系统诊断
node check_jobs.js             # 检查岗位数据
```

---

## 🧩 数据存储结构

### LocalStorage (前端)
```javascript
// 用户相关
'user'                          // 当前登录用户名
'userRole'                      // 当前用户角色
'users'                         // 所有用户列表
'user_passwords'                // 用户密码映射
'super_admin_initialized'       // 超管初始化标记

// AI相关
'interview_question_bank'       // 面试题库
'interview_experience_bank'     // 面试面经
'interview_sessions'            // 面试会话记录
'deepseek_api_key'              // DeepSeek API密钥

// 简历相关
'resume_{username}'             // 用户简历
'resume_tags_{username}'        // 简历标签
'resume_analysis_{username}'    // 简历分析结果

// 岗位相关
'saved_jobs_{username}'         // 收藏的岗位
'applied_jobs_{username}'       // 已申请的岗位

// 支付相关 (已废弃)
'subscriptionStatus'            // 订阅状态（默认true）
'subscriptionPlan'              // 订阅计划（默认premium）
```

### MySQL数据库 (后端)
```sql
-- 核心表
users                           -- 用户表
jobs                            -- 岗位表
applications                    -- 申请记录表
resumes                         -- 简历表
interview_questions             -- 面试题表
interview_experiences           -- 面经表

-- 关联表
user_saved_jobs                 -- 用户收藏岗位
user_applied_jobs               -- 用户申请岗位
```

---

## 🎓 工作流程

### 新功能开发流程
1. **需求确认** - 理解要实现什么
2. **代码定位** - 使用上面的"快速定位代码"找到相关文件
3. **修改实现** - 编写代码
4. **本地测试** - npm run dev 测试
5. **构建验证** - npm run build 检查错误
6. **提交代码** - git add + commit + push
7. **部署验证** - 等待Vercel部署，测试生产环境

### Bug修复流程
1. **问题复现** - 在本地或生产环境复现
2. **查看日志** - 浏览器Console + 后端日志
3. **定位代码** - grep搜索错误信息
4. **修复测试** - 本地修复并测试
5. **部署验证** - 推送代码，验证修复

### 部署流程
**前端 (Vercel):**
1. git push origin main
2. Vercel自动触发部署 (2-5分钟)
3. 访问 https://zhidaweb.vercel.app 验证

**后端 (阿里云):**
1. bash deploy-to-aliyun.sh
2. SSH登录阿里云验证
3. pm2 list 检查进程状态

---

## 💡 常见问题速查

### Q: AI功能不工作？
**A:** 检查 DeepSeek API Key:
```javascript
// 浏览器Console执行
console.log(localStorage.getItem('deepseek_api_key'))

// 如果为null，需要配置
localStorage.setItem('deepseek_api_key', 'sk-xxx')
```

### Q: 登录失败？
**A:** 超级管理员: admin/admin123
```javascript
// 重置超管密码
localStorage.setItem('super_admin_initialized', 'true')
// 刷新页面重新登录
```

### Q: 部署后代码没更新？
**A:** Vercel缓存问题:
1. 访问 Vercel Dashboard
2. 找到最新部署
3. 点击 "Redeploy" → "Force Redeploy"

### Q: PDF解析失败？
**A:** Worker加载问题:
```typescript
// src/services/file-parser.service.ts 已实现重试机制
// 如果仍失败，尝试Word或纯文本格式
```

### Q: 后端连接失败？
**A:** 检查后端是否运行:
```bash
cd backend && npm run start:dev
# 或阿里云
ssh user@aliyun "pm2 list"
```

---

## 🔐 敏感信息管理

### 不要提交到Git的文件
```
.env                            # 环境变量
.env.local                      # 本地环境变量
backend/.env                    # 后端环境变量
node_modules/                   # 依赖包
dist/                           # 构建输出
*.log                           # 日志文件
```

### 密钥位置
- **DeepSeek API Key**: Vercel环境变量 + localStorage
- **MySQL密码**: 后端.env文件
- **JWT密钥**: 后端.env文件

---

## 📞 快速求助

### 当AI不理解时，提供以下信息：
1. **当前任务**: 你要做什么？
2. **相关文件**: 涉及哪些文件？
3. **错误信息**: Console或终端的错误
4. **预期行为**: 应该怎样？
5. **实际行为**: 现在怎样？

### 示例提示词：
```
我要修复AI简历分析功能。
相关文件: src/services/resume-analysis.service.ts
错误: Console显示 "DeepSeek API调用失败"
预期: 能够成功分析简历并返回五维评分
实际: 分析过程中报错
```

---

## ✅ 使用检查清单

每次启动新对话时，让AI确认：

- [ ] 已读取 PROJECT_CONTEXT.md
- [ ] 已了解项目技术栈
- [ ] 已了解核心功能模块
- [ ] 已了解最近完成的任务
- [ ] 已了解待完成的任务
- [ ] 已了解已知问题
- [ ] 已了解快速定位代码的方法
- [ ] 已了解工作流程

确认后，AI可以直接说：**"项目上下文已恢复，请告诉我接下来要做什么？"**

---

## 🎯 效率提升提示

### 对AI说这些会更高效：
✅ **好的提示**:
- "继续完成待办任务第3项"
- "修复 AIResumeMatch.tsx 的类型警告"
- "查看最近的Git提交，告诉我改了什么"
- "部署到Vercel并验证"

❌ **不好的提示**:
- "帮我做点什么" (太模糊)
- "这个怎么实现" (没说是什么)
- "有bug" (没说在哪里)

### 让AI主动查找：
- "搜索所有包含 DeepSeek 的文件"
- "找到简历分析相关的所有服务"
- "列出所有部署脚本"

---

## 🔄 版本历史快照

### v0.5.0 (2025-10-31) - 当前版本
- ✅ 部署脚本路径修复
- ✅ AI功能完整
- ✅ 权限系统完善
- ⏳ 后端真实API待完成

### v0.4.0 (2025-10-28)
- ✅ 简历分析功能
- ✅ 五维能力评分
- ✅ PDF解析修复

### v0.3.0 (2025-10-27)
- ✅ AI面试系统
- ✅ 题库管理
- ✅ 面经管理

### v0.2.0 (2025-10-26)
- ✅ 权限系统升级
- ✅ 超级管理员
- ✅ 移除付费限制

### v0.1.0 (2025-10-25)
- ✅ 项目初始化
- ✅ 基础框架搭建

---

## 📱 快速联系方式

**项目负责人**: [你的名字]  
**GitHub**: https://github.com/axjlkeke/zhidaweb  
**线上地址**: https://zhidaweb.vercel.app  
**文档位置**: 项目根目录所有.md文件

---

**最后更新**: 2025-10-31  
**文档版本**: v1.0  
**维护者**: AI Assistant

---

# 🚀 开始使用

**每次新对话只需说:**
> "读取 PROJECT_CONTEXT.md，继续上次的工作"

**AI会自动:**
1. 理解项目结构
2. 了解最新进度
3. 识别待完成任务
4. 准备好接收你的指令

**然后你只需说:**
> "完成待办任务第X项" 或 "修复XX问题" 或 "部署到生产环境"

简单、高效、准确！🎯
