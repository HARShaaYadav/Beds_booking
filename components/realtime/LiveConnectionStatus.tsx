'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

interface LiveConnectionStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export function LiveConnectionStatus({ onStatusChange }: LiveConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      onStatusChange?.(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      onStatusChange?.(false);
    };

    const handleReconnecting = () => {
      setIsReconnecting(true);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnecting', handleReconnecting);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnecting', handleReconnecting);
    };
  }, [onStatusChange]);

  return (
    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white shadow-sm border border-gray-200">
      {isReconnecting ? (
        <>
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-600 font-semibold">Reconnecting</span>
        </>
      ) : isConnected ? (
        <>
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-sm text-green-600 font-semibold">Live</span>
        </>
      ) : (
        <>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-600 font-semibold">Offline</span>
        </>
      )}
    </div>
  );
}
