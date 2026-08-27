export type TicketType = 'Peticion' | 'Queja' | 'Reclamo' | 'Sugerencia';
export type TicketStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High';
export type TicketSentiment = 'Positive' | 'Neutral' | 'Negative';

export interface Ticket {
  id: string;
  tenantId: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  summary: string | null;
  createdAtUtc: string;
}

export interface TicketCreatedAlert {
  id: string;
  trackingNumber: string;
  type: TicketType;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  summary: string;
  timestamp?: string;
  read?: boolean;
}

export interface KbArticle {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateKbArticleRequest {
  title: string;
  content: string;
}

export interface RagSearchResponse {
  hasAnswer: boolean;
  answer: string | null;
  similarityScore: number;
  matchedArticleIds: string[];
}

export interface User {
  email: string;
  tenantId: string;
  role: string;
  token: string;
  expiration: string;
}
