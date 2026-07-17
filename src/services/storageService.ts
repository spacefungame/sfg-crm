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

    this.initCloudPolling();
  }

  private initCloudPolling(): void {
    setTimeout(async () => {
      if (this.data.cloudConfig?.enabled) {
        await this.pullFromCloud();
        if ((this.data.contacts || []).length > 0) {
          setTimeout(() => {
            this.syncToCloud();
          }, 500);
        }
      }
    }, 1000);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const handleWakeUp = () => {
        if (document.visibilityState === 'visible' && this.data.cloudConfig?.enabled && this.data.cloudConfig.autoPoll !== false) {
          this.pullFromCloud();
        }
      };
      document.addEventListener('visibilitychange', handleWakeUp);
      window.addEventListener('focus', handleWakeUp);
    }

    setInterval(() => {
      if (this.data.cloudConfig?.enabled && this.data.cloudConfig.autoPoll !== false) {
        this.pullFromCloud();
      }
    }, 60000);
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
        
        // Nettoyage automatique des 5 faux prospects de démo (`c-101` à `c-105`) lors du passage en réel
        const demoContactIds = ['c-101', 'c-102', 'c-103', 'c-104', 'c-105'];
        const cleanedContacts = (parsed.contacts || []).filter(c => !demoContactIds.includes(c.id));

        // Nettoyage automatique des collaborateurs de démo (`Jean`, `Marie`, `Marc`, `Julie`)
        const demoUsernames = ['Jean', 'Marie', 'Marc', 'Julie'];
        const demoUserIds = ['u-1', 'u-2', 'u-3', 'u-4'];
        let loadedUsers = (parsed.users || []).filter(
          u => !demoUsernames.includes(u.username) && !demoUserIds.includes(u.id)
        );
        
        // S'assurer que le profil Directrice (Lauréline Henkens) est toujours présent dans les comptes existants
        if (!loadedUsers.some(u => u.role === 'directrice' || u.username.toLowerCase().includes('laur'))) {
          const dirUser = DEFAULT_CRM_DATA.users.find(u => u.role === 'directrice');
          if (dirUser) {
            loadedUsers = [dirUser, ...loadedUsers];
          }
        }

        // Nettoyage automatique du rôle obsolète "admin" (et bascule en "user" si nécessaire)
        const loadedRoles = (parsed.roles || DEFAULT_CRM_DATA.roles || ['directrice', 'user']).filter(r => r !== 'admin');
        if (!loadedRoles.includes('directrice')) loadedRoles.unshift('directrice');
        if (!loadedRoles.includes('user')) loadedRoles.push('user');
        loadedUsers = loadedUsers.map(u => (u.role === 'admin' ? { ...u, role: 'user' } : u));

        const rawTemplates = parsed.emailTemplates || DEFAULT_CRM_DATA.emailTemplates;
        const loadedTemplates = rawTemplates.map((t, idx) => {
          const defaultT = DEFAULT_CRM_DATA.emailTemplates.find(dt => dt.id === t.id) || DEFAULT_CRM_DATA.emailTemplates[idx];
          return {
            ...t,
            category: t.category || defaultT?.category || 'Général',
            shortcut: t.shortcut || defaultT?.shortcut || `/${t.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'mail'}`
          };
        });

        const loadedCategories = parsed.templateCategories && parsed.templateCategories.length > 0
          ? parsed.templateCategories
          : [...(DEFAULT_CRM_DATA.templateCategories || ['Prospection', 'Relance', 'Suivi & Fidélisation', 'Evénements & Devis', 'Général'])];

        const loadedCloudConfig = parsed.cloudConfig || { ...DEFAULT_CRM_DATA.cloudConfig };
        loadedCloudConfig.enabled = true;
        loadedCloudConfig.provider = 'jsonbin';
        loadedCloudConfig.jsonbinId = '6a5a442bf5f4af5e299ce6d0';
        loadedCloudConfig.jsonbinKey = '$2a$10$ef5q0hmsrglb4cCJeE5mGebf9IdiM75IE.TW6EbK5kXQfg9sBiKIi';
        loadedCloudConfig.autoPoll = true;
        loadedCloudConfig.supabaseUrl = '';
        loadedCloudConfig.supabaseKey = '';


        const finalData: CRMData = {
          contacts: cleanedContacts,
          users: loadedUsers,
          contactTypes: parsed.contactTypes || DEFAULT_CRM_DATA.contactTypes,
          statuses: parsed.statuses || DEFAULT_CRM_DATA.statuses,
          tags: parsed.tags || DEFAULT_CRM_DATA.tags,
          roles: loadedRoles,
          templateCategories: loadedCategories,
          emailTemplates: loadedTemplates,
          cloudConfig: loadedCloudConfig
        };

        // Si le nettoyage a supprimé des données de démo du cache, on ré-enregistre silencieusement
        if (cleanedContacts.length !== (parsed.contacts || []).length || loadedUsers.length !== (parsed.users || []).length) {
          setTimeout(() => {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
            } catch (e) {
              console.error('Failed to auto-clean storage:', e);
            }
          }, 0);
        }

        return finalData;
      }
    } catch (err) {
      console.error('Failed to load CRM data from localStorage:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CRM_DATA));
  }

  private saveToLocalStorage(skipCloudSync = false): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notifyListeners();
      
      if (!skipCloudSync && this.data.cloudConfig?.enabled) {
        this.syncToCloud();
      }
    } catch (err) {
      console.error('Failed to save CRM data to localStorage:', err);
    }
  }

  private notifyListeners(): void {
    window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail: this.data }));
  }

  public async syncToCloud(): Promise<boolean> {
    try {
      if (!this.data.cloudConfig?.enabled) return false;
      const { provider, jsonbinId, jsonbinKey, supabaseUrl, supabaseKey } = this.data.cloudConfig;

      this.data.cloudConfig.lastSync = new Date().toLocaleTimeString();

      if (provider === 'supabase' && supabaseUrl && supabaseKey) {

        const res = await fetch(`${supabaseUrl}/rest/v1/sfg_crm_store?id=eq.1`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ data: this.data, updated_at: new Date().toISOString() })
        });
        if (res.ok) return true;
      } else {
        const binId = jsonbinId || '6a5a442bf5f4af5e299ce6d0';
        const binKey = jsonbinKey || '$2a$10$ef5q0hmsrglb4cCJeE5mGebf9IdiM75IE.TW6EbK5kXQfg9sBiKIi';
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': binKey
          },
          body: JSON.stringify(this.data)
        });
        if (res.ok) {
          console.info('[Realtime Cloud Sync] Push JSONBin réussi !');
          return true;
        }
      }
    } catch (e) {
      console.warn('[Realtime Cloud Sync] Erreur push distant:', e);
    }
    return false;
  }

  private smartMergeData(local: CRMData, remote: CRMData): { merged: CRMData; remoteNeedsUpdate: boolean } {
    let remoteNeedsUpdate = false;

    const allDeletedIds = new Set([...(local.deletedContactIds || []), ...(remote.deletedContactIds || [])]);

    // 1. Merge contacts by id
    const mergedContactsMap = new Map<string, any>();
    
    (remote.contacts || []).forEach(rc => {
      if (!allDeletedIds.has(rc.id)) {
        mergedContactsMap.set(rc.id, rc);
      }
    });

    (local.contacts || []).forEach(lc => {
      if (allDeletedIds.has(lc.id)) return;
      if (!mergedContactsMap.has(lc.id)) {
        mergedContactsMap.set(lc.id, lc);
        remoteNeedsUpdate = true;
      } else {
        const rc = mergedContactsMap.get(lc.id)!;
        const localTime = new Date(lc.updatedAt || lc.createdAt || 0).getTime() || 0;
        const remoteTime = new Date(rc.updatedAt || rc.createdAt || 0).getTime() || 0;
        
        const localRicher = (lc.notes?.length || 0) > (rc.notes?.length || 0) || (lc.logs?.length || 0) > (rc.logs?.length || 0);
        if (localRicher || localTime >= remoteTime) {
          mergedContactsMap.set(lc.id, lc);
          remoteNeedsUpdate = true;
        }
      }
    });

    const mergedContacts = Array.from(mergedContactsMap.values()).filter(c => !allDeletedIds.has(c.id));


    // 2. Merge tags
    const mergedTagsMap = new Map<string, any>();
    (remote.tags || []).forEach(rt => mergedTagsMap.set(rt.id || rt.name, rt));
    (local.tags || []).forEach(lt => {
      if (!mergedTagsMap.has(lt.id || lt.name)) {
        mergedTagsMap.set(lt.id || lt.name, lt);
        remoteNeedsUpdate = true;
      }
    });

    // 3. Merge contactTypes, statuses, roles
    const mergedTypes = Array.from(new Set([...(remote.contactTypes || []), ...(local.contactTypes || [])]));
    if (mergedTypes.length > (remote.contactTypes || []).length) remoteNeedsUpdate = true;

    const mergedStatuses = Array.from(new Set([...(remote.statuses || []), ...(local.statuses || [])]));
    if (mergedStatuses.length > (remote.statuses || []).length) remoteNeedsUpdate = true;

    const mergedRoles = Array.from(new Set([...(remote.roles || []), ...(local.roles || [])]));
    if (mergedRoles.length > (remote.roles || []).length) remoteNeedsUpdate = true;

    // 4. Merge users
    const mergedUsersMap = new Map<string, any>();
    (remote.users || []).forEach(ru => mergedUsersMap.set(ru.username.toLowerCase(), ru));
    (local.users || []).forEach(lu => {
      if (!mergedUsersMap.has(lu.username.toLowerCase())) {
        mergedUsersMap.set(lu.username.toLowerCase(), lu);
        remoteNeedsUpdate = true;
      }
    });

    // 5. Merge templateCategories and emailTemplates
    const mergedCategories = Array.from(new Set([...(remote.templateCategories || []), ...(local.templateCategories || [])]));
    if (mergedCategories.length > (remote.templateCategories || []).length) remoteNeedsUpdate = true;

    const mergedTemplatesMap = new Map<string, any>();
    (remote.emailTemplates || []).forEach(rt => mergedTemplatesMap.set(rt.id || rt.title, rt));
    (local.emailTemplates || []).forEach(lt => {
      if (!mergedTemplatesMap.has(lt.id || lt.title)) {
        mergedTemplatesMap.set(lt.id || lt.title, lt);
        remoteNeedsUpdate = true;
      }
    });
    const mergedTemplates = Array.from(mergedTemplatesMap.values());

    const merged: CRMData = {
      contacts: mergedContacts,
      deletedContactIds: Array.from(allDeletedIds),
      users: Array.from(mergedUsersMap.values()),
      contactTypes: mergedTypes,
      statuses: mergedStatuses,
      tags: Array.from(mergedTagsMap.values()),
      roles: mergedRoles,
      templateCategories: mergedCategories,
      emailTemplates: mergedTemplates,
      cloudConfig: { ...remote.cloudConfig, ...local.cloudConfig, lastSync: new Date().toLocaleTimeString() }
    };



    return { merged, remoteNeedsUpdate };
  }

  public async pullFromCloud(): Promise<boolean> {
    try {
      if (!this.data.cloudConfig?.enabled) return false;
      const { provider, jsonbinId, jsonbinKey, supabaseUrl, supabaseKey } = this.data.cloudConfig;

      if (provider === 'supabase' && supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/sfg_crm_store?id=eq.1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (res.ok) {
          const rows = await res.json();
          const remoteData = rows?.[0]?.data as CRMData;
          if (remoteData && remoteData.contacts && remoteData.users) {
            const { merged, remoteNeedsUpdate } = this.smartMergeData(this.data, remoteData);
            const localCheck = JSON.stringify({ ...this.data, cloudConfig: null });
            const mergedCheck = JSON.stringify({ ...merged, cloudConfig: null });

            if (localCheck !== mergedCheck) {
              console.info('[Realtime Cloud Sync] Modifications Supabase détectées -> Fusion.');
              this.data = merged;
              this.saveToLocalStorage(true);
            }
            if (remoteNeedsUpdate || ((this.data.contacts || []).length > 0 && (remoteData.contacts || []).length === 0)) {
              setTimeout(() => { this.syncToCloud(); }, 500);
            }
            return true;
          }
        }
      } else {
        const binId = jsonbinId || '6a5a442bf5f4af5e299ce6d0';
        const binKey = jsonbinKey || '$2a$10$ef5q0hmsrglb4cCJeE5mGebf9IdiM75IE.TW6EbK5kXQfg9sBiKIi';
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
          method: 'GET',
          headers: {
            'X-Master-Key': binKey
          }
        });
        if (res.ok) {
          const json = await res.json();
          const remoteData = (json.record || {}) as any;
          
          if ((!remoteData.contacts || (remoteData.contacts || []).length === 0) && !remoteData.cloudConfig?.lastSync && !remoteData.deletedContactIds?.length) {
            if ((this.data.contacts || []).length > 0) {
              setTimeout(() => {
                this.syncToCloud();
              }, 500);
            }
          } else if (remoteData.contacts && Array.isArray(remoteData.contacts)) {
            const { merged, remoteNeedsUpdate } = this.smartMergeData(this.data, remoteData);
            const localCheck = JSON.stringify({ ...this.data, cloudConfig: null });
            const mergedCheck = JSON.stringify({ ...merged, cloudConfig: null });

            if (localCheck !== mergedCheck) {
              console.info('[Realtime Cloud Sync] Modifications en ligne détectées -> Fusion intelligente.');
              this.data = merged;
              this.saveToLocalStorage(true);
            }

            if (remoteNeedsUpdate) {
              setTimeout(() => {
                this.syncToCloud();
              }, 500);
            }
            return true;
          }

        }
      }
    } catch (e) {
      console.warn('[Realtime Cloud Sync] Erreur pull distant:', e);
    }
    return false;
  }


  public getData(): CRMData {
    return this.data;
  }

  public resetToDefault(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_CRM_DATA));
    this.saveToLocalStorage();
  }

  public exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as CRMData;
      if (parsed && typeof parsed === 'object') {
        this.data = parsed;
        this.saveToLocalStorage();
        return true;
      }
    } catch (e) {
      console.error('Erreur lors de la lecture du fichier de sauvegarde JSON:', e);
    }
    return false;
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
    this.data.deletedContactIds = Array.from(new Set([...(this.data.deletedContactIds || []), id]));
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    this.saveToLocalStorage();
  }

  public clearAllContacts(): void {
    const allIds = this.data.contacts.map(c => c.id);
    this.data.deletedContactIds = Array.from(new Set([...(this.data.deletedContactIds || []), ...allIds]));
    this.data.contacts = [];
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
    return [...(this.data.contactTypes || [])];
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
    this.data.contacts.forEach(c => {
      if (c.type) {
        const types = c.type.split(',').map(t => t.trim());
        if (types.includes(type)) {
          const filtered = types.filter(t => t !== type);
          c.type = filtered.length > 0 ? filtered.join(', ') : 'Autre';
        }
      }
    });
    this.saveToLocalStorage();
  }

  public updateContactType(oldType: string, newType: string): void {
    const trimmed = newType.trim();
    if (!trimmed || oldType === trimmed) return;
    const index = this.data.contactTypes.indexOf(oldType);
    if (index >= 0) {
      this.data.contactTypes[index] = trimmed;
    } else if (!this.data.contactTypes.includes(trimmed)) {
      this.data.contactTypes.push(trimmed);
    }
    this.data.contacts.forEach(c => {
      if (c.type) {
        const types = c.type.split(',').map(t => t.trim());
        if (types.includes(oldType)) {
          c.type = types.map(t => t === oldType ? trimmed : t).join(', ');
        }
      }
    });
    this.saveToLocalStorage();
  }

  // --- Statuses ---
  public getStatuses(): string[] {
    return [...(this.data.statuses || [])];
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

  public reorderStatuses(newOrder: string[]): void {
    if (!newOrder || !Array.isArray(newOrder) || newOrder.length === 0) return;
    this.data.statuses = [...newOrder];
    this.saveToLocalStorage();
  }

  // --- Roles ---
  public getRoles(): string[] {
    if (!this.data.roles || this.data.roles.length === 0) {
      this.data.roles = [...(DEFAULT_CRM_DATA.roles || ['directrice', 'user'])];
      this.saveToLocalStorage();
    }
    return [...this.data.roles];
  }

  public addRole(roleName: string): void {
    const trimmed = roleName.trim();
    if (trimmed && !this.data.roles?.includes(trimmed)) {
      this.data.roles!.push(trimmed);
      this.saveToLocalStorage();
    }
  }

  public updateRole(oldRole: string, newRole: string): void {
    const trimmed = newRole.trim();
    if (!trimmed || oldRole === trimmed) return;
    const index = this.data.roles!.indexOf(oldRole);
    if (index >= 0) {
      this.data.roles![index] = trimmed;
    } else {
      this.data.roles!.push(trimmed);
    }
    // Update users having this role
    this.data.users.forEach(u => {
      if (u.role === oldRole) {
        u.role = trimmed;
      }
    });
    this.saveToLocalStorage();
  }

  public deleteRole(roleName: string): void {
    if (roleName === 'directrice') return; // protection du rôle principal
    this.data.roles = (this.data.roles || []).filter(r => r !== roleName);
    // Switch users with deleted role to 'user'
    this.data.users.forEach(u => {
      if (u.role === roleName) {
        u.role = 'user';
      }
    });
    this.saveToLocalStorage();
  }

  // --- Tags ---
  public getTags(): TagDefinition[] {
    return [...(this.data.tags || [])];
  }

  public saveTag(tag: TagDefinition): void {
    const index = this.data.tags.findIndex(t => t.id === tag.id);
    if (index >= 0) {
      const oldName = this.data.tags[index].name;
      this.data.tags[index] = tag;
      if (oldName && oldName !== tag.name) {
        this.data.contacts.forEach(c => {
          if (c.tags && c.tags.includes(oldName)) {
            c.tags = c.tags.map(name => name === oldName ? tag.name : name);
          }
        });
      }
    } else {
      this.data.tags.push(tag);
    }
    this.saveToLocalStorage();
  }

  public deleteTag(id: string): void {
    const tagToDelete = this.data.tags.find(t => t.id === id);
    if (tagToDelete) {
      this.data.tags = this.data.tags.filter(t => t.id !== id);
      this.data.contacts.forEach(c => {
        if (c.tags && c.tags.includes(tagToDelete.name)) {
          c.tags = c.tags.filter(name => name !== tagToDelete.name);
        }
      });
      this.saveToLocalStorage();
    }
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
    return [...(this.data.users || [])];
  }

  public addUser(username: string, role: string = 'user', email?: string, password?: string, isInvited?: boolean): User {
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

  // --- Email Templates & Categories ---
  public getTemplateCategories(): string[] {
    if (!this.data.templateCategories || this.data.templateCategories.length === 0) {
      this.data.templateCategories = [...(DEFAULT_CRM_DATA.templateCategories || ['Prospection', 'Relance', 'Suivi & Fidélisation', 'Evénements & Devis', 'Général'])];
      this.saveToLocalStorage();
    }
    return this.data.templateCategories;
  }

  public addTemplateCategory(categoryName: string): void {
    const trimmed = categoryName.trim();
    if (trimmed && !this.getTemplateCategories().includes(trimmed)) {
      this.data.templateCategories!.push(trimmed);
      this.saveToLocalStorage();
    }
  }

  public updateTemplateCategory(oldCategory: string, newCategory: string): void {
    const trimmed = newCategory.trim();
    if (!trimmed || oldCategory === trimmed) return;
    const categories = this.getTemplateCategories();
    const index = categories.indexOf(oldCategory);
    if (index >= 0) {
      this.data.templateCategories![index] = trimmed;
    } else {
      this.data.templateCategories!.push(trimmed);
    }
    // Update existing templates using oldCategory
    this.data.emailTemplates.forEach(t => {
      if (t.category === oldCategory) {
        t.category = trimmed;
      }
    });
    this.saveToLocalStorage();
  }

  public deleteTemplateCategory(categoryName: string): void {
    const categories = this.getTemplateCategories();
    if (categories.length <= 1) return; // Ne pas supprimer si c'est la seule
    this.data.templateCategories = categories.filter(c => c !== categoryName);
    // Move templates with deleted category to 'Général' or first available
    const fallback = this.data.templateCategories[0] || 'Général';
    this.data.emailTemplates.forEach(t => {
      if (t.category === categoryName) {
        t.category = fallback;
      }
    });
    this.saveToLocalStorage();
  }

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

  public getGmailAccounts(): string[] {
    const saved = localStorage.getItem('sfg_gmail_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return ['laureline@spacefungames.fr', 'share&fun@spacefungames.fr', 'henkens.laureline@gmail.com'];
  }

  public saveGmailAccounts(accounts: string[]): void {
    localStorage.setItem('sfg_gmail_accounts', JSON.stringify(accounts));
  }

  public getPreferredEmailProvider(): string {
    const saved = localStorage.getItem('sfg_preferred_email_provider');
    // Si l'utilisateur avait une ancienne configuration u/0, u/1 ou gmail pur, on bascule sur sa 1ère adresse en clair
    if (!saved || saved.startsWith('gmail-') || saved === 'gmail') {
      const accounts = this.getGmailAccounts();
      return accounts.length > 0 ? `gmail:${accounts[0]}` : 'gmail';
    }
    return saved;
  }

  public setPreferredEmailProvider(provider: string): void {
    localStorage.setItem('sfg_preferred_email_provider', provider);
  }

  public dispatchEmail(to: string, subject: string, body: string, provider?: string): void {
    const chosenProvider = provider || this.getPreferredEmailProvider();
    const encodedTo = encodeURIComponent(to);
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    if (chosenProvider.startsWith('gmail:')) {
      const emailAccount = chosenProvider.substring(6).trim();
      window.open(`https://mail.google.com/mail/?authuser=${encodeURIComponent(emailAccount)}&view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`, '_blank');
    } else if (chosenProvider === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`, '_blank');
    } else if (chosenProvider === 'outlook-pro') {
      window.open(`https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`, '_blank');
    } else if (chosenProvider === 'outlook-live') {
      window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`, '_blank');
    } else if (chosenProvider === 'yahoo') {
      window.open(`https://compose.mail.yahoo.com/?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`, '_blank');
    } else if (chosenProvider === 'copy') {
      const fullText = `Destinataire : ${to}\nObjet : ${subject}\n\n${body}`;
      navigator.clipboard.writeText(fullText);
      alert(`✅ Message et adresse copiés dans votre presse-papiers !\n\nDestinataire : ${to}\n\nVous pouvez maintenant coller le tout dans la boîte e-mail ou le compte de votre choix.`);
    } else if (chosenProvider === 'thunderbird' || chosenProvider === 'mailto') {
      // 'thunderbird' ou 'mailto' - Lance directement le logiciel de messagerie local de l'ordinateur via le protocole mailto:
      window.location.href = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    } else {
      window.location.href = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    }
  }
}

export const storageService = StorageService.getInstance();
