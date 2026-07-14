import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storageService } from './services/storageService';
import type { Contact, EmailTemplate } from './types/crm';

// Components
import { Header } from './components/Header';
import { ContactFilters } from './components/ContactFilters';
import type { FilterState } from './components/ContactFilters';
import { ContactList } from './components/ContactList';
import { ContactCardModal } from './components/ContactCardModal';
import { ReturnPromptModal } from './components/ReturnPromptModal';
import { ImportModal } from './components/ImportModal';
import { LoginModal } from './components/LoginModal';
import { NewContactModal } from './components/NewContactModal';
import { TemplatesManager } from './components/TemplatesManager';
import { ReportsView } from './components/ReportsView';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentTab, setCurrentTab] = useState<'contacts' | 'reports' | 'templates'>('contacts');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    establishment: 'all',
    type: 'all',
    status: 'all',
    urgency: 'all'
  });

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Load and refresh contacts from storage
  const loadContacts = () => {
    const data = storageService.getContacts();
    setContacts(data);
    if (selectedContact) {
      const refreshed = storageService.getContactById(selectedContact.id);
      setSelectedContact(refreshed || null);
    }
  };

  useEffect(() => {
    loadContacts();

    // Listen to data updates across tabs/components
    const handleStorageUpdate = () => {
      loadContacts();
    };

    window.addEventListener('crm_data_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('crm_data_updated', handleStorageUpdate);
    };
  }, []);

  // Compute filtered contacts
  const filteredContacts = contacts.filter((c) => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || `${c.lastName} ${c.firstName}`.toLowerCase().includes(q);
      const matchCompany = c.company?.toLowerCase().includes(q);
      const matchPhone = c.phone?.includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchPhone && !matchEmail) return false;
    }

    // Establishment
    if (filters.establishment !== 'all') {
      if (c.establishment !== filters.establishment) return false;
    }

    // Type
    if (filters.type !== 'all') {
      if (c.type !== filters.type) return false;
    }

    // Status
    if (filters.status !== 'all') {
      if (c.status !== filters.status) return false;
    }

    // Urgency deadline
    if (filters.urgency !== 'all') {
      if (filters.urgency === 'none') {
        if (c.deadline) return false;
      } else if (filters.urgency === 'late') {
        const today = new Date().toISOString().split('T')[0];
        if (!c.deadline || c.deadline >= today) return false;
      } else if (filters.urgency === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (c.deadline !== today) return false;
      } else if (filters.urgency === 'future') {
        const today = new Date().toISOString().split('T')[0];
        if (!c.deadline || c.deadline <= today) return false;
      }
    }

    return true;
  });

  // Action Handlers
  const handleInitiateCall = (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!contact.phone) {
      alert(`Aucun numéro de téléphone enregistré pour ${contact.firstName} ${contact.lastName}.`);
      return;
    }

    // Record pending communication for magic return prompt
    storageService.setPendingCommunication(contact.id, 'call');
    
    // Log immediate action
    storageService.addActivityLog(contact.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'call',
      summary: `Appel initié vers ${contact.phone}`
    });
    loadContacts();

    // Launch tel link
    window.location.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
  };

  const handleInitiateMail = (contact: Contact, eOrTemplate?: React.MouseEvent | EmailTemplate, maybeTemplate?: EmailTemplate) => {
    if (eOrTemplate && 'stopPropagation' in eOrTemplate) {
      eOrTemplate.stopPropagation();
    }
    
    let template: EmailTemplate | undefined = maybeTemplate;
    if (eOrTemplate && !('stopPropagation' in eOrTemplate)) {
      template = eOrTemplate;
    }

    if (!contact.email) {
      alert(`Aucune adresse e-mail enregistrée pour ${contact.firstName} ${contact.lastName}.`);
      return;
    }

    // Prepare dynamic tag replacement
    let subject = template?.subject || `Message de Space Fun Games & Share & Fun`;
    let body = template?.body || `Bonjour ${contact.firstName},\n\n\nCordialement,\nL'équipe`;

    const replaceTags = (text: string) => {
      return text
        .replace(/\{Prénom\}/gi, contact.firstName || '')
        .replace(/\{Nom\}/gi, contact.lastName || '')
        .replace(/\{Société\}/gi, contact.company || contact.type || '');
    };

    subject = replaceTags(subject);
    body = replaceTags(body);

    // Record pending communication
    storageService.setPendingCommunication(contact.id, 'mail', template?.title || 'E-mail libre');

    // Log immediate action
    storageService.addActivityLog(contact.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'mail',
      summary: `E-mail lancé (${template ? `modèle : ${template.title}` : 'libre'}) vers ${contact.email}`
    });
    loadContacts();

    // Launch mailto link
    const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Header Navigation Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenNewContact={() => setIsNewContactOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Tab 1: Contacts & Prospects */}
        {currentTab === 'contacts' && (
          <div className="animate-fade-in">
            <ContactFilters
              filters={filters}
              onFilterChange={setFilters}
              totalCount={contacts.length}
              filteredCount={filteredContacts.length}
            />

            <ContactList
              contacts={filteredContacts}
              onSelectContact={(c) => setSelectedContact(c)}
              onRefresh={loadContacts}
              onQuickCall={(c, e) => handleInitiateCall(c, e)}
              onQuickMail={(c, e) => handleInitiateMail(c, e)}
            />
          </div>
        )}

        {/* Tab 2: Rapports d'Activité */}
        {currentTab === 'reports' && (
          <div className="animate-fade-in">
            <ReportsView contacts={contacts} />
          </div>
        )}

        {/* Tab 3: Modèles d'E-mails */}
        {currentTab === 'templates' && (
          <div className="animate-fade-in">
            <TemplatesManager onTemplatesChanged={loadContacts} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '16px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong>CRM Space Fun Games & Share & Fun</strong> • Système 100% en ligne, collaboratif & gratuit • Vos données sont sécurisées sur votre espace
      </footer>

      {/* Modals & Overlays */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCompleted={loadContacts}
      />

      <NewContactModal
        isOpen={isNewContactOpen}
        onClose={() => setIsNewContactOpen(false)}
        onCreated={(newC) => {
          loadContacts();
          setSelectedContact(newC); // Auto open the contact card for the newly created contact
        }}
      />

      <ContactCardModal
        contact={selectedContact}
        isOpen={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        onUpdate={loadContacts}
        onInitiateCall={(c) => handleInitiateCall(c)}
        onInitiateMail={(c, template) => handleInitiateMail(c, template)}
      />

      <ReturnPromptModal
        onUpdate={loadContacts}
      />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
