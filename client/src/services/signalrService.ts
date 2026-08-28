import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@microsoft/signalr';
import type { TicketCreatedAlert } from '../types';
import { normalizePriority, normalizeSentiment, normalizeTicketType } from '../utils/normalizers';

export class SignalRService {
  private connection: HubConnection | null = null;
  private isStarting = false;
  private listeners: ((alert: TicketCreatedAlert) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];

  public async start(hubUrl: string, token: string): Promise<void> {
    if (!token) return;

    if (this.connection && (this.connection.state === HubConnectionState.Connected || this.connection.state === HubConnectionState.Connecting)) {
      return;
    }

    if (this.isStarting) return;
    this.isStarting = true;

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Ignorar errores al detener conexión previa
      }
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('ReceiveTicketAlert', (alert: TicketCreatedAlert) => {
      const enrichedAlert: TicketCreatedAlert = {
        ...alert,
        type: normalizeTicketType(alert.type),
        priority: normalizePriority(alert.priority),
        sentiment: normalizeSentiment(alert.sentiment),
        timestamp: alert.timestamp ?? new Date().toISOString(),
        read: false,
      };
      this.listeners.forEach((listener) => listener(enrichedAlert));
    });

    this.connection.onreconnected(() => {
      this.notifyStatus(true);
    });

    this.connection.onclose(() => {
      this.notifyStatus(false);
    });

    try {
      await this.connection.start();
      this.notifyStatus(true);
    } catch (err: unknown) {
      this.notifyStatus(false);
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('stopped during negotiation')) {
        console.warn('[SignalR] No se pudo conectar de inmediato:', message);
      }
    } finally {
      this.isStarting = false;
    }
  }

  public async stop(): Promise<void> {
    if (this.connection) {
      const conn = this.connection;
      this.connection = null;
      try {
        await conn.stop();
      } catch {
        // Ignorar
      } finally {
        this.notifyStatus(false);
      }
    }
  }

  public onTicketAlert(callback: (alert: TicketCreatedAlert) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public onStatusChange(callback: (connected: boolean) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.isConnected());
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  private notifyStatus(connected: boolean): void {
    this.statusListeners.forEach((listener) => listener(connected));
  }
}

export const signalRService = new SignalRService();

let connection: HubConnection | null = null;
let isStarting = false;

export const startSignalR = async (token: string, onTicketAlert: (ticket: TicketCreatedAlert) => void): Promise<HubConnection | null | undefined> => {
  if (!token) return;

  if (connection && (connection.state === HubConnectionState.Connected || connection.state === HubConnectionState.Connecting)) {
    return connection;
  }

  if (isStarting) return;
  isStarting = true;

  if (connection) {
    try {
      await connection.stop();
    } catch {
      // Ignorar errores al detener previo
    }
  }

  const hubUrl = (import.meta.env.VITE_HUB_URL ?? 'http://localhost:8080') + '/hubs/tickets';

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
      skipNegotiation: false,
      transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on('ReceiveTicketAlert', (ticket: TicketCreatedAlert) => {
    onTicketAlert(ticket);
  });

  try {
    await connection.start();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('stopped during negotiation')) {
      console.warn('[SignalR] No se pudo conectar de inmediato:', message);
    }
  } finally {
    isStarting = false;
  }

  return connection;
};

export const stopSignalR = async (): Promise<void> => {
  if (connection) {
    const conn = connection;
    connection = null;
    try {
      await conn.stop();
    } catch {
      // Ignorar
    }
  }
};

export const initSignalR = startSignalR;


