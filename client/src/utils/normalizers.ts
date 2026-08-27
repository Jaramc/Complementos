import type { TicketPriority, TicketSentiment, TicketStatus, TicketType } from '../types';

type EnumValue = string | number | null | undefined;

function normalizeEnum<T extends string>(value: EnumValue, values: readonly T[], fallback: T): T {
  if (typeof value === 'number') {
    return values[value] ?? fallback;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return values.find((candidate) => candidate.toLowerCase() === normalized) ?? fallback;
}

export function normalizeTicketType(value: EnumValue): TicketType {
  return normalizeEnum(value, ['Peticion', 'Queja', 'Reclamo', 'Sugerencia'], 'Peticion');
}

export function normalizeTicketStatus(value: EnumValue): TicketStatus {
  return normalizeEnum(value, ['Pending', 'InProgress', 'Resolved', 'Closed'], 'Pending');
}

export function normalizePriority(value: EnumValue): TicketPriority {
  return normalizeEnum(value, ['Low', 'Medium', 'High'], 'Medium');
}

export function normalizeSentiment(value: EnumValue): TicketSentiment {
  return normalizeEnum(value, ['Positive', 'Neutral', 'Negative'], 'Neutral');
}
