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
    // MOCK IMPLEMENTATION
    const eventListeners = new Map<string, (...args: any[]) => void>();

    const mockSocket = {
      on: (event: string, callback: (...args: any[]) => void) => {
        eventListeners.set(event, callback);
      },
      connect: () => {
        console.log('Mock socket connected');
        eventListeners.get('connect')?.();
      },
      disconnect: () => {
        console.log('Mock socket disconnected');
        eventListeners.get('disconnect')?.('client-side disconnect');
      },
      // Add other methods if needed
      emit: (event: string, ...args: any[]) => {
        console.log(`Mock socket emitting event "${event}" with args:`, args);
      }
    };

    setSocket(mockSocket as any);
    setIsConnected(true);
    console.log('Mock socket provider initialized.');

    // Simulate connection
    mockSocket.connect();

    // Simulate receiving sensor data every 3 seconds
    const sensorInterval = setInterval(() => {
      const mockData = {
        id: `sensor-${Math.floor(Math.random() * 100)}`,
        type: 'air_quality',
        value: Math.random() * 100,
        timestamp: new Date().toISOString(),
      };
      eventListeners.get('sensor-data')?.(mockData);
    }, 3000);

    // Simulate receiving an alert every 10 seconds
    const alertInterval = setInterval(() => {
      const mockAlert = {
        id: `alert-${Date.now()}`,
        message: 'High pollution levels detected in your area.',
        level: 'warning',
        timestamp: new Date().toISOString(),
      };
      eventListeners.get('alert')?.(mockAlert);
    }, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(sensorInterval);
      clearInterval(alertInterval);
      mockSocket.disconnect();
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