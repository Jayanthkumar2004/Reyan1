# Reyan - Real-Time Progressive Web App (PWA) Messaging Platform

**Reyan** is a production-ready, cross-platform Progressive Web Application (PWA) inspired by modern messaging platforms such as WhatsApp. It delivers real-time messaging, offline capabilities, JWT-based security, media management, user presence, group chats, and PWA installation support across Android, Windows, macOS, Linux, iOS, and modern web browsers.

---

## System Architecture

```
                 REYAN PWA
                     |
              REST API / STOMP WebSockets
                     |
                     v
            +------------------+
            |   SPRING BOOT    |
            |     BACKEND      |
            |                  |
            | JWT Auth         |
            | REST Controllers |
            | STOMP Broker     |
            | Presence Mgr     |
            | Media Service    |
            +--------+---------+
                     |
               +-----+-----+
               |           |
               v           v
        +--------------+  +--------------+
        |   SUPABASE   |  |   FIREBASE   |
        |  PostgreSQL  |  |   FCM / Web  |
        |   Storage    |  |     Push     |
        +--------------+  +--------------+
```

- **Frontend (`reyan-pwa`)**: React 18, TypeScript, Vite, Workbox PWA Service Worker, IndexedDB (Dexie.js), STOMPjs WebSocket Client, Responsive CSS Dark/Light Theme System.
- **Backend (`reyan-backend`)**: Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, Spring WebSocket (STOMP), JJWT, BCrypt.
- **Database & Storage**: Supabase PostgreSQL + Supabase Storage (`avatars`, `chat-media`, `documents`).

---

## Features Matrix

### 🔐 Authentication & Identity
- Username & Email Registration / Login
- Stateless JWT Access Token (15m) + Secure Refresh Token (7d)
- Password Hashing via BCrypt
- User Profile customization (Avatar upload, Name, About/Bio, Phone)

### 💬 Real-Time Messaging & Status Ticks
- 1-to-1 Direct Chat & Group Chat creation
- Text, Image, Video, Document/File attachments
- Real-Time STOMP WebSockets (`/ws`, `/app/chat.send`, `/topic/chat/{chatId}`)
- Message Status Ticks: `Sending...`, `✓` Sent, `✓✓` Delivered, `✓✓` Read (Blue Highlight)
- Live Typing Status ("John is typing...")
- Reply preview quotes & jump-to-message linkage
- Context actions: Reply, Copy, Star, Edit, Delete for everyone
- Message search within specific chats or globally

### 📱 PWA & Offline Support
- Web App Manifest (`manifest.json`) supporting standalone display mode & app icons
- Workbox Service Worker (`sw.js`) precaching app shell & runtime assets
- IndexedDB local cache via Dexie.js for offline conversations & messages
- Offline Message Queueing with auto-synchronization & idempotency upon network reconnection
- Network Status banner ("Offline mode")

### 🛡️ Security & Privacy
- Backend-enforced authorization & permissions (users can only access chats they belong to)
- Block & Unblock user capability
- Privacy settings for Last Seen, Online visibility, Read Receipts, Typing Indicator, and Dark Mode

---

## Directory Structure

```
Reyan1/
├── database/
│   └── schema.sql                # Supabase PostgreSQL schema & table migrations
├── reyan-backend/                # Spring Boot REST API & STOMP WebSocket Server
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/reyan/chat/
│           │   ├── config/       # Security, CORS, WebSocket, STOMP Interceptor
│           │   ├── controller/   # REST Controllers (Auth, Users, Chats, Messages, etc.)
│           │   ├── dto/          # Data Transfer Objects
│           │   ├── entity/       # JPA Entities
│           │   ├── repository/   # JPA Repositories
│           │   ├── security/     # JWT Token Provider, UserPrincipal
│           │   ├── service/      # Business Logic Services
│           │   └── websocket/    # STOMP Event Controller
│           └── resources/
│               └── application.yml
├── reyan-pwa/                    # Vite + React + TypeScript PWA Frontend
│   ├── package.json
│   ├── vite.config.ts            # Vite PWA Workbox configuration
│   ├── index.html
│   ├── public/
│   │   └── manifest.json         # PWA Web App Manifest
│   └── src/
│       ├── components/           # Sidebar, Chat, Auth, Modals, Common UI
│       ├── context/              # AuthContext, ChatContext, ThemeContext
│       ├── db/                   # Dexie.js IndexedDB schema
│       ├── services/             # API Client & STOMP WebSocket Service
│       ├── styles/               # CSS Design Tokens & Dark Mode
│       └── types/                # TypeScript Interfaces
└── README.md
```

---

## Getting Started

### 1. Database Setup (Supabase PostgreSQL)
1. Open your Supabase Project Dashboard (`https://hxppnfkfqtpdquqzxxof.supabase.co`) -> SQL Editor.
2. Run the SQL script from `database/schema.sql`.
3. Create Storage Buckets in Supabase:
   - `avatars` (Public)
   - `chat-media` (Public)
   - `documents` (Public)

### 2. Backend Startup (Spring Boot)
1. Navigate to `reyan-backend`:
   ```bash
   cd reyan-backend
   ```
2. Configure database credentials in `src/main/resources/application.yml` or pass via environment variables:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://db.hxppnfkfqtpdquqzxxof.supabase.co:5432/postgres
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=<your-db-password>
   ```
3. Run Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start on `http://localhost:8085`.

### 3. Frontend PWA Startup (Vite React)
1. Navigate to `reyan-pwa`:
   ```bash
   cd reyan-pwa
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:3000`.

### 4. PWA Production Build & Installation
1. Build production PWA bundle:
   ```bash
   npm run build
   ```
2. Serve the generated `/dist` directory over HTTPS or test locally using `npm run preview`.
3. Open in Chrome, Edge, Safari, or Android Chrome and click **"Install Reyan App"** or the browser address bar install prompt.

---

## REST API Specification

### Auth Endpoints
- `POST /api/v1/auth/register` — Register a new account
- `POST /api/v1/auth/login` — Authenticate and receive Access & Refresh tokens
- `POST /api/v1/auth/refresh` — Issue a new Access Token from Refresh Token
- `POST /api/v1/auth/logout` — Revoke user session and WebSocket connection

### User Endpoints
- `GET /api/v1/users/me` — Fetch current user profile
- `PUT /api/v1/users/me` — Update user profile details
- `GET /api/v1/users/search?query=...` — Search users by username/email

### Chat & Message Endpoints
- `GET /api/v1/chats` — Fetch all user conversations
- `POST /api/v1/chats/direct` — Create or open 1-to-1 chat with recipient
- `POST /api/v1/chats/group` — Create a new group chat
- `GET /api/v1/messages/chat/{chatId}` — Get chat message history
- `POST /api/v1/messages` — Send a message
- `PUT /api/v1/messages/{messageId}` — Edit message content
- `DELETE /api/v1/messages/{messageId}` — Delete message for everyone
- `POST /api/v1/media/upload` — Upload media/document to storage

---

## WebSocket STOMP Destinations

- **Connection URL**: `ws://localhost:8085/ws-direct` (or `http://localhost:8085/ws` SockJS)
- **Send Message**: `/app/chat.send`
- **Send Typing Event**: `/app/typing`
- **Mark Message Read**: `/app/message.read`
- **Subscribe Chat Messages**: `/topic/chat/{chatId}`
- **Subscribe Typing Status**: `/topic/chat/{chatId}/typing`
- **Subscribe Message Status**: `/topic/chat/{chatId}/status`
