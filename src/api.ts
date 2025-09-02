export interface Player {
  id: string;
  name?: string;
  balance: number;
}

export interface Transaction {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  timestamp: string;
}

// Mock data for development
const mockPlayers: Player[] = [
  { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Alice', balance: 1000 },
  { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Bob', balance: 750 },
  { id: '123e4567-e89b-12d3-a456-426614174003', name: 'Charlie', balance: 1250 },
  { id: '123e4567-e89b-12d3-a456-426614174004', name: 'Diana', balance: 500 }
];

const mockTransactions: Transaction[] = [
  {
    id: '987fcdeb-51a2-43d1-9f4e-123456789001',
    fromPlayerId: '123e4567-e89b-12d3-a456-426614174001',
    toPlayerId: '123e4567-e89b-12d3-a456-426614174002',
    amount: 100,
    timestamp: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: '987fcdeb-51a2-43d1-9f4e-123456789002',
    fromPlayerId: '123e4567-e89b-12d3-a456-426614174003',
    toPlayerId: '123e4567-e89b-12d3-a456-426614174004',
    amount: 250,
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: '987fcdeb-51a2-43d1-9f4e-123456789003',
    fromPlayerId: '123e4567-e89b-12d3-a456-426614174002',
    toPlayerId: '123e4567-e89b-12d3-a456-426614174001',
    amount: 50,
    timestamp: new Date(Date.now() - 180000).toISOString()
  }
];

const BASE_URL = '/api';

// Flag to enable/disable mock mode (set to true for development without backend)
const USE_MOCK_API = false;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorText = await res.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // If reading error text fails, use default message
    }
    throw new Error(errorMessage);
  }
  
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  } else {
    // Handle non-JSON responses
    throw new Error('Expected JSON response from server');
  }
}

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getTransactions(): Promise<Transaction[]> {
  if (USE_MOCK_API) {
    await delay(300); // Simulate network delay
    return [...mockTransactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  const res = await fetch(`${BASE_URL}/Transactions`);
  return handleResponse<Transaction[]>(res);
}

export async function getPlayerTransactions(playerId: string): Promise<Transaction[]> {
  if (USE_MOCK_API) {
    await delay(300);
    return mockTransactions.filter(t => t.fromPlayerId === playerId || t.toPlayerId === playerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  const res = await fetch(`${BASE_URL}/Players/${playerId}/transactions`);
  return handleResponse<Transaction[]>(res);
}

export async function sendMoney(fromId: string, toId: string, amount: number): Promise<void> {
  if (USE_MOCK_API) {
    await delay(500);
    
    // Validate players exist
    const fromPlayer = mockPlayers.find(p => p.id === fromId);
    const toPlayer = mockPlayers.find(p => p.id === toId);
    
    if (!fromPlayer) throw new Error('Sender player not found');
    if (!toPlayer) throw new Error('Recipient player not found');
    if (fromPlayer.balance < amount) throw new Error('Insufficient balance');
    if (amount <= 0) throw new Error('Amount must be positive');
    
    // Update balances
    fromPlayer.balance -= amount;
    toPlayer.balance += amount;
    
    // Add transaction
    const newTransaction: Transaction = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromPlayerId: fromId,
      toPlayerId: toId,
      amount,
      timestamp: new Date().toISOString()
    };
    mockTransactions.unshift(newTransaction);
    
    return;
  }
  
  const res = await fetch(`${BASE_URL}/Players/${fromId}/send/${toId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(amount)
  });
  
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorText = await res.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Use default error message if parsing fails
    }
    throw new Error(errorMessage);
  }
}

export async function giveMoney(playerId: string, amount: number): Promise<void> {
  if (USE_MOCK_API) {
    await delay(500);
    
    const player = mockPlayers.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');
    if (amount <= 0) throw new Error('Amount must be positive');
    
    // Update player balance
    player.balance += amount;
    
    // Add transaction (from "system" to player)
    const newTransaction: Transaction = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromPlayerId: 'system',
      toPlayerId: playerId,
      amount,
      timestamp: new Date().toISOString()
    };
    mockTransactions.unshift(newTransaction);
    
    return;
  }
  
  const res = await fetch(`${BASE_URL}/gamemaster/give/${playerId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(amount)
  });
  
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorText = await res.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Use default error message if parsing fails
    }
    throw new Error(errorMessage);
  }
}

export async function getPlayers(): Promise<Player[]> {
  if (USE_MOCK_API) {
    await delay(300);
    return [...mockPlayers].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
  }
  
  const res = await fetch(`${BASE_URL}/gamemaster/players`);
  return handleResponse<Player[]>(res);
}
