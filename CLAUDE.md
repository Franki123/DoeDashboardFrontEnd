# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite frontend for a DOE (game) Dashboard application. The application connects to a .NET backend API and SignalR WebSocket hub to enable real-time game interactions including player management, money transfers, and live updates.

## Development Commands

- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Type-check with TypeScript and build for production
- `npm run lint` - Lint code with ESLint
- `npm run preview` - Preview production build locally

## Backend Integration

### API Configuration
- **Backend URL**: `https://localhost:7255`
- **WebSocket Hub**: `https://localhost:7255/hubs/test`
- **API Proxy**: Vite dev server proxies `/api/*` requests to the backend (configured in vite.config.ts:8-14)

### Key API Endpoints
- `GET /api/v1/auth/code` - Fetch game code
- `POST /api/v1/auth/join` - Join game with code, player name, and role
- `POST /api/v1/auth/poke` - Send poke signal to server
- `GET /api/v1/players` - Fetch all players
- `GET /api/v1/players/:id` - Fetch specific player by ID
- `POST /api/v1/players/SendMoney` - Transfer money between players

## Architecture

### State Management
- No global state library - uses React hooks (useState, useEffect) and prop drilling
- Player session persisted in cookies via `js-cookie` library (expires after 7 days)
- Cookie key: `playerSession` - contains player ID, name, and role information

### Key Components
- **App.tsx** - Root component, minimal wrapper for WebSocketLogger
- **WebSocketLogger** - Main application component handling authentication, game joining, and conditional rendering of PlayerPanel
- **PlayerPanel** - Player interface for viewing balance, sending money, and viewing transactions
- **useWebSocket** (hook) - SignalR WebSocket connection management with automatic reconnection

### WebSocket Integration
The app uses Microsoft SignalR (`@microsoft/signalr`) for real-time communication:
- Connection configured with `skipNegotiation: true` and WebSocket-only transport
- Automatic reconnection enabled
- Listens for 'Receive' messages from the hub
- Connection state tracked in `useWebSocket` hook (src/hooks/useWebSocket.ts:9-69)

### API Service Pattern
API calls centralized in `src/services/api.ts`:
- Uses axios for HTTP requests
- Two main service objects: `authApi` and `playerApi`
- Empty base URL to leverage Vite proxy in development

### Session Management
- Session restored on mount by checking `playerSession` cookie
- If valid session exists, automatically shows PlayerPanel and fetches player data
- Player data (balance, player list) refreshed every 5 seconds when logged in
- Clear session functionality removes cookie and resets UI state

## TypeScript Configuration
- Uses TypeScript 5.8.3
- Project references split between `tsconfig.app.json` (app code) and `tsconfig.node.json` (Vite config)
- Main tsconfig.json orchestrates references

## Important Notes
- Backend uses self-signed certificate (secure: false in Vite proxy config)
- Role options: 'Player', 'GM', 'Spectator' (GM requires superuser token)
- WebSocket URL is hardcoded in WebSocketLogger.tsx:7 - may need updating for different environments
- Transaction history is client-side only (stored in component state, not persisted)
- Messages from SignalR are displayed in a scrollable log (limited to last 5 messages in UI)
