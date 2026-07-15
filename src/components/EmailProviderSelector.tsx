import React from 'react';
import { storageService } from '../services/storageService';
import { Globe } from 'lucide-react';

interface EmailProviderSelectorProps {
  value: string;
  onChange: (provider: string) => void;
  compact?: boolean;
}

export const EmailProviderSelector: React.FC<EmailProviderSelectorProps> = ({ value, onChange, compact = false }) => {
  const handleChange = (newProvider: string) => {
    storageService.setPreferredEmailProvider(newProvider);
    onChange(newProvider);
  };

  return (
    <div style={{ padding: compact ? '10px 12px' : '14px', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0369A1', marginBottom: '8px' }}>
        <Globe size={16} style={{ color: '#0284C7' }} />
        Boîte e-mail à utiliser pour l'envoi :
      </label>
      <select
        className="input-field"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        style={{ fontWeight: 600, backgroundColor: 'white', border: '1px solid #0284C7', color: '#0369A1', fontSize: compact ? '12.5px' : '13.5px' }}
      >
        <option value="gmail-0">✉️ Gmail Web - Compte 1 par défaut (u/0 - 1er onglet Gmail)</option>
        <option value="gmail-1">✉️ Gmail Web - Compte 2 (u/1 - ex: 2ème onglet Gmail ouvert)</option>
        <option value="gmail-2">✉️ Gmail Web - Compte 3 (u/2 - ex: 3ème onglet Gmail ouvert)</option>
        <option value="gmail-3">✉️ Gmail Web - Compte 4 (u/3 - ex: 4ème onglet Gmail ouvert)</option>
        <option value="outlook-pro">🏢 Outlook Office 365 / Pro en ligne (outlook.office.com)</option>
        <option value="outlook-live">☁️ Outlook.com / Hotmail Web (outlook.live.com)</option>
        <option value="yahoo">🟣 Yahoo Mail en ligne (mail.yahoo.com)</option>
        <option value="mailto">💻 Application e-mail par défaut de la session ordi (Outlook Bureau / Mail Windows...)</option>
        <option value="copy">📋 Copier l'adresse et le message (pour coller manuellement dans le compte de votre choix)</option>
      </select>
      <div style={{ fontSize: '11.5px', color: '#0284C7', marginTop: '6px', lineHeight: '1.4' }}>
        {value.startsWith('gmail') && (
          <div>
            👉 <strong>Multi-comptes Gmail :</strong> Regardez vos onglets Gmail ouverts en haut de votre navigateur. Votre 1er compte est <strong>Compte 1 (u/0)</strong>, votre 2ème (ex: laureline@...) est <strong>Compte 2 (u/1)</strong>, votre 3ème (ex: share&fun@...) est <strong>Compte 3 (u/2)</strong>. Choisissez le numéro correspondant ci-dessus pour ouvrir le message directement avec la bonne boîte !
          </div>
        )}
        {value === 'outlook-pro' && "👉 Ouvre directement Outlook Office 365 en ligne pour les comptes professionnels."}
        {value === 'outlook-live' && "👉 Ouvre directement Outlook.com / Hotmail en ligne."}
        {value === 'yahoo' && "👉 Ouvre directement Yahoo Mail en ligne."}
        {value === 'mailto' && "👉 Ouvre l'application ou le compte e-mail associé par défaut à votre session Windows/Mac."}
        {value === 'copy' && "👉 Copie instantanément l'adresse e-mail, l'objet et le texte du message dans votre presse-papiers pour les coller où vous voulez."}
      </div>
    </div>
  );
};
