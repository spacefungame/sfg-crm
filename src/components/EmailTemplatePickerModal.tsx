import React, { useState, useEffect } from 'react';
import type { Contact } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Mail, Send, FileText, X, ExternalLink, Zap, Search, Tag } from 'lucide-react';
import { EmailProviderSelector } from './EmailProviderSelector';

interface EmailTemplatePickerModalProps {
  contact: Contact | null;
  isOpen: boolean;
  initialTemplateId?: string;
  onClose: () => void;
  onMailSent: () => void;
}

export const EmailTemplatePickerModal: React.FC<EmailTemplatePickerModalProps> = ({
  contact,
  isOpen,
  initialTemplateId,
  onClose,
  onMailSent
}) => {
  const { currentUser } = useAuth();
  const templates = storageService.getEmailTemplates();
  const categories = storageService.getTemplateCategories();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('free'); // 'free' = E-mail libre
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shortcutQuery, setShortcutQuery] = useState<string>('');
  const [shortcutMatchBanner, setShortcutMatchBanner] = useState<string | null>(null);

  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [provider, setProvider] = useState<string>(storageService.getPreferredEmailProvider());

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId(initialTemplateId || 'free');
      setSelectedCategory('all');
      setShortcutQuery('');
      setShortcutMatchBanner(null);
    }
  }, [isOpen, initialTemplateId]);

  if (!isOpen || !contact) return null;

  const replaceTags = (text: string) => {
    return text
      .replace(/\{Prénom\}/gi, contact.firstName || '')
      .replace(/\{Nom\}/gi, contact.lastName || '')
      .replace(/\{Société\}/gi, contact.company || contact.type || '');
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const subjectToSend = selectedTemplate 
    ? replaceTags(selectedTemplate.subject) 
    : customSubject || `Contact Space Fun Games & Share & Fun`;

  const bodyToSend = selectedTemplate 
    ? replaceTags(selectedTemplate.body) 
    : customBody || `Bonjour ${contact.firstName},\n\n\nCordialement,\n${currentUser ? currentUser.username : 'L\'équipe'}`;

  // Handle shortcut or search input
  const handleShortcutOrSearchChange = (query: string) => {
    setShortcutQuery(query);
    const qClean = query.trim().toLowerCase();
    if (!qClean) {
      setShortcutMatchBanner(null);
      return;
    }

    // Check exact shortcut match (e.g. "/intro" or "intro")
    const exactMatch = templates.find(t => {
      if (!t.shortcut) return false;
      const sClean = t.shortcut.trim().toLowerCase();
      return sClean === qClean || (sClean.startsWith('/') && sClean.slice(1) === qClean);
    });

    if (exactMatch) {
      setSelectedTemplateId(exactMatch.id);
      setShortcutMatchBanner(`⚡ Raccourci "${exactMatch.shortcut}" reconnu : Modèle "${exactMatch.title}" sélectionné !`);
      if (selectedCategory !== 'all' && exactMatch.category !== selectedCategory) {
        setSelectedCategory(exactMatch.category || 'Général');
      }
    } else {
      setShortcutMatchBanner(null);
    }
  };

  // Filter templates based on category and search query
  const filteredTemplates = templates.filter(tpl => {
    if (selectedCategory !== 'all' && (tpl.category || 'Général') !== selectedCategory) {
      return false;
    }
    if (shortcutQuery.trim()) {
      const q = shortcutQuery.trim().toLowerCase();
      const matchShortcut = tpl.shortcut?.toLowerCase().includes(q);
      const matchTitle = tpl.title.toLowerCase().includes(q);
      const matchSubject = tpl.subject.toLowerCase().includes(q);
      return matchShortcut || matchTitle || matchSubject;
    }
    return true;
  });

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.email) {
      alert(`Aucune adresse e-mail enregistrée pour ce contact.`);
      return;
    }

    // Record pending communication for magic return prompt
    storageService.setPendingCommunication(contact.id, 'mail', selectedTemplate?.title || 'E-mail libre');

    // Log action
    storageService.addActivityLog(contact.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'mail',
      summary: `E-mail lancé (${selectedTemplate ? `Modèle : ${selectedTemplate.title}` : 'E-mail libre'}) via ${provider} vers ${contact.email}`
    });

    // Launch via selected email provider
    storageService.dispatchEmail(contact.email, subjectToSend, bodyToSend, provider);

    onMailSent();
    onClose();
  };

  return (
    <div className="overlay-backdrop animate-fade-in">
      <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '580px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)' }}>
                Envoyer un e-mail à {contact.firstName} {contact.lastName}
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
                {contact.email}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSendMail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Section de recherche rapide & raccourci */}
          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              <Zap size={16} style={{ color: '#B76E00' }} />
              Recherche rapide par raccourci ou mot-clé :
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Taper un raccourci (ex: /intro, /relance1, /visite) ou un titre..."
                value={shortcutQuery}
                onChange={(e) => handleShortcutOrSearchChange(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              {shortcutQuery && (
                <button
                  type="button"
                  onClick={() => handleShortcutOrSearchChange('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {shortcutMatchBanner && (
              <div className="animate-fade-in" style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#FFF4E5', color: '#B76E00', borderRadius: 'var(--radius-sm)', border: '1px solid #FFE2B7', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} /> {shortcutMatchBanner}
              </div>
            )}

            {/* Filtres par catégorie */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={13} /> Filtrer par catégorie :
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedCategory === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedCategory === 'all' ? 'var(--primary)' : '#FFFFFF',
                    color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-main)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Toutes ({templates.length})
                </button>

                {categories.map((cat) => {
                  const count = templates.filter(t => (t.category || 'Général') === cat).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sélection rapide par fiches/boutons */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              Modèles disponibles {selectedCategory !== 'all' ? `(${selectedCategory})` : ''} :
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
              <button
                type="button"
                onClick={() => setSelectedTemplateId('free')}
                style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedTemplateId === 'free' ? '2px solid var(--primary)' : '1px dashed var(--border)',
                  backgroundColor: selectedTemplateId === 'free' ? 'var(--primary-light)' : 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  ✉️ E-mail libre (Saisie manuelle / vide)
                </span>
                {selectedTemplateId === 'free' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--primary)' }}>
                    Sélectionné
                  </span>
                )}
              </button>

              {filteredTemplates.map((t) => {
                const isSelected = selectedTemplateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      if (shortcutQuery && t.shortcut?.toLowerCase() === shortcutQuery.trim().toLowerCase()) {
                        // Keep shortcut input clean if clicked directly
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid #E3D9F2',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', backgroundColor: '#EFEBF6', color: '#533B82', flexShrink: 0 }}>
                        {t.category || 'Général'}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📄 {t.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Sujet : {t.subject}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {t.shortcut && (
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#FFF4E5', color: '#B76E00', border: '1px solid #FFE2B7' }}>
                          ⚡ {t.shortcut}
                        </span>
                      )}
                      {isSelected && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--primary)' }}>
                          Sélectionné
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px', textAlign: 'center', backgroundColor: '#FAF8F5', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                  Aucun modèle correspondant à cette recherche ou catégorie.
                </div>
              )}
            </div>
          </div>

          {/* Prévisualisation ou saisie libre */}
          {selectedTemplate ? (
            <div style={{ padding: '14px', backgroundColor: 'var(--surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                OBJET :
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
                {subjectToSend}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                CORPS DE L'E-MAIL :
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'pre-line', maxHeight: '180px', overflowY: 'auto', backgroundColor: 'var(--surface)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #EAE4D8' }}>
                {bodyToSend}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Objet de l'e-mail *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Prise de contact / Devis..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Message *
                </label>
                <textarea
                  className="input-field"
                  rows={5}
                  placeholder={`Bonjour ${contact.firstName},\n\n\nCordialement,\n${currentUser ? currentUser.username : 'L\'équipe'}`}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Sélecteur de boîte mail / Webmail */}
          <EmailProviderSelector value={provider} onChange={setProvider} />

          {/* Note sur la nouvelle fenêtre */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: '#F8F6F0', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExternalLink size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>
              Au clic, la boîte sélectionnée s'ouvrira <strong>dans un nouvel onglet/fenêtre</strong> prête à être envoyée par <em>{currentUser?.email || currentUser?.username || 'vous'}</em>.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Send size={16} />
              Ouvrir & Envoyer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
