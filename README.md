# 🎵 MoodTune 心声日记

> 用音乐记录每一天的心情，AI 陪你看见情绪的轨迹

[English](#english) | [中文](#中文)

---

<a name="中文"></a>

## ✨ 项目简介

MoodTune 是一款将**音乐**与**心情记录**完美融合的 Web 应用。每当你想记录当下的感受时，只需选择一首歌、写下几句话，AI 就能帮你分析情绪，陪你聊天，并随着时间生成独特的情绪洞察报告。

### 🎯 为什么做这个项目？

- 📝 传统日记太单调，加入音乐让记忆更鲜活
- 🎭 现代人需要一个安全的情绪出口
- 🤖 AI 不仅能分析，更能陪伴
- 📊 看见自己的情绪模式，更好地了解自己

## 🚀 功能特性

### 核心功能

| 功能 | 描述 |
|------|------|
| 🎵 **音乐心情日记** | 粘贴音乐链接，自动解析歌曲信息，配合文字记录当下心情 |
| 🎨 **五色心情** | 开心(金色)、平静(蓝色)、忧伤(紫色)、燃/激动(红色)、治愈(绿色) |
| 🤖 **AI 心情识别** | 根据文字内容智能分析情绪，支持多家 AI 服务商 |
| 💬 **AI 陪聊** | 温暖的 AI 倾听者，随时陪你聊天 |
| 📊 **情绪热力图** | 类似 GitHub 贡献图，一眼看清全年心情分布 |
| 📻 **心情电台** | 随机播放历史记录中的音乐，回味过去的心情 |
| 📈 **情绪洞察** | AI 分析你一段时间的情绪模式，给出个性化建议 |

### 技术亮点

- 🔐 **完整账号系统** - Supabase Auth，支持邮箱注册登录
- ☁️ **云端同步** - 数据实时同步，多设备无缝使用
- 🎨 **现代 UI** - 毛玻璃效果、流畅动画、响应式设计
- 🔌 **多 AI 接入** - 支持 OpenAI、Claude、智谱、通义千问，用户自选
- 🔒 **隐私优先** - API Key 存储在用户自己的设置中

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 14 (App Router) |
| **样式** | Tailwind CSS + 自定义主题 |
| **UI 组件** | 自研组件库 (基于 CVA) |
| **动画** | Framer Motion |
| **后端服务** | Supabase (PostgreSQL + Auth + Realtime) |
| **AI 服务** | OpenAI / Anthropic Claude / 智谱 GLM / 通义千问 |
| **部署** | Vercel |

## 📦 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm
- Supabase 账号（免费）

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/moodtune.git
cd moodtune
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# Supabase 配置 - 在 https://supabase.com 创建项目获取
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 配置 Supabase 数据库

1. 登录 [Supabase](https://supabase.com) 创建新项目
2. 进入 SQL Editor
3. 运行 `supabase/schema.sql` 中的 SQL 脚本

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 🎉

## 🚀 部署指南

### 部署到 Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/moodtune)

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署完成！

### 其他部署选项

<details>
<summary>Docker 部署</summary>

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t moodtune .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=xxx \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  moodtune
```

</details>

<details>
<summary>自托管部署</summary>

```bash
# 构建
npm run build

# 启动
npm start
```

使用 PM2 守护进程：
```bash
pm2 start npm --name "moodtune" -- start
```

</details>

## 📁 项目结构

```
moodtune/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── ai/            # AI 相关接口
│   │   │   ├── auth/          # 认证回调
│   │   │   └── music/         # 音乐解析
│   │   ├── auth/              # 登录/注册页面
│   │   ├── chat/              # AI 聊天页面
│   │   ├── diary/             # 日记主页面
│   │   ├── heatmap/           # 热力图页面
│   │   ├── insights/          # 情绪洞察页面
│   │   ├── radio/             # 心情电台页面
│   │   └── settings/          # 设置页面
│   ├── components/            # React 组件
│   │   └── ui/               # 基础 UI 组件
│   ├── lib/                   # 工具库
│   │   ├── ai/               # AI 服务封装
│   │   ├── music/            # 音乐解析
│   │   └── supabase/         # Supabase 客户端
│   └── types/                 # TypeScript 类型
├── supabase/
│   └── schema.sql            # 数据库 Schema
└── public/                    # 静态资源
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 贡献方向

- 🐛 修复 Bug
- ✨ 新增功能
- 📝 完善文档
- 🌐 国际化翻译
- 🎨 UI/UX 改进

## 💡 未来规划 & 灵感征集

我们有一些想法，也在寻找更多灵感！

### 已规划功能

- [ ] 📱 PWA 支持 - 离线使用、添加到主屏幕
- [ ] 🌍 多语言支持 - i18n 国际化
- [ ] 📤 数据导出 - 导出为 JSON/PDF
- [ ] 🏷️ 标签系统 - 为心情记录添加自定义标签
- [ ] 📅 日历视图 - 按日历展示心情记录

### 灵感征集 🎨

我们特别期待社区的创意！以下是一些可能的方向：

#### 音乐相关
- 🎼 **心情歌单生成** - 根据近期心情自动生成 Spotify/网易云歌单
- 🎵 **音乐推荐引擎** - 基于历史偏好推荐适合当前心情的歌曲
- 🎤 **歌词情感分析** - 分析所选歌曲的歌词情感是否匹配

#### AI 增强
- 🧠 **情绪预测** - 根据历史模式预测情绪波动
- 📊 **周期性分析** - 发现情绪与工作日/季节/天气的关联
- 💌 **AI 写信** - 让 AI 以特定口吻给未来的自己写信

#### 社交功能
- 👥 **匿名树洞** - 匿名分享心情，获得陌生人的温暖回复
- 🎁 **心情漂流瓶** - 发送和接收随机用户的心情分享
- 🏆 **心情挑战** - "连续7天记录开心事"等小挑战

#### 创意玩法
- 🎨 **AI 绘画** - 根据心情生成艺术图像
- 📖 **年度报告** - 生成精美的年度心情回顾
- 🌙 **睡前故事** - AI 根据当天心情生成睡前故事
- 🎬 **心情电影推荐** - 推荐适合当前心情的电影

### 如何提出新想法？

1. 在 [Issues](https://github.com/YOUR_USERNAME/moodtune/issues) 中创建 `feature request`
2. 使用 `[IDEA]` 标签
3. 描述你的想法和使用场景

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代品
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - React 动画库
- [Lucide](https://lucide.dev/) - 精美图标库

---

<a name="english"></a>

## English

### 🎵 MoodTune - Music Mood Diary

A web application that combines music with mood journaling. Record your feelings with a song, let AI analyze your emotions, chat with an AI companion, and discover insights about your emotional patterns over time.

### Features

- 🎵 Music-powered mood journaling
- 🎨 Five mood colors (Happy, Calm, Sad, Energetic, Healing)
- 🤖 AI mood detection (OpenAI, Claude, Zhipu, Qwen)
- 💬 AI companion chat
- 📊 Annual mood heatmap
- 📻 Mood radio (random playback from history)
- 📈 AI-powered emotional insights

### Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/moodtune.git
cd moodtune
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### License

MIT

---

<p align="center">
  Made with ❤️ by the MoodTune Team
</p>

<p align="center">
  <a href="https://github.com/YOUR_USERNAME/moodtune/stargazers">⭐ Star us on GitHub</a>
</p>
