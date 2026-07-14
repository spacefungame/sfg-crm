export type Establishment = 'space_fun_games' | 'share_and_fun' | 'les_deux';

export type ContactStatus = 
  | 'Nouveau : à contacter'
  | 'À relancer'
  | 'Rendez-vous fixé'
  | 'Devis envoyé'
  | 'Client converti'
  | 'Pas intéressé'
  | string;

export interface ActivityLog {
  id: string;
  contactId: string;
  employeeName: string;
  actionType: 'mail' | 'call' | 'note' | 'status_change' | 'import';
  summary: string;
  newStatus?: string;
  deadline?: string;
  timestamp: string; // ISO format or formatted string
}

export interface Contact {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company?: string;
  type: string; // ex: 'Entreprise', 'Association', etc. (personnalisable)
  establishment: Establishment;
  status: string;
  deadline?: string; // au format YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
  logs: ActivityLog[];
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string; // Supports {Nom}, {Prénom}, {Société}
}

export interface PendingCommunication {
  contactId: string;
  type: 'call' | 'mail';
  templateTitle?: string;
  timestamp: number;
}

export interface CloudConfig {
  enabled: boolean;
  provider: 'local' | 'supabase';
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface CRMData {
  contacts: Contact[];
  users: User[];
  contactTypes: string[];
  emailTemplates: EmailTemplate[];
  cloudConfig: CloudConfig;
}
