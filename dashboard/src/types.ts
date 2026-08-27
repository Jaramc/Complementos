export type TicketPriority = 'Low' | 'Medium' | 'High';
export type TicketSentiment = 'Positive' | 'Neutral' | 'Negative';
export type TicketStatus = 'Pending' | 'InProgress' | 'Resolved';
export type TicketType = 'Peticion' | 'Queja' | 'Reclamo' | 'Sugerencia';

export interface Ticket {
  id: string;
  trackingNumber: string;
  customerName: string;
  subject: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  vector: number[];
}
