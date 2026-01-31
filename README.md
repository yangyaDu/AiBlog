
# DevFolio AI - Next Gen Programmer Portfolio

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech](https://img.shields.io/badge/Stack-Angular%20%7C%20Bun%20%7C%20Gemini-purple)

**DevFolio AI** is a futuristic personal portfolio website designed for developers. It goes beyond a static showcase by integrating the **Google Gemini API** to create an intelligent "Digital Avatar" that can answer questions about your skills, experience, and projects in real-time.

The project features a modern **Monorepo** architecture with strict **RESTful API** standards and high-performance tooling.

---

## 📂 Project Structure

The project is organized as a Monorepo, separating the high-performance backend from the interactive frontend:

```text
/ (Root)
├── index.html         # Frontend Entry Point
├── frontend/          # 🎨 Angular Frontend
│   └── src/           # Components, Services (Signals), Styles
└── backend/           # ⚡ Bun & Elysia Backend
    ├── src/           # API Routes, Controllers, Models
    ├── db/            # SQLite Schema & Drizzle Config
    └── drizzle/       # Database Migrations
```

---

## 🎨 Frontend (Client)

Located in `frontend/`, designed for immersion and performance.

### Tech Stack
- **Framework**: **Angular v18+** (Zoneless Architecture)
  - Uses **Signals** exclusively for state management.
  - No `zone.js` for reduced bundle size and better performance.
- **Styling**: **Tailwind CSS** (Utility-first)
- **AI**: **Google GenAI SDK** (Gemini 2.5 Flash)
- **Visualization**: `D3.js` (Charts), `PrismJS` (Code Highlighting)
- **Editor**: `EasyMDE` (Markdown Editing)

### Key Features
1.  **AI Digital Avatar**: A chat interface where an AI persona answers questions about the portfolio owner.
2.  **Smart Blog**: Includes AI-powered article summarization and auto-generated Table of Contents.
3.  **Glassmorphism UI**: A refined, apple-esque dark mode aesthetic.

---

## ⚡ Backend (Server)

Located in `backend/`, optimized for low latency and developer experience.

### Tech Stack
- **Runtime**: **Bun v1.1+** (Fast JS/TS Runtime)
- **Framework**: **ElysiaJS v1.0+** (End-to-end type safety)
- **Database**: **SQLite** (via `bun:sqlite`)
- **ORM**: **Drizzle ORM v0.31+**
- **Validation**: **TypeBox** (Built-in via Elysia)
- **Docs**: **Swagger/OpenAPI** (Auto-generated at `/swagger`)

### API Design
The API follows strict **RESTful** conventions:
- **POST/PUT**: Data is passed via the JSON **Body**, not URL parameters.
- **GET**: Data is filtered via **Query** parameters.
- **Response Format**: Unified standard format for all endpoints:
  ```json
  {
    "code": 0,          // 0 = Success, >0 = Error
    "message": "string",
    "data": { ... }     // Payload
  }
  ```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20+) or **Bun** (v1.1+)
- **Google Gemini API Key** (Set as `API_KEY` env var)

### 1. Start Backend
The backend runs on port `3000`.

```bash
cd backend

# Install dependencies
bun install

# Push database schema to local SQLite file
bun run db:push

# Start server in development mode
bun dev
```

### 2. Start Frontend
The frontend runs on port `4200` (default for Angular) or serving setup.

```bash
# In root directory
npm install
npm start
```

### 3. Access
- **Web App**: `http://localhost:4200`
- **API Docs**: `http://localhost:3000/swagger`

---

## 🛠️ Configuration

### Environment Variables
- `API_KEY`: Google Gemini API Key (Required for Chat & Summary features).
- `JWT_SECRET`: Secret key for authentication tokens.

---

Designed & Built with ❤️ for the Dev Community.
