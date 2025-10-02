import axios from 'axios';

// Use relative URL in development to leverage Vite proxy
const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface JoinRequest {
  code: string;
  playerName: string;
  role: string;
}

export interface CodeResponse {
  code: string;
}

export interface PokeRequest {
  playerId: string;
}

export interface TransferRequest {
  sourceId: string;
  destinationId: string;
  transferAmount: {
    resourceName: string;
    amount: number;
  };
  memo: string;
}

export const authApi = {
  getCode: async (): Promise<CodeResponse> => {
    const response = await api.get('/api/v1/auth/code');
    return response.data;
  },

  join: async (request: JoinRequest): Promise<any> => {
    console.log('Join request:', request);
    const response = await api.post('/api/v1/auth/join', request);
    console.log('Join response:', response);
    return response.data;
  },

  poke: async (request : PokeRequest): Promise<void> => {
    await api.post('/api/v1/auth/poke', request);
  },
};

export const playerApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/api/v1/players');
    return response.data;
  },

  getById: async (playerId: string): Promise<any> => {
    const response = await api.get(`/api/v1/players/${playerId}`);
    return response.data;
  },

  sendMoney: async (request: TransferRequest): Promise<void> => {
    await api.post('/api/v1/players/SendMoney', request);
  },
};
