import { createContext, useEffect, useState, type ReactNode } from 'react';
import { signalRService } from '../services/signalrService';
import type { TicketCreatedAlert } from '../types';
import { useAuth } from './useAuth';

export interface SignalRContextValue {
  isConnected: boolean;
  alerts: TicketCreatedAlert[];
  unreadCount: number;
  latestToast: TicketCreatedAlert | null;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  dismissToast: () => void;
}

export const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<TicketCreatedAlert[]>([]);
  const [latestToast, setLatestToast] = useState<TicketCreatedAlert | null>(null);

  useEffect(() => {
    if (!user?.token) {
      signalRService.stop();
      setIsConnected(false);
      return;
    }

    const baseOrigin =
      typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? window.location.origin
        : 'http://localhost:8080';
    const hubUrl = (import.meta.env.VITE_HUB_URL ?? baseOrigin) + '/hubs/tickets';
    signalRService.start(hubUrl, user.token);

    const unsubStatus = signalRService.onStatusChange((connected) => {
      setIsConnected(connected);
    });

    const unsubAlert = signalRService.onTicketAlert((alert) => {
      setAlerts((prev) => [alert, ...prev]);
      setLatestToast(alert);
    });

    return () => {
      unsubStatus();
      unsubAlert();
      signalRService.stop();
    };
  }, [user?.token]);

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const dismissToast = () => {
    setLatestToast(null);
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <SignalRContext.Provider
      value={{
        isConnected,
        alerts,
        unreadCount,
        latestToast,
        markAllAsRead,
        clearAlerts,
        dismissToast,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}
