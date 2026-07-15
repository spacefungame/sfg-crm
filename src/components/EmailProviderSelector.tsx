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
        <option value="gmail">✉️ Gmail en ligne (mail.google.com)</option>
        <option value="outlook-pro">🏢 Outlook Office 365 / Pro en ligne (outlook.office.com)</option>
        <option value="outlook-live">☁️ Outlook.com / Hotmail Web (outlook.live.com)</option>
        <option value="yahoo">🟣 Yahoo Mail en ligne (mail.yahoo.com)</option>
        <option value="mailto">💻 Application e-mail par défaut de la session ordi (Outlook Bureau / Mail Windows...)</option>
        <option value="copy">📋 Copier l'adresse et le message (pour coller manuellement dans le compte de votre choix)</option>
      </select>
      <div style={{ fontSize: '11.5px', color: '#0284C7', marginTop: '6px', lineHeight: '1.4' }}>
        {value === 'gmail' && "👉 Ouvre directement Gmail Web. Si vous utilisez plusieurs comptes Google, vous pourrez choisir ou basculer de compte en haut à droite dans Gmail."}
        {value === 'outlook-pro' && "👉 Ouvre directement Outlook Office 365 en ligne pour les comptes professionnels."}
        {value === 'outlook-live' && "👉 Ouvre directement Outlook.com / Hotmail en ligne."}
        {value === 'yahoo' && "👉 Ouvre directement Yahoo Mail en ligne."}
        {value === 'mailto' && "👉 Ouvre l'application ou le compte e-mail associé par défaut à votre session Windows/Mac."}
        {value === 'copy' && "👉 Copie instantanément l'adresse e-mail, l'objet et le texte du message dans votre presse-papiers pour les coller où vous voulez."}
      </div>
    </div>
  );
};
