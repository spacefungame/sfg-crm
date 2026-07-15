import React, { useState } from 'react';
import type { Contact } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Mail, Send, FileText, X, ExternalLink } from 'lucide-react';
import { EmailProviderSelector } from './EmailProviderSelector';

interface EmailTemplatePickerModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onMailSent: () => void;
}

export const EmailTemplatePickerModal: React.FC<EmailTemplatePickerModalProps> = ({
  contact,
  isOpen,
  onClose,
  onMailSent
}) => {
  const { currentUser } = useAuth();
  const templates = storageService.getEmailTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('free'); // 'free' = E-mail libre
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [provider, setProvider] = useState<string>(storageService.getPreferredEmailProvider());

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

    // Launch via selected email provider (Gmail, Outlook Web, Yahoo, Mailto, or Copy)
    storageService.dispatchEmail(contact.email, subjectToSend, bodyToSend, provider);

    onMailSent();
    onClose();
  };

  return (
    <div className="overlay-backdrop animate-fade-in">
      <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '520px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        
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
          
          {/* Sélection du modèle */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              Choisir un modèle d'e-mail :
            </label>
            <select
              className="input-field"
              value={selectedTemplateId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTemplateId(val);
                if (val === 'free') {
                  setCustomSubject('');
                  setCustomBody('');
                }
              }}
              style={{ fontWeight: 600 }}
            >
              <option value="free">✉️ E-mail libre (Saisie manuelle / vide)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  📄 {t.title} ({t.subject})
                </option>
              ))}
            </select>
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
