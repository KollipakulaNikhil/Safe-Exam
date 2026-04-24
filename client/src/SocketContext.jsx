import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      // Disconnect when logged out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // On Vercel serverless, WebSockets are not supported — use polling only in production
    const isProduction = import.meta.env.PROD;

    // Connect socket
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const newSocket = io(backendUrl, {
      transports: isProduction ? ['polling'] : ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      // Log gracefully — do NOT re-throw, as that causes React error #31
      console.warn('🔌 Socket connection error:', err?.message || err);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
