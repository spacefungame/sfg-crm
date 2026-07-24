import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storageService } from './services/storageService';
import type { Contact, EmailTemplate } from './types/crm';
import { Shield } from 'lucide-react';

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
import { VersionChecker } from './components/VersionChecker';
import { ProjectsTableView } from './components/ProjectsTableView';

import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { EmailTemplatePickerModal } from './components/EmailTemplatePickerModal';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentTab, setCurrentTab] = useState<'contacts' | 'reports' | 'settings'>('contacts');
  const [activeContactCategory, setActiveContactCategory] = useState<'prospect' | 'project' | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    establishment: 'all',
    type: 'all',
    status: 'all',
    tag: 'all',
    urgency: 'all'
  });

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [emailPickerContact, setEmailPickerContact] = useState<Contact | null>(null);
  const [emailPickerTemplateId, setEmailPickerTemplateId] = useState<string | null>(null);

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
    // Category
    if (activeContactCategory) {
      const cat = storageService.getStatusCategory(c.status);
      if (cat !== activeContactCategory) return false;
    }

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
      if (c.establishment !== filters.establishment && c.establishment !== 'les_deux') return false;
    }

    // Type
    if (filters.type !== 'all') {
      const contactTypes = (c.type || '').split(',').map(t => t.trim());
      if (!contactTypes.includes(filters.type) && c.type !== filters.type) return false;
    }

    // Status
    if (filters.status !== 'all') {
      if (c.status !== filters.status) return false;
    }

    // Tag
    if (filters.tag && filters.tag !== 'all') {
      if (!c.tags || !c.tags.includes(filters.tag)) return false;
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

    // Launch tel link in new window per user instruction
    window.open(`tel:${contact.phone.replace(/\s+/g, '')}`, '_blank');
  };

  const handleInitiateMail = (contact: Contact, eOrTemplate?: React.MouseEvent | EmailTemplate, _maybeTemplate?: EmailTemplate) => {
    if (eOrTemplate && 'stopPropagation' in eOrTemplate) {
      eOrTemplate.stopPropagation();
    }
    
    if (!contact.email) {
      alert(`Aucune adresse e-mail enregistrée pour ${contact.firstName} ${contact.lastName}.`);
      return;
    }

    let initialTplId: string | null = null;
    if (eOrTemplate && 'id' in eOrTemplate && 'body' in eOrTemplate) {
      initialTplId = (eOrTemplate as EmailTemplate).id;
    } else if (_maybeTemplate && 'id' in _maybeTemplate && 'body' in _maybeTemplate) {
      initialTplId = (_maybeTemplate as EmailTemplate).id;
    }

    setEmailPickerTemplateId(initialTplId);
    setEmailPickerContact(contact);
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
      <main style={{ flex: 1, maxWidth: '1680px', width: '100%', margin: '0 auto', padding: '10px 14px' }}>
        
        {!currentUser ? (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Shield size={48} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '10px' }}>
              Accès Restreint
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Vous devez être connecté pour accéder aux données du CRM.
            </p>
            <button onClick={() => setIsLoginOpen(true)} className="btn btn-primary" style={{ margin: '0 auto' }}>
              Se connecter
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'contacts' && (
              <div className="animate-fade-in">
                {!activeContactCategory ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px' }}>
                    <h2 style={{ fontSize: '24px', color: 'var(--text-main)', marginBottom: '16px' }}>Sélectionnez une vue</h2>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        onClick={() => setActiveContactCategory('prospect')}
                        className="card card-hover"
                        style={{ padding: '40px', width: '300px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', display: 'flex', flexDirection: 'column', gap: '16px' }}
                      >
                        <div style={{ fontSize: '48px' }}>🎯</div>
                        <h3 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0 }}>Prospects</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Gérez vos nouveaux contacts, devis et relances.</p>
                      </button>
                      <button
                        onClick={() => setActiveContactCategory('project')}
                        className="card card-hover"
                        style={{ padding: '40px', width: '300px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', display: 'flex', flexDirection: 'column', gap: '16px' }}
                      >
                        <div style={{ fontSize: '48px' }}>🚀</div>
                        <h3 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0 }}>Projets en cours</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Suivez vos clients convertis et projets actifs.</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                      <button onClick={() => setActiveContactCategory(null)} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
                        &larr; Retour
                      </button>
                      <h2 style={{ display: 'inline-block', marginLeft: '16px', fontSize: '20px', color: 'var(--text-main)', margin: 0 }}>
                        {activeContactCategory === 'prospect' ? '🎯 Prospects' : '🚀 Projets en cours'}
                      </h2>
                    </div>
                    {activeContactCategory === 'prospect' ? (
                      <>
                        <ContactFilters
                          filters={filters}
                          onFilterChange={setFilters}
                          totalCount={contacts.filter(c => storageService.getStatusCategory(c.status) === activeContactCategory).length}
                          filteredCount={filteredContacts.length}
                        />

                        <ContactList
                          contacts={filteredContacts}
                          onSelectContact={(c) => setSelectedContact(c)}
                          onRefresh={loadContacts}
                          onQuickCall={(c, e) => handleInitiateCall(c, e)}
                          onQuickMail={(c, e) => handleInitiateMail(c, e)}
                        />
                      </>
                    ) : (
                      <ProjectsTableView
                        contacts={filteredContacts}
                        onContactClick={(c) => setSelectedContact(c)}
                        onRefresh={loadContacts}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tab 2: Rapports d'Activité */}
            {currentTab === 'reports' && (
              <div className="animate-fade-in">
                <ReportsView contacts={contacts} />
              </div>
            )}



            {/* Tab 4: Paramètres & Personnalisation */}
            {currentTab === 'settings' && (
              <div className="animate-fade-in">
                <SettingsView />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '6px 14px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        <strong>CRM Space Fun Games & Share & Fun</strong>
      </footer>

      {/* Modals & Overlays */}
      <VersionChecker />
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

      <EmailTemplatePickerModal
        contact={emailPickerContact}
        isOpen={emailPickerContact !== null}
        initialTemplateId={emailPickerTemplateId || undefined}
        onClose={() => {
          setEmailPickerContact(null);
          setEmailPickerTemplateId(null);
        }}
        onMailSent={loadContacts}
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
