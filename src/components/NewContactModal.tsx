import React, { useState } from 'react';
import type { Contact, Establishment } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { UserPlus, X, Save } from 'lucide-react';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newContact: Contact) => void;
}

export const NewContactModal: React.FC<NewContactModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { currentUser } = useAuth();
  const contactTypes = storageService.getContactTypes();
  const allTags = storageService.getTags();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState(contactTypes[0] || 'Entreprise');
  const [establishment, setEstablishment] = useState<Establishment>('space_fun_games');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) return;

    const newContact: Contact = {
      id: 'contact-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim() || undefined,
      type: type,
      establishment: establishment,
      status: 'Nouveau : à contacter', // All new prospects automatically start as "Nouveau : à contacter" according to user requirement
      tags: [...selectedTags],
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: []
    };

    const createdId = newContact.id;
    newContact.logs = [
      {
        id: 'log-' + Date.now(),
        contactId: createdId,
        timestamp: new Date().toISOString(),
        employeeName: currentUser ? currentUser.username : 'Collaborateur',
        actionType: 'note',
        summary: `Création manuelle du prospect dans le CRM.${selectedTags.length > 0 ? ` Tags : ${selectedTags.join(', ')}` : ''}`
      }
    ];

    storageService.saveContact(newContact);
    onCreated(newContact);
    onClose();

    // Reset form
    setLastName('');
    setFirstName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setNotes('');
    setSelectedTags([]);
  };

  return (
    <div className="overlay-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '580px', padding: '28px', backgroundColor: 'var(--surface)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                Ajouter un nouveau prospect / client
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sera enregistré en statut "Nouveau : à contacter" automatiquement.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Nom / Patronyme *
              </label>
              <input
                type="text"
                className="input-field"
                required
                placeholder="Ex: Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Prénom
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Thomas"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Téléphone mobile / fixe
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: 06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                E-mail de contact
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="Ex: thomas@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Société / Structure
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Mairie de Toulouse"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Type de contact *
              </label>
              <select
                className="input-field"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {contactTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Établissement concerné *
            </label>
            <select
              className="input-field"
              value={establishment}
              onChange={(e) => setEstablishment(e.target.value as Establishment)}
            >
              <option value="space_fun_games">🚀 Space Fun Games</option>
              <option value="share_and_fun">🎲 Share & Fun</option>
              <option value="les_deux">🌟 Les deux établissements</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              🏷️ Tags initiaux :
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allTags.map(tag => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setSelectedTags(isSelected ? selectedTags.filter(t => t !== tag.name) : [...selectedTags, tag.name]);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '2px solid #2A211D' : '1px dashed var(--border)',
                      backgroundColor: isSelected ? tag.color : 'var(--surface-warm)',
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Note initiale ou projet du prospect
            </label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Ex: Intéressé par une sortie équipe pour 30 personnes en décembre..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Enregistrer le contact
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
