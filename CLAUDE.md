# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript frontend for a game management system that manages players, transactions, and money transfers. The application provides three role-based dashboard views:

- **Player Dashboard**: Allows players to send money to other players and view their transaction history
- **Viewer Dashboard**: Read-only view of all transactions 
- **GameMaster Dashboard**: Administrative view to give money to players and monitor all players/transactions

## Architecture

The application follows a standard React SPA architecture:

- **Frontend**: React 18 with TypeScript, using React Router for navigation
- **Build Tool**: Vite with React plugin
- **API Layer**: Centralized in `src/api.ts` with typed interfaces
- **Backend Integration**: REST API endpoints documented in `backendSwagger.txt`

### Key Components Structure

- `src/App.tsx`: Main application with navigation and routing
- `src/api.ts`: All API functions with TypeScript interfaces for Player and Transaction
- `src/pages/`: Role-based dashboard components
- `backendSwagger.txt`: OpenAPI specification for the backend API

### API Integration

The application communicates with a backend API at `http://127.0.0.1:5007/api` with these main endpoints:
- Player transactions: `GET /api/Players/{id}/transactions`
- Send money: `POST /api/Players/{fromId}/send/{toId}`
- GameMaster operations: `GET /api/gamemaster/players`, `POST /api/gamemaster/give/{playerId}`
- All transactions: `GET /api/Transactions`

## Development Commands

- `npm run dev`: Start development server with Vite
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run test`: Run tests (currently placeholder)

## Key Data Models

```typescript
interface Player {
  id: string;        // UUID format
  name?: string;     // Optional display name
  balance: number;   // Current money balance
}

interface Transaction {
  id: string;           // UUID format
  fromPlayerId: string; // UUID of sender
  toPlayerId: string;   // UUID of receiver  
  amount: number;       // Transaction amount
  timestamp: string;    // ISO date-time
}
```

## Development Notes

- Player IDs are UUIDs, not simple strings
- All API calls use proper error handling with try/catch
- State management is done with React hooks (useState/useEffect)
- No external state management library is used
- API responses are typed with TypeScript interfaces
- The application expects a backend server running at `http://127.0.0.1:5007/api`
- Mock API mode can be enabled by setting `USE_MOCK_API = true` in `src/api.ts`
- All API requests include proper Content-Type and Accept headers
- Error responses are handled with detailed error messages