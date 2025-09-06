"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Helper function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sensorData: any;
  alerts: any[];
  connect: () => void;
  disconnect: () => void;
  error: string | null;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

// Configuration for socket connection
const SOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  path: '/api/environment/websocket',
  options: {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    transports: ['websocket', 'polling'],
    extraHeaders: {
      // This will be added dynamically in initializeSocket
    },
  },
};

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  const initializeSocket = useCallback(async () => {
    try {
      // Clean up existing socket if any
      if (socket) {
        socket.disconnect();
      }

      // Get auth token for connection
      const token = getCookie('auth-token');
      if (!token) {
        setError('Authentication required for socket connection');
        return;
      }

      // Update socket options with authentication
      const socketOptions = {
        ...SOCKET_CONFIG.options,
        extraHeaders: {
          ...SOCKET_CONFIG.options.extraHeaders,
          Authorization: `Bearer ${token}`,
        },
      };

      const newSocket = io(SOCKET_CONFIG.url, socketOptions);
      
      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
        setError(null);
        
        // Request initial data
        newSocket.emit('request_sensor_data');
        newSocket.emit('request_alerts');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError(`Connection failed: ${err.message}`);
        setIsConnected(false);
      });

      // Handle sensor data updates
      newSocket.on('sensor-data', (data) => {
        console.log('Received sensor data:', data);
        setSensorData(data);
      });

      // Handle alerts
      newSocket.on('alert', (alert) => {
        console.log('Received alert:', alert);
        setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10 alerts
      });

      // Handle errors
      newSocket.on('error', (err) => {
        console.error('Socket error:', err);
        setError(err.message || 'Unknown socket error');
      });

      setSocket(newSocket);
    } catch (err) {
      console.error('Failed to initialize socket:', err);
      setError('Failed to initialize connection');
    }
  }, [socket]);

  // Connect to socket
  const connect = useCallback(() => {
    if (socket && !isConnected) {
      socket.connect();
    } else if (!socket) {
      initializeSocket();
    }
  }, [socket, isConnected, initializeSocket]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  }, [socket, isConnected]);

  // Reconnect to socket
  const reconnect = useCallback(() => {
    setError(null);
    disconnect();
    setTimeout(initializeSocket, 1000);
  }, [disconnect, initializeSocket]);

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket();
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initializeSocket]);

  // Request sensor data
  const requestSensorData = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('request_sensor_data');
    }
  }, [socket, isConnected]);

  // Request alerts
  const requestAlerts = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('request_alerts');
    }
  }, [socket, isConnected]);

  // Request community data
  const requestCommunityData = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('request_community_data');
    }
  }, [socket, isConnected]);

  // Request predictive data
  const requestPredictiveData = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('request_predictive_data');
    }
  }, [socket, isConnected]);

  // Add request methods to socket
  useEffect(() => {
    if (socket) {
      (socket as any).request_sensor_data = requestSensorData;
      (socket as any).request_alerts = requestAlerts;
      (socket as any).request_community_data = requestCommunityData;
      (socket as any).request_predictive_data = requestPredictiveData;
    }
  }, [socket, requestSensorData, requestAlerts, requestCommunityData, requestPredictiveData]);

  const value = {
    socket,
    isConnected,
    sensorData,
    alerts,
    connect,
    disconnect,
    error,
    reconnect,
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