import React, { useState, useEffect } from 'react';
import type { Contact, ContactStatus, Establishment, EmailTemplate } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Building2, Clock, X, Save, Plus, Trash2, Rocket, Dices, Sparkles, Send, MessageSquare } from 'lucide-react';

interface ContactCardModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onInitiateCall: (contact: Contact) => void;
  onInitiateMail: (contact: Contact, template?: EmailTemplate) => void;
}

export const ContactCardModal: React.FC<ContactCardModalProps> = ({
  contact,
  isOpen,
  onClose,
  onUpdate,
  onInitiateCall,
  onInitiateMail
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<Contact | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const contactTypes = storageService.getContactTypes();
  const emailTemplates = storageService.getEmailTemplates();
  const allTags = storageService.getTags();

  const statuses: ContactStatus[] = [
    'Nouveau : à contacter',
    'À relancer',
    'Rendez-vous fixé',
    'Devis envoyé',
    'Client converti',
    'Pas intéressé'
  ];

  const handleToggleTag = (tagName: string) => {
    if (!formData) return;
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    const updated = { ...formData, tags: newTags };
    setFormData(updated);
    storageService.saveContact(updated);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `${currentTags.includes(tagName) ? 'Tag retiré' : 'Tag ajouté'} : ${tagName}`
    });
    onUpdate();
  };

  useEffect(() => {
    if (contact) {
      setFormData(JSON.parse(JSON.stringify(contact)));
      setIsEditing(false);
      setShowTemplateSelector(false);
    }
  }, [contact]);

  if (!isOpen || !formData || !contact) return null;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveContact(formData);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'note',
      summary: 'Mise à jour manuelle des informations de la fiche contact.'
    });
    setIsEditing(false);
    onUpdate();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'note',
      summary: newNoteInput.trim()
    });
    
    // Refresh local contact state from DB
    const refreshed = storageService.getContactById(formData.id);
    if (refreshed) setFormData(JSON.parse(JSON.stringify(refreshed)));
    setNewNoteInput('');
    onUpdate();
  };

  const handleStatusOrDeadlineChange = (newStatus: ContactStatus | string, newDeadline?: string) => {
    const updated = { ...formData, status: newStatus as ContactStatus, deadline: newDeadline || undefined };
    setFormData(updated);
    storageService.saveContact(updated);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `Statut/Dead line mis à jour : ${newStatus} ${newDeadline ? `(Dead line : ${newDeadline})` : ''}`,
      newStatus,
      deadline: newDeadline
    });
    onUpdate();
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la fiche de ${formData.firstName} ${formData.lastName} ?`)) {
      storageService.deleteContact(formData.id);
      onUpdate();
      onClose();
    }
  };

  const getEstablishmentBadge = (est: Establishment) => {
    if (est === 'space_fun_games') {
      return <span className="badge badge-establishment-space"><Rocket size={13} /> Space Fun Games</span>;
    } else if (est === 'share_and_fun') {
      return <span className="badge badge-establishment-share"><Dices size={13} /> Share & Fun</span>;
    } else {
      return <span className="badge badge-establishment-both"><Sparkles size={13} /> Les deux</span>;
    }
  };

  const getTagBadge = (tagName: string) => {
    const found = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    const bg = found?.color || '#8B5A2B';
    return (
      <span key={tagName} style={{ backgroundColor: bg, color: '#FFF', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        🏷️ {tagName}
      </span>
    );
  };

  return (
    <div className="overlay-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          backgroundColor: 'var(--surface)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Bar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface-warm)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              {getEstablishmentBadge(formData.establishment)}
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', backgroundColor: 'var(--surface)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                {formData.type}
              </span>
              {formData.tags && formData.tags.map(t => getTagBadge(t))}
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)' }}>
              {formData.lastName} {formData.firstName}
            </h3>
            {formData.company && (
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Building2 size={15} />
                {formData.company}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
            >
              {isEditing ? 'Annuler l\'édition' : '✏️ Modifier fiches'}
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Action Button Bar (Call & Email with Templates) */}
        <div style={{ padding: '16px 24px', backgroundColor: '#F9F7F2', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onInitiateCall(formData)}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px 18px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#1C7D4A' }}
              disabled={!formData.phone}
            >
              <Phone size={18} />
              Appeler le {formData.phone || '(sans numéro)'}
            </button>

            <button
              type="button"
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px 18px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#533B82' }}
              disabled={!formData.email}
            >
              <Mail size={18} />
              Envoyer un E-mail
            </button>
          </div>

          {showTemplateSelector && (
            <div className="animate-fade-in" style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #D8CEEA', boxShadow: 'var(--shadow-sm)' }}>
              <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#4A306D', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={16} />
                Choisissez un template :
              </h5>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setShowTemplateSelector(false); onInitiateMail(formData); }}
                  style={{ padding: '10px 14px', textAlign: 'left', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}
                >
                  ✉️ E-mail vierge
                </button>
                {emailTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => { setShowTemplateSelector(false); onInitiateMail(formData, tpl); }}
                    style={{ padding: '10px 14px', textAlign: 'left', borderRadius: 'var(--radius-sm)', border: '1px solid #E3D9F2', backgroundColor: '#FAF7FF', color: '#3B235E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', backgroundColor: '#EFEBF6', color: '#533B82' }}>
                          {tpl.category || 'Général'}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{tpl.title}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7E699B' }}>Sujet : {tpl.subject}</div>
                    </div>
                    {tpl.shortcut && (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 7px', borderRadius: '6px', backgroundColor: '#FFF4E5', color: '#B76E00', border: '1px solid #FFE2B7', flexShrink: 0 }}>
                        ⚡ {tpl.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Statut actuel</label>
              <select value={formData.status} onChange={(e) => handleStatusOrDeadlineChange(e.target.value, formData.deadline)} className="input-field">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Dead line</label>
              <input type="date" className="input-field" value={formData.deadline || ''} onChange={(e) => handleStatusOrDeadlineChange(formData.status, e.target.value)} />
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>🏷️ Tags attribués au contact (cliquez pour ajouter / retirer) :</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allTags.map(tag => {
                const isSelected = (formData.tags || []).includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.name)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '2px solid #2A211D' : '1px dashed var(--border)',
                      backgroundColor: isSelected ? tag.color : 'transparent',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFDF9', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Nom / Patronyme *</label>
                  <input type="text" className="input-field" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Prénom</label>
                  <input type="text" className="input-field" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Téléphone</label>
                  <input type="text" className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>E-mail</label>
                  <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Société / Organisation</label>
                  <input type="text" className="input-field" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Type de contact</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    {contactTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Établissement</label>
                <select className="input-field" value={formData.establishment} onChange={(e) => setFormData({ ...formData, establishment: e.target.value as Establishment })}>
                  <option value="space_fun_games">🚀 Space Fun Games</option>
                  <option value="share_and_fun">🎲 Share & Fun</option>
                  <option value="les_deux">🌟 Les deux</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Notes générales</label>
                <textarea rows={3} className="input-field" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Enregistrer</button>
              </div>
            </form>
          ) : (
            formData.notes && (
              <div style={{ backgroundColor: 'var(--surface-warm)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>📝 Notes sur le client :</div>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{formData.notes}</div>
              </div>
            )
          )}

          {/* Add Note / Quick Log input */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={18} />
              Ajouter une note ou un compte-rendu rapide
            </h4>
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Le client confirme qu'il viendra en septembre, rappeler le 20 août..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!newNoteInput.trim()}>
                <Plus size={16} />
                Ajouter
              </button>
            </form>
          </div>

          {/* History Timeline */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} />
              Historique complet et chronologique ({formData.logs ? formData.logs.length : 0} actions)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {formData.logs && formData.logs.map((log) => {
                const isMail = log.actionType === 'mail';
                const isCall = log.actionType === 'call';

                return (
                  <div
                    key={log.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #ECE7DE',
                      backgroundColor: isMail ? '#FAF7FF' : isCall ? '#F4FAF6' : 'var(--surface)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>
                          👤 {log.employeeName}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          • {log.actionType === 'call' ? '📞 Appel téléphonique' : log.actionType === 'mail' ? '✉️ Courriel envoyé' : log.actionType === 'status_change' ? '🔄 Changement de statut' : log.actionType === 'import' ? '📥 Import Excel' : '📝 Note'}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                        {new Date(log.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {log.summary}
                    </div>

                    {log.newStatus && (
                      <div style={{ marginTop: '6px', fontSize: '12px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Nouveau statut :</span>
                        <span style={{ fontWeight: 600 }}>{log.newStatus}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Delete option */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-warm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary btn-sm"
            style={{ color: '#C81E1E', borderColor: '#FBD5D5', backgroundColor: '#FDE8E8' }}
          >
            <Trash2 size={15} />
            Supprimer ce client
          </button>

          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Fermer la fiche
          </button>
        </div>

      </div>
    </div>
  );
};
