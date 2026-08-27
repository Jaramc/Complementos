import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import type { TicketCreatedAlert } from '../types';

export class SignalRService {
  private connection: HubConnection | null = null;
  private listeners: ((alert: TicketCreatedAlert) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];

  public start(hubUrl: string, token: string): void {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('ReceiveTicketAlert', (alert: TicketCreatedAlert) => {
      const enrichedAlert: TicketCreatedAlert = {
        ...alert,
        timestamp: new Date().toISOString(),
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

    this.connection
      .start()
      .then(() => {
        this.notifyStatus(true);
      })
      .catch(() => {
        this.notifyStatus(false);
      });
  }

  public stop(): void {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.notifyStatus(false);
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
