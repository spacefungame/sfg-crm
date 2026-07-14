import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Contact, Establishment, ActivityLog } from '../types/crm';
import { storageService } from './storageService';

export interface ColumnMapping {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
}

export interface ImportPreviewRow {
  raw: Record<string, any>;
  parsed: {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    company?: string;
  };
  isDuplicate: boolean;
  duplicateOf?: Contact;
}

export class ImportService {
  public static async parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            resolve({ headers, rows: results.data as Record<string, any>[] });
          },
          error: (err) => reject(err)
        });
      });
    } else {
      // Excel .xlsx, .xls
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
            
            const headers: string[] = json.length > 0 ? Object.keys(json[0]) : [];
            resolve({ headers, rows: json });
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
      });
    }
  }

  public static autoDetectColumns(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
      lastName: '',
      firstName: '',
      email: '',
      phone: '',
      company: ''
    };

    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    for (const h of headers) {
      const n = normalize(h);
      if (!mapping.email && (n.includes('mail') || n.includes('courriel') || n === 'e-mail')) {
        mapping.email = h;
      } else if (!mapping.phone && (n.includes('tel') || n.includes('mob') || n.includes('port') || n.includes('phone') || n === 'gsm')) {
        mapping.phone = h;
      } else if (!mapping.firstName && (n.includes('prenom') || n.includes('first') || n === 'p.' || n === 'prénom')) {
        mapping.firstName = h;
      } else if (!mapping.company && (n.includes('socie') || n.includes('entrepr') || n.includes('comp') || n.includes('orga') || n.includes('etabli') || n.includes('structure') || n.includes('raison soc'))) {
        mapping.company = h;
      } else if (!mapping.lastName && (n.includes('nom') || n.includes('last') || n.includes('contact') || n === 'patronyme')) {
        // If it says "nom" and we don't have lastName yet, assign it
        if (n !== 'prénom' && !n.includes('prenom') && !n.includes('nom de la société') && !n.includes('nom entreprise')) {
          mapping.lastName = h;
        }
      }
    }

    return mapping;
  }

  public static analyzeRows(rows: Record<string, any>[], mapping: ColumnMapping): ImportPreviewRow[] {
    const existingContacts = storageService.getContacts();

    return rows.map(row => {
      const rawLastName = String(mapping.lastName ? row[mapping.lastName] || '' : '').trim();
      const rawFirstName = String(mapping.firstName ? row[mapping.firstName] || '' : '').trim();
      const rawEmail = String(mapping.email ? row[mapping.email] || '' : '').trim();
      const rawPhone = String(mapping.phone ? row[mapping.phone] || '' : '').trim();
      const rawCompany = String(mapping.company ? row[mapping.company] || '' : '').trim();

      // Skip totally empty rows
      if (!rawLastName && !rawFirstName && !rawEmail && !rawPhone && !rawCompany) {
        return null;
      }

      // Check duplicate against existing DB
      let duplicateOf: Contact | undefined;

      if (rawEmail && rawEmail.includes('@')) {
        duplicateOf = existingContacts.find(c => c.email && c.email.toLowerCase() === rawEmail.toLowerCase());
      }
      if (!duplicateOf && rawPhone && rawPhone.length > 5) {
        const cleanPhone = rawPhone.replace(/\D/g, '');
        duplicateOf = existingContacts.find(c => {
          const cleanExisting = c.phone.replace(/\D/g, '');
          return cleanExisting && cleanExisting.length > 6 && cleanExisting === cleanPhone;
        });
      }
      if (!duplicateOf && (rawLastName || rawFirstName)) {
        duplicateOf = existingContacts.find(c => 
          c.lastName.toLowerCase() === rawLastName.toLowerCase() && 
          c.firstName.toLowerCase() === rawFirstName.toLowerCase() &&
          (rawLastName.length > 1 || rawFirstName.length > 1)
        );
      }

      return {
        raw: row,
        parsed: {
          lastName: rawLastName || (rawCompany ? rawCompany : 'Inconnu'),
          firstName: rawFirstName,
          email: rawEmail,
          phone: rawPhone,
          company: rawCompany || undefined
        },
        isDuplicate: !!duplicateOf,
        duplicateOf
      };
    }).filter(Boolean) as ImportPreviewRow[];
  }

  public static executeImport(
    previews: ImportPreviewRow[],
    type: string,
    establishment: Establishment,
    employeeName: string,
    tags: string[] = []
  ): { addedCount: number; updatedCount: number } {
    let addedCount = 0;
    let updatedCount = 0;

    for (const item of previews) {
      if (item.isDuplicate && item.duplicateOf) {
        // Merge without duplicate
        const contact = item.duplicateOf;
        if (!contact.phone && item.parsed.phone) {
          contact.phone = item.parsed.phone;
        }
        if (!contact.email && item.parsed.email) {
          contact.email = item.parsed.email;
        }
        if (!contact.company && item.parsed.company) {
          contact.company = item.parsed.company;
        }

        if (tags && tags.length > 0) {
          contact.tags = Array.from(new Set([...(contact.tags || []), ...tags]));
        }

        // Add log
        const log: ActivityLog = {
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          contactId: contact.id,
          employeeName,
          actionType: 'import',
          summary: `Ré-import de contact (${type} - ${establishment === 'space_fun_games' ? 'Space Fun Games' : establishment === 'share_and_fun' ? 'Share & Fun' : 'Les deux'}). Fiche mise à jour et doublon évité.${tags && tags.length > 0 ? ` Tags ajoutés : ${tags.join(', ')}` : ''}`,
          timestamp: new Date().toISOString()
        };
        contact.logs.unshift(log);
        contact.updatedAt = new Date().toISOString();
        storageService.saveContact(contact);
        updatedCount++;
      } else {
        // Create new contact
        const newContact: Contact = {
          id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          lastName: item.parsed.lastName,
          firstName: item.parsed.firstName,
          email: item.parsed.email,
          phone: item.parsed.phone,
          company: item.parsed.company,
          type: type.trim() || 'Entreprise',
          establishment,
          status: 'Nouveau : à contacter',
          tags: tags ? [...tags] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          logs: []
        };

        const initialLog: ActivityLog = {
          id: 'log-init-' + Date.now(),
          contactId: newContact.id,
          employeeName,
          actionType: 'import',
          summary: `Contact importé via fichier (${newContact.type}). Statut automatique : Nouveau : à contacter.`,
          newStatus: 'Nouveau : à contacter',
          timestamp: new Date().toISOString()
        };
        newContact.logs.push(initialLog);

        storageService.saveContact(newContact);
        addedCount++;
      }
    }

    // Ensure custom type is saved if new
    storageService.addContactType(type);

    return { addedCount, updatedCount };
  }
}
