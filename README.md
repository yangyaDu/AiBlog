# DevFolio AI - Next Gen Programmer Portfolio

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

DevFolio AI 是一个极具未来感的个人技术作品集网站。它不仅仅是一个静态展示页，更集成了 Google Gemini 大模型，提供智能 AI 助手（数字替身）和博客内容 AI 摘要功能。

项目采用现代化的前后端分离架构，追求极致的性能和视觉体验。

## 📂 项目结构 (Project Structure)

项目采用了 Monorepo 风格的目录结构，将前后端清晰分离：

```text
/ (Root)
├── index.html         # Web 应用入口
├── index.tsx          # Angular 启动文件 (Bootstrapper)
├── frontend/          # 🎨 前端项目 (Frontend Source)
│   └── src/           # Angular 组件、服务与逻辑
└── backend/           # ⚡ 后端项目 (Elysia & Bun)
    ├── src/           # 后端源代码
    ├── db/            # 数据库配置
    └── ...
```

---

## 🎨 前端 (Frontend)

前端代码位于 `frontend/` 目录，致力于打造流畅、沉浸式的用户体验。

### 核心技术栈
- **Framework**: **Angular v21+** (Zoneless Mode)
  - 彻底移除了 `zone.js`，使用最新的 **Signals** 进行细粒度的状态管理。
- **Styling**: **Tailwind CSS**
- **AI Integration**: **Google GenAI SDK**
- **Markdown**: `marked` + `prismjs`

### 核心功能
1.  **AI 数字替身**: 基于 Gemini 的智能问答助手。
2.  **智能博客摘要**: 自动生成技术文章摘要。
3.  **沉浸式 UI**: Glassmorphism 设计风格。

---

## ⚡ 后端 (Backend)

后端代码位于 `backend/` 目录，专注于高性能 API 服务。

### 核心技术栈
- **Runtime**: **Bun**
- **Framework**: **ElysiaJS**
- **Database**: **SQLite** + **Drizzle ORM**
- **Auth**: **JWT**

---

## 🚀 快速开始 (Getting Started)

### 1. 启动后端
```bash
cd backend
bun install
bun run db:push
bun dev
```
后端服务运行在 `http://localhost:3000`。

### 2. 启动前端
前端通过根目录的配置启动，但在逻辑上位于 `frontend/` 目录。
```bash
# 在根目录下
npm install
npm start
```
前端运行在 `http://localhost:4200`。

---

Designed & Built with ❤️ by [Your Name]
