# 贡献指南 | Contributing Guide

感谢你对 MoodTune 的兴趣！我们欢迎所有形式的贡献。

Thank you for your interest in MoodTune! We welcome all forms of contributions.

## 🌟 贡献方式 | Ways to Contribute

### 1. 报告 Bug | Report Bugs

如果你发现了 Bug，请在 Issues 中创建一个新的 issue，并包含以下信息：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 截图（如有）
- 环境信息（浏览器、操作系统）

### 2. 提出功能建议 | Feature Requests

我们很乐意听取你的想法！请在 Issues 中使用 `[IDEA]` 或 `[Feature Request]` 标签。

### 3. 提交代码 | Submit Code

#### 开发环境设置 | Development Setup

```bash
# 克隆仓库
git clone https://github.com/Nick-Happy/moodtune.git
cd moodtune

# 安装依赖
npm install

# 复制环境变量
cp .env.local.example .env.local

# 配置你的 Supabase 凭据
# 编辑 .env.local

# 启动开发服务器
npm run dev
```

#### 代码规范 | Code Style

- 使用 TypeScript
- 遵循 ESLint 配置
- 组件使用函数式写法
- 使用 Tailwind CSS 编写样式
- 提交信息使用语义化格式

#### 提交流程 | Pull Request Process

1. Fork 仓库
2. 创建功能分支
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. 进行更改并提交
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
4. 推送到你的 Fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. 创建 Pull Request

#### Commit 消息规范 | Commit Message Convention

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响代码运行的变动）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

示例：
```
feat: 添加心情标签功能
fix: 修复热力图日期显示错误
docs: 更新部署文档
```

### 4. 改进文档 | Improve Documentation

文档同样重要！你可以：

- 修复错别字
- 改进说明
- 添加使用示例
- 翻译文档

### 5. 分享和推广 | Share and Promote

- ⭐ 给项目 Star
- 📢 在社交媒体分享
- 📝 写使用教程或博客

## 📋 Issue 和 PR 模板 | Templates

### Bug Report 模板

```markdown
## 问题描述
简要描述遇到的问题

## 复现步骤
1. 进入 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为
描述你期望发生的事情

## 实际行为
描述实际发生的事情

## 截图
如果适用，添加截图

## 环境信息
- 浏览器：[例如 Chrome 120]
- 操作系统：[例如 Windows 11]
```

### Feature Request 模板

```markdown
## 功能描述
清晰简洁地描述你想要的功能

## 使用场景
描述这个功能会在什么场景下使用

## 可能的解决方案
如果你有想法，描述可能的实现方式

## 补充信息
添加任何其他相关信息或截图
```

## 🏷️ Issue 标签说明 | Issue Labels

| 标签 | 描述 |
|------|------|
| `bug` | Bug 报告 |
| `enhancement` | 功能改进 |
| `feature` | 新功能 |
| `documentation` | 文档相关 |
| `good first issue` | 适合新手 |
| `help wanted` | 需要帮助 |
| `question` | 问题咨询 |

## 💬 交流 | Communication

- GitHub Issues: 报告 Bug 和功能建议
- GitHub Discussions: 一般性讨论

## 📜 行为准则 | Code of Conduct

请保持友善和尊重。我们致力于为每个人提供一个友好、安全和欢迎的环境。

---

再次感谢你的贡献！🎉

Thank you again for your contribution! 🎉
