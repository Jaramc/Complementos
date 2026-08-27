export const normalizeType = (type: any): string => {
  if (typeof type === 'number') {
    const types = ['Peticion', 'Queja', 'Reclamo', 'Sugerencia'];
    return types[type] || 'Peticion';
  }
  return String(type || 'Peticion');
};

export const normalizePriority = (priority: any): string => {
  if (typeof priority === 'number') {
    const priorities = ['Low', 'Medium', 'High'];
    return priorities[priority] || 'Low';
  }
  return String(priority || 'Low');
};

export const normalizeSentiment = (sentiment: any): string => {
  if (typeof sentiment === 'number') {
    const sentiments = ['Positive', 'Neutral', 'Negative'];
    return sentiments[sentiment] || 'Neutral';
  }
  return String(sentiment || 'Neutral');
};

export const formatTicketType = normalizeType;
export const formatPriority = normalizePriority;
export const formatSentiment = normalizeSentiment;
