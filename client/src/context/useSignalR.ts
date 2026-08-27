import { useContext } from 'react';
import { SignalRContext, type SignalRContextValue } from './SignalRContext';

export function useSignalR(): SignalRContextValue {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}
