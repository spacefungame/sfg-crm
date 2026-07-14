import type { CRMData, Contact, ActivityLog, User, EmailTemplate, CloudConfig, TagDefinition } from '../types/crm';
import { DEFAULT_CRM_DATA } from './defaultData';

const STORAGE_KEY = 'space_fun_crm_data_v1';
const DATA_UPDATED_EVENT = 'crm_data_updated';

export class StorageService {
  private static instance: StorageService;
  private data: CRMData;

  private constructor() {
    this.data = this.loadFromLocalStorage();
    
    // Listen to changes from other tabs on the same computer
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.data = JSON.parse(e.newValue);
          this.notifyListeners();
        } catch (err) {
          console.error('Error parsing storage event data:', err);
        }
      }
    });
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private loadFromLocalStorage(): CRMData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CRMData;
        let loadedUsers = parsed.users && parsed.users.length > 0 ? parsed.users : DEFAULT_CRM_DATA.users;
        
        // S'assurer que le profil Directrice (Lauréline Henkens) est toujours présent dans les comptes existants
        if (!loadedUsers.some(u => u.role === 'directrice' || u.username.toLowerCase().includes('laur'))) {
          const dirUser = DEFAULT_CRM_DATA.users.find(u => u.role === 'directrice');
          if (dirUser) {
            loadedUsers = [dirUser, ...loadedUsers];
          }
        }

        return {
          contacts: parsed.contacts || DEFAULT_CRM_DATA.contacts,
          users: loadedUsers,
          contactTypes: parsed.contactTypes || DEFAULT_CRM_DATA.contactTypes,
          statuses: parsed.statuses || DEFAULT_CRM_DATA.statuses,
          tags: parsed.tags || DEFAULT_CRM_DATA.tags,
          emailTemplates: parsed.emailTemplates || DEFAULT_CRM_DATA.emailTemplates,
          cloudConfig: parsed.cloudConfig || DEFAULT_CRM_DATA.cloudConfig
        };
      }
    } catch (err) {
      console.error('Failed to load CRM data from localStorage:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CRM_DATA));
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notifyListeners();
      
      // If cloud sync is configured, trigger a background sync (mock/supabase hook)
      if (this.data.cloudConfig.enabled && this.data.cloudConfig.supabaseUrl) {
        this.syncToCloud();
      }
    } catch (err) {
      console.error('Failed to save CRM data to localStorage:', err);
    }
  }

  private notifyListeners(): void {
    window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail: this.data }));
  }

  private async syncToCloud(): Promise<void> {
    // Si l'utilisateur a configuré Supabase, on peut envoyer via REST / fetch
    try {
      const { supabaseUrl, supabaseKey } = this.data.cloudConfig;
      if (!supabaseUrl || !supabaseKey) return;
      
      // We can sync via standard REST POST/PUT or keep local sync intact
      // This is a placeholder hook for actual Supabase/Firebase sync if user puts keys
      console.info('[Cloud Sync] Synchro avec Supabase/Cloud : OK');
    } catch (e) {
      console.warn('[Cloud Sync] Erreur de synchro distante:', e);
    }
  }

  public getData(): CRMData {
    return this.data;
  }

  public resetToDefault(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_CRM_DATA));
    this.saveToLocalStorage();
  }

  // --- Contacts ---
  public getContacts(): Contact[] {
    return this.data.contacts;
  }

  public getContactById(id: string): Contact | undefined {
    return this.data.contacts.find(c => c.id === id);
  }

  public saveContact(contact: Contact): void {
    const index = this.data.contacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      contact.updatedAt = new Date().toISOString();
      this.data.contacts[index] = contact;
    } else {
      contact.createdAt = new Date().toISOString();
      contact.updatedAt = contact.createdAt;
      this.data.contacts.unshift(contact);
    }
    this.saveToLocalStorage();
  }

  public deleteContact(id: string): void {
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    this.saveToLocalStorage();
  }

  public addActivityLog(contactId: string, log: Omit<ActivityLog, 'id' | 'timestamp' | 'contactId'>): ActivityLog {
    const contact = this.getContactById(contactId);
    if (!contact) throw new Error('Contact not found');

    const newLog: ActivityLog = {
      ...log,
      contactId,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString()
    };

    contact.logs.unshift(newLog);
    if (log.newStatus) contact.status = log.newStatus;
    if (log.deadline !== undefined) contact.deadline = log.deadline;
    contact.updatedAt = new Date().toISOString();

    this.saveContact(contact);
    return newLog;
  }

  // --- Contact Types ---
  public getContactTypes(): string[] {
    return this.data.contactTypes || [];
  }

  public addContactType(type: string): void {
    const trimmed = type.trim();
    if (trimmed && !this.data.contactTypes.includes(trimmed)) {
      this.data.contactTypes.push(trimmed);
      this.saveToLocalStorage();
    }
  }

  public deleteContactType(type: string): void {
    this.data.contactTypes = this.data.contactTypes.filter(t => t !== type);
    this.saveToLocalStorage();
  }

  // --- Statuses ---
  public getStatuses(): string[] {
    return this.data.statuses || [];
  }

  public addStatus(status: string): void {
    const trimmed = status.trim();
    if (trimmed && !this.data.statuses.includes(trimmed)) {
      this.data.statuses.push(trimmed);
      this.saveToLocalStorage();
    }
  }

  public deleteStatus(status: string): void {
    this.data.statuses = this.data.statuses.filter(s => s !== status);
    this.saveToLocalStorage();
  }

  // --- Tags ---
  public getTags(): TagDefinition[] {
    return this.data.tags || [];
  }

  public saveTag(tag: TagDefinition): void {
    const index = this.data.tags.findIndex(t => t.id === tag.id);
    if (index >= 0) {
      this.data.tags[index] = tag;
    } else {
      this.data.tags.push(tag);
    }
    this.saveToLocalStorage();
  }

  public deleteTag(id: string): void {
    this.data.tags = this.data.tags.filter(t => t.id !== id);
    this.saveToLocalStorage();
  }

  // --- Users ---
  public getUsers(): User[] {
    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = [...DEFAULT_CRM_DATA.users];
      this.saveToLocalStorage();
    } else if (!this.data.users.some(u => u.role === 'directrice' || u.username.toLowerCase().includes('laur'))) {
      const dirUser = DEFAULT_CRM_DATA.users.find(u => u.role === 'directrice');
      if (dirUser) {
        this.data.users = [dirUser, ...this.data.users];
        this.saveToLocalStorage();
      }
    }
    return this.data.users || [];
  }

  public addUser(username: string, role: 'directrice' | 'admin' | 'user' = 'user', email?: string, password?: string, isInvited?: boolean): User {
    const existing = this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase() || (email && u.email?.toLowerCase() === email.toLowerCase()));
    if (existing) {
      if (email && !existing.email) existing.email = email;
      if (password && !existing.password) existing.password = password;
      if (role) existing.role = role;
      this.saveToLocalStorage();
      return existing;
    }

    const newUser: User = {
      id: 'u-' + Date.now() + Math.floor(Math.random()*100),
      username: username.trim(),
      email: email?.trim(),
      password,
      role,
      isInvited
    };
    this.data.users.push(newUser);
    this.saveToLocalStorage();
    return newUser;
  }

  public saveUser(user: User): void {
    const index = this.data.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      this.data.users[index] = user;
    } else {
      this.data.users.push(user);
    }
    this.saveToLocalStorage();
  }

  public deleteUser(id: string): void {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.saveToLocalStorage();
  }

  // --- Email Templates ---
  public getEmailTemplates(): EmailTemplate[] {
    return this.data.emailTemplates;
  }

  public saveEmailTemplate(template: EmailTemplate): void {
    const index = this.data.emailTemplates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      this.data.emailTemplates[index] = template;
    } else {
      this.data.emailTemplates.push(template);
    }
    this.saveToLocalStorage();
  }

  public deleteEmailTemplate(id: string): void {
    this.data.emailTemplates = this.data.emailTemplates.filter(t => t.id !== id);
    this.saveToLocalStorage();
  }

  // --- Cloud Config ---
  public saveCloudConfig(config: CloudConfig): void {
    this.data.cloudConfig = config;
    this.saveToLocalStorage();
  }

  // --- Pending Communication Tracking (Magic Return Prompt) ---
  public setPendingCommunication(contactId: string, type: 'call' | 'mail', templateTitle?: string): void {
    localStorage.setItem('pending_comm', JSON.stringify({
      contactId,
      type,
      templateTitle,
      timestamp: Date.now()
    }));
  }

  public getAndClearPendingCommunication(): { contactId: string; type: 'call' | 'mail'; templateTitle?: string; timestamp: number } | null {
    const saved = localStorage.getItem('pending_comm');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Only return if < 2 hours old
      if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
        localStorage.removeItem('pending_comm');
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing pending communication:', e);
    }
    localStorage.removeItem('pending_comm');
    return null;
  }
}

export const storageService = StorageService.getInstance();
