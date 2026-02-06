
import { User, Visitor, LogEntry } from './types';

// Arquivo limpo para produção. Integração via Supabase ativa.

export const MOCK_USERS: User[] = [];

export const MOCK_VISITORS: Visitor[] = [];

export const MOCK_LOGS: LogEntry[] = [];

export const CHART_DATA_USAGE = [
  { time: '06:00', users: 0, visitors: 0 },
  { time: '08:00', users: 0, visitors: 0 },
  { time: '10:00', users: 0, visitors: 0 },
  { time: '12:00', users: 0, visitors: 0 },
  { time: '14:00', users: 0, visitors: 0 },
  { time: '16:00', users: 0, visitors: 0 },
  { time: '18:00', users: 0, visitors: 0 },
  { time: '20:00', users: 0, visitors: 0 },
];
