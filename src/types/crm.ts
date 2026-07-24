export type Establishment = 'space_fun_games' | 'share_and_fun' | 'les_deux';

export type ContactStatus = 
  | 'Nouveau : à contacter'
  | 'À relancer'
  | 'Rendez-vous fixé'
  | 'Devis envoyé'
  | 'Client converti'
  | 'Pas intéressé'
  | string;

export interface TagDefinition {
  id: string;
  name: string;
  description?: string;
  color: string; // CSS hex color ex: '#8D5B4C' or '#2E7D32'
}

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

export interface EventDetails {
  establishment?: 'space_fun_games' | 'share_and_fun' | 'les_deux' | 'a_determiner';
  dateType?: 'exact' | 'month' | 'tbd';
  dateValue?: string; // YYYY-MM-DD or YYYY-MM
  guestCount?: string;
  arrivalTime?: string;
  departureTime?: string;
  activities?: string;
  catering?: string;
  drinks?: string;
  equipment?: string;
  paymentStatus?: string;
  quoteAmount?: string;
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
  tags?: string[]; // array of TagDefinition ids
  deadline?: string; // au format YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
  logs: ActivityLog[];
  eventDetails?: EventDetails;
}

export interface User {
  id: string;
  loginEmail?: string;
  username: string;
  email?: string;
  password?: string;
  role: string; // Intitulé du poste
  isAdmin?: boolean; // Droits d'administration
  isInvited?: boolean;
}

export interface EmailTemplate {
  id: string;
  title: string;
  category?: string; // ex: 'Prospection', 'Relance', 'Suivi & Fidélisation', 'Evénements & Devis', 'Général'
  shortcut?: string; // ex: '/intro', '/relance1', '/visite'
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
  provider: 'local' | 'jsonbin' | 'supabase' | 'jsonblob' | 'restful' | 'gist';
  jsonbinId?: string;
  jsonbinKey?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  jsonblobId?: string;
  restfulId?: string;
  gistId?: string;
  gistToken?: string;
  autoPoll?: boolean;
  lastSync?: string;
}

export interface CRMData {
  contacts: Contact[];
  users: User[];
  contactTypes: string[];
  statuses: string[];
  statusCategories?: Record<string, string>;
  tags: TagDefinition[];
  roles?: string[];
  templateCategories?: string[];
  emailTemplates: EmailTemplate[];
  cloudConfig: CloudConfig;
  deletedContactIds?: string[];
  deletedItemIds?: string[];
  authorizedEmails?: string[];
}


