import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useWebSocket } from '../hooks/useWebSocket';
import { authApi, playerApi, type JoinRequest } from '../services/api';
import { PlayerPanel } from './PlayerPanel';

const WS_URL = 'https://localhost:7255/hubs/test';

type Role = 'GM' | 'Player' | 'Spectator';

export const WebSocketLogger = () => {
  const { messages, isConnected } = useWebSocket(WS_URL);
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState<Role>('Player');
  const [superuserToken, setSuperuserToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [playerSession, setPlayerSession] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [playerBalance, setPlayerBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = Cookies.get('playerSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setPlayerSession(session);
        setJoinSuccess(true);
        console.log('Restored player session from cookie:', session);
      } catch (err) {
        console.error('Failed to parse saved session:', err);
        Cookies.remove('playerSession');
      }
    }
  }, []);

  // Fetch players and current player data when logged in
  useEffect(() => {
    if (joinSuccess && playerSession) {
      const fetchData = async () => {
        try {
          // Fetch all players
          const allPlayers = await playerApi.getAll();
          setPlayers(allPlayers);

          // Fetch current player data for balance
          const playerId = playerSession?.playerId || playerSession?.id;
          if (playerId) {
            const currentPlayerData = await playerApi.getById(playerId);
            setPlayerBalance(currentPlayerData?.balance || 0);
          }
        } catch (err) {
          console.error('Failed to fetch player data:', err);
        }
      };

      fetchData();
      // Refresh every 5 seconds
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [joinSuccess, playerSession]);

  const handleJoinGame = async () => {
    setError(null);
    setIsJoining(true);
    setJoinSuccess(false);

    try {
      // Fetch the game code
      const code = await authApi.getCode();
      console.log('Code:', code);

      // Join the game
      const joinRequest: JoinRequest = {
        code: code.code,
        playerName,
        role,
      };

      console.log('Join request:', joinRequest);

      const response = await authApi.join(joinRequest);

      // Check if join was successful
      if (response && response.error) {
        throw new Error(response.error);
      }

      // Store the response in a cookie for future identification
      if (response) {
        Cookies.set('playerSession', JSON.stringify(response), { expires: 7 }); // Expires in 7 days
        setPlayerSession(response);
        console.log('Player session stored in cookie:', response);
      }

      setJoinSuccess(true);
    } catch (err: any) {
      console.error('Join error:', err);

      // Extract detailed error message
      let errorMessage = 'Failed to join game';

      if (err.response?.data) {
        // Handle custom error format from backend
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        // Handle standard validation errors
        else if (err.response.data.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join('. ');
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setJoinSuccess(false);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMoney = async (destinationId: string, amount: number, memo: string) => {
    const sourceId = playerSession?.playerId || playerSession?.id;
    if (!sourceId) {
      throw new Error('Player ID not found');
    }

    await playerApi.sendMoney({
      sourceId,
      destinationId,
      transferAmount: {
        resourceName: 'Money',
        amount
      },
      memo
    });

    // Add to local transactions list
    const newTransaction = {
      id: Date.now().toString(),
      from: playerSession?.name || 'You',
      to: players.find(p => p.id === destinationId)?.name || destinationId,
      amount,
      timestamp: new Date(),
      memo
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>DOE Dashboard</h2>

      {/* Show PlayerPanel if logged in, otherwise show join form */}
      {joinSuccess ? (
        <PlayerPanel
          currentPlayer={playerSession}
          onSendMoney={handleSendMoney}
          players={players}
          transactions={transactions}
          playerBalance={playerBalance}
        />
      ) : (
        <div style={{
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>Join Game</h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Player Name:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ padding: '5px', width: '200px' }}
            disabled={joinSuccess}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Role:
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            style={{ padding: '5px', width: '212px' }}
            disabled={joinSuccess}
          >
            <option value="Player">Player</option>
            <option value="GM">GM</option>
            <option value="Spectator">Spectator</option>
          </select>
        </div>

        {role === 'GM' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Superuser Token:
            </label>
            <input
              type="password"
              value={superuserToken}
              onChange={(e) => setSuperuserToken(e.target.value)}
              style={{ padding: '5px', width: '200px' }}
              disabled={joinSuccess}
            />
          </div>
        )}

        <button
          onClick={handleJoinGame}
          disabled={isJoining || !playerName || joinSuccess}
          style={{
            padding: '8px 16px',
            backgroundColor: joinSuccess ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: isJoining || !playerName || joinSuccess ? 'not-allowed' : 'pointer',
            opacity: isJoining || !playerName || joinSuccess ? 0.6 : 1,
            marginRight: '10px'
          }}
        >
          {isJoining ? 'Joining...' : joinSuccess ? 'Joined!' : 'Join Game'}
        </button>

        <button
          onClick={async () => {
            try {
              const playerId = playerSession?.playerId || playerSession?.id || '123';
              await authApi.poke({ playerId });
              console.log('Poke sent successfully with playerId:', playerId);
            } catch (err) {
              console.error('Poke error:', err);
            }
          }}
          disabled={!joinSuccess}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            cursor: joinSuccess ? 'pointer' : 'not-allowed',
            marginRight: '10px',
            opacity: joinSuccess ? 1 : 0.6
          }}
        >
          Poke
        </button>

        {joinSuccess && (
          <button
            onClick={() => {
              Cookies.remove('playerSession');
              setPlayerSession(null);
              setJoinSuccess(false);
              setPlayerName('');
              setRole('Player');
              setSuperuserToken('');
              setError(null);
              console.log('Session cleared');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Clear Session
          </button>
        )}

        {error && (
          <div style={{ marginTop: '10px', color: 'red' }}>
            Error: {error}
          </div>
        )}

        {joinSuccess && (
          <div style={{ marginTop: '10px', color: 'green' }}>
            Successfully joined the game!
          </div>
        )}
      </div>
      )}

      {/* WebSocket Status */}
      <div style={{ marginBottom: '10px' }}>
        Status:
        <span style={{
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold',
          marginLeft: '8px'
        }}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#999', fontSize: '14px' }}>No messages received yet...</div>
        ) : (
          messages.slice(-5).map((msg, index) => (
            <div key={index} style={{
              borderBottom: '1px solid #ddd',
              padding: '8px 0',
              wordBreak: 'break-word'
            }}>
              <span style={{ color: '#666', fontSize: '12px' }}>
                [{msg.timestamp.toLocaleTimeString()}]
              </span>
              {' '}
              <span style={{ color: '#000', fontSize: '14px' }}>{msg.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
