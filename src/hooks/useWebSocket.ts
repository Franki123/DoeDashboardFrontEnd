import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export interface WebSocketMessage {
  timestamp: Date;
  content: string;
}

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Listen for messages from the hub's Receive method
    connection.on('Receive', (message: string) => {
      const msg: WebSocketMessage = {
        timestamp: new Date(),
        content: message,
      };
      setMessages((prev) => [...prev, msg]);
      console.log('SignalR message received:', message);
    });

    // Start the connection
    connection
      .start()
      .then(() => {
        console.log('SignalR connected');
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
      });

    connection.onclose(() => {
      console.log('SignalR disconnected');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
    });

    connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setIsConnected(false);
    });

    return () => {
      connection.stop();
    };
  }, [url]);

  return { messages, isConnected };
};
