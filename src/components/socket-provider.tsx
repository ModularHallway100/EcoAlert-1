"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sensorData: any;
  alerts: any[];
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    let socketConnection: Socket;

    const connectSocket = async () => {
      const { io } = await import('socket.io-client');
      socketConnection = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Connection events
      socketConnection.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      socketConnection.on('disconnect', (reason: any) => {
        console.log('Disconnected from socket server:', reason);
        setIsConnected(false);
      });

      // Listen for real-time sensor data
      socketConnection.on('sensor-data', (data: any) => {
        setSensorData(data);
      });

      // Listen for alerts
      socketConnection.on('alert', (alert: any) => {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      });

      // Listen for emergency broadcasts
      socketConnection.on('emergency-broadcast', (emergency: any) => {
        // Handle emergency broadcasts (could show notifications, etc.)
        console.log('Emergency broadcast received:', emergency);
      });

      // Listen for community updates
      socketConnection.on('community-update', (update: any) => {
        // Handle community updates
        console.log('Community update received:', update);
      });

      setSocket(socketConnection);
    };

    connectSocket();

    // Cleanup on unmount
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  const connect = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  const disconnect = () => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  };

  const value = {
    socket,
    isConnected,
    sensorData,
    alerts,
    connect,
    disconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}