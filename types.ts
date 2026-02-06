
export type UserRole = 'Colaborador' | 'Visitante' | 'Administrador';
export type UserStatus = 'Ativo' | 'Inativo' | 'Bloqueado';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  registration?: string; // Matrícula para colaboradores
  cpf?: string;         // CPF para visitantes
  phone: string;
  type: UserRole;
  status: UserStatus;
  vehicles: Vehicle[];
  validFrom?: string;   // Data/Hora Início para visitantes
  validUntil?: string;  // Data/Hora Fim para visitantes
  lastAccess?: string;
}

// Added Visitor interface to fix "Module '"./types"' has no exported member 'Visitor'" error
export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  plate: string;
  entryDate: string;
  expiryDate: string;
  status: string;
  qrCode: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}