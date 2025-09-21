// contexts/SocketContext.js
"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && user) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        auth: { token }
      });
      setSocket(newSocket);
      
      return () => newSocket.close();
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);