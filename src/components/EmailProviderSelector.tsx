import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Globe, Plus, Trash2, Mail, Settings } from 'lucide-react';

interface EmailProviderSelectorProps {
  value: string;
  onChange: (provider: string) => void;
  compact?: boolean;
}

export const EmailProviderSelector: React.FC<EmailProviderSelectorProps> = ({ value, onChange, compact = false }) => {
  const [gmailAccounts, setGmailAccounts] = useState<string[]>(storageService.getGmailAccounts());
  const [isManaging, setIsManaging] = useState<boolean>(false);
  const [newAccountEmail, setNewAccountEmail] = useState<string>('');

  const handleChange = (newProvider: string) => {
    storageService.setPreferredEmailProvider(newProvider);
    onChange(newProvider);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAccountEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      alert('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    if (gmailAccounts.includes(trimmed)) {
      alert('Cette adresse e-mail est déjà dans la liste.');
      return;
    }
    const updated = [...gmailAccounts, trimmed];
    storageService.saveGmailAccounts(updated);
    setGmailAccounts(updated);
    setNewAccountEmail('');
    handleChange(`gmail:${trimmed}`);
  };

  const handleDeleteAccount = (accountToDelete: string) => {
    const updated = gmailAccounts.filter((a) => a !== accountToDelete);
    storageService.saveGmailAccounts(updated);
    setGmailAccounts(updated);
    if (value === `gmail:${accountToDelete}`) {
      const fallback = updated.length > 0 ? `gmail:${updated[0]}` : 'gmail';
      handleChange(fallback);
    }
  };

  return (
    <div style={{ padding: compact ? '10px 12px' : '14px', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
          <Globe size={16} style={{ color: '#0284C7' }} />
          Boîte e-mail à utiliser pour l'envoi :
        </label>
        <button
          type="button"
          onClick={() => setIsManaging(!isManaging)}
          style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
        >
          <Settings size={13} />
          {isManaging ? 'Fermer gestion adresses' : '+ Gérer adresses Gmail'}
        </button>
      </div>

      <select
        className="input-field"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        style={{ fontWeight: 600, backgroundColor: 'white', border: '1px solid #0284C7', color: '#0369A1', fontSize: compact ? '12.5px' : '13.5px' }}
      >
        <optgroup label="✨ VOS ADRESSES GMAIL EN CLAIR (OUVERTURE DIRECTE SUR LE BON COMPTE)">
          {gmailAccounts.map((account) => (
            <option key={account} value={`gmail:${account}`}>
              ✉️ Gmail : {account}
            </option>
          ))}
          <option value="gmail">✉️ Gmail Web (compte Google par défaut)</option>
        </optgroup>
        <optgroup label="🏢 AUTRES MESSAGERIES WEB & POSTE DE TRAVAIL">
          <option value="outlook-pro">🏢 Outlook Office 365 / Pro en ligne (outlook.office.com)</option>
          <option value="outlook-live">☁️ Outlook.com / Hotmail Web (outlook.live.com)</option>
          <option value="yahoo">🟣 Yahoo Mail en ligne (mail.yahoo.com)</option>
          <option value="mailto">💻 Application e-mail par défaut de l'ordinateur (Outlook Bureau / Windows Mail...)</option>
          <option value="copy">📋 Copier l'adresse et le message (pour coller dans l'onglet de votre choix)</option>
        </optgroup>
      </select>

      {/* Mini-gestionnaire d'adresses Gmail */}
      {isManaging && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#E0F2FE', borderRadius: 'var(--radius-sm)', border: '1px dashed #38BDF8' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1', marginBottom: '6px' }}>
            ⚙️ Adresses Gmail mémorisées dans le CRM :
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {gmailAccounts.map((acc) => (
              <span
                key={acc}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: '#FFF', borderRadius: 'var(--radius-full)', border: '1px solid #BAE6FD', fontSize: '11.5px', fontWeight: 600, color: '#0369A1' }}
              >
                <Mail size={12} style={{ color: '#0284C7' }} />
                {acc}
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(acc)}
                  style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                  title="Supprimer cette adresse"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))}
            {gmailAccounts.length === 0 && (
              <span style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>Aucune adresse Gmail enregistrée.</span>
            )}
          </div>
          <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="email"
              placeholder="Ajouter une adresse (ex: contact@...)"
              value={newAccountEmail}
              onChange={(e) => setNewAccountEmail(e.target.value)}
              style={{ flex: 1, padding: '4px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #7DD3FC', outline: 'none' }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <Plus size={14} />
              Ajouter
            </button>
          </form>
        </div>
      )}

      <div style={{ fontSize: '11.5px', color: '#0284C7', marginTop: '6px', lineHeight: '1.4' }}>
        {value.startsWith('gmail:') && (
          <div>
            👉 <strong>Ouverture directe et garantie :</strong> Le CRM demande à Google d'ouvrir l'onglet de rédaction précisément pour <strong>{value.substring(6)}</strong> via son identifiant officiel. Fini les numéros de comptes !
          </div>
        )}
        {value === 'gmail' && "👉 Ouvre directement Gmail Web avec le compte Google actif par défaut."}
        {value === 'outlook-pro' && "👉 Ouvre directement Outlook Office 365 en ligne pour les comptes professionnels."}
        {value === 'outlook-live' && "👉 Ouvre directement Outlook.com / Hotmail en ligne."}
        {value === 'yahoo' && "👉 Ouvre Yahoo Mail en ligne."}
        {value === 'mailto' && "👉 Ouvre l'application ou le compte e-mail associé par défaut à votre session Windows/Mac."}
        {value === 'copy' && "👉 Copie instantanément l'adresse e-mail, l'objet et le texte du message dans votre presse-papiers pour les coller où vous voulez."}
      </div>
    </div>
  );
};
