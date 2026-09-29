# VISTA Security & Production Deployment Guide

This guide outlines security best practices, Content Security Policy (CSP) guidelines, and containerized deployment procedures for VISTA AI Companion.

---

## 🔒 Security Architecture

### 1. API Key Isolation
* **Server-Side Exclusivity:** API keys (such as Google Gemini credentials) are stored and managed exclusively in backend memory/environment variables (`GEMINI_API_KEY`).
* **Zero Client Exposure:** Client bundles do NOT contain API keys or secrets. Requests for multimodal analysis are sent to the VISTA Express server via authenticated REST endpoints.

### 2. Content Security Policy (CSP) Recommendations
For production deployments, enforce the following headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; media-src 'self' blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https://generativelanguage.googleapis.com;
```

### 3. Cross-Origin Resource Sharing (CORS)
The backend enables strict CORS origin checking in production. By default, only authorized local frontends (`http://localhost:5173`) or deployed domain origins can communicate with `/api/*`.

---

## 🐳 Docker Deployment

A lightweight multi-stage Docker container can be built for complete portability:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "--loader", "tsx", "server/index.ts"]
```
