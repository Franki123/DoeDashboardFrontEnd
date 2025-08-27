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

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<T>;
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${BASE_URL}/Transactions`);
  return handleResponse<Transaction[]>(res);
}

export async function getPlayerTransactions(playerId: string): Promise<Transaction[]> {
  const res = await fetch(`${BASE_URL}/Players/${playerId}/transactions`);
  return handleResponse<Transaction[]>(res);
}

export async function sendMoney(fromId: string, toId: string, amount: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Players/${fromId}/send/${toId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(amount)
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function giveMoney(playerId: string, amount: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/gamemaster/give/${playerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(amount)
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function getPlayers(): Promise<Player[]> {
  const res = await fetch(`${BASE_URL}/gamemaster/players`);
  return handleResponse<Player[]>(res);
}
