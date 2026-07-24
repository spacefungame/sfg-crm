import React, { useState, useEffect } from 'react';
import type { Contact } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, CheckCircle, X, Sparkles } from 'lucide-react';

interface ReturnPromptModalProps {
  onUpdate: () => void;
}

export const ReturnPromptModal: React.FC<ReturnPromptModalProps> = ({ onUpdate }) => {
  const { currentUser } = useAuth();
  const [pending, setPending] = useState<{ contactId: string; type: 'call' | 'mail'; templateTitle?: string; timestamp: number } | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  
  const [selectedStatus, setSelectedStatus] = useState<string>('À relancer');
  const [deadlinePreset, setDeadlinePreset] = useState<'3days' | '1week' | 'custom' | 'none'>('3days');
  const [customDeadline, setCustomDeadline] = useState<string>('');
  const [summaryInput, setSummaryInput] = useState<string>('');

  const statuses = storageService.getStatuses();

  useEffect(() => {
    const checkPending = () => {
      // Check if there is a pending communication when the window regains focus
      const found = storageService.getAndClearPendingCommunication();
      if (found) {
        const c = storageService.getContactById(found.contactId);
        if (c) {
          setPending(found);
          setContact(c);
          setSelectedStatus(c.status === 'Nouveau : à contacter' ? 'À relancer' : c.status);
          
          // Default summary prefilled based on action
          if (found.type === 'call') {
            setSummaryInput('Appel téléphonique passé au client.');
          } else {
            setSummaryInput(`Courriel envoyé ${found.templateTitle ? `(Template : ${found.templateTitle})` : ''}.`);
          }

          // Compute 3 days from now default
          const d3 = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
          setCustomDeadline(d3);
          setDeadlinePreset('3days');
        }
      }
    };

    // Listeners for returning to tab/window
    const handleFocus = () => {
      // Small timeout to allow mail/tel apps to finish launching
      setTimeout(checkPending, 800);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(checkPending, 800);
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (!pending || !contact) return null;

  const computeFinalDeadline = (): string | undefined => {
    if (deadlinePreset === 'none') return undefined;
    if (deadlinePreset === '3days') {
      return new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    }
    if (deadlinePreset === '1week') {
      return new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
    }
    return customDeadline || undefined;
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDeadline = computeFinalDeadline();

    storageService.addActivityLog(contact.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: pending.type,
      summary: summaryInput.trim() || (pending.type === 'call' ? 'Appel téléphonique.' : 'Courriel envoyé.'),
      newStatus: selectedStatus,
      deadline: finalDeadline
    });

    setPending(null);
    setContact(null);
    onUpdate();
  };

  const handleDismiss = () => {
    setPending(null);
    setContact(null);
  };

  return (
    <div className="overlay-backdrop animate-fade-in" style={{ zIndex: 200 }}>
      <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '540px', padding: '26px', border: '2px solid var(--primary)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: 'var(--radius-full)', 
              backgroundColor: pending.type === 'call' ? '#E8F8F0' : '#EDE8F5', 
              color: pending.type === 'call' ? '#1C7D4A' : '#4A306D',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {pending.type === 'call' ? <Phone size={24} /> : <Mail size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚡ Suivi automatique d'échange
                </span>
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                Retour d'échange avec {contact.firstName} {contact.lastName}
              </h3>
            </div>
          </div>
          <button onClick={handleDismiss} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', backgroundColor: 'var(--surface-warm)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          Vous venez {pending.type === 'call' ? 'de lancer un appel vers' : 'd\'envoyer un e-mail à'}{' '}
          <strong>{contact.firstName} {contact.lastName}</strong> ({contact.company || contact.type}).<br />
          Mettez à jour le statut et la prochaine dead line en 5 secondes :
        </p>

        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Statut post-échange */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              1. Quel est le résultat / statut du client après cet échange ?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {statuses.map((st) => {
                const active = selectedStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: active ? 600 : 500,
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{st}</span>
                    {active && <CheckCircle size={16} style={{ color: 'var(--primary)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dead line */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              2. Prochaine étape (Dead line de relance)
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setDeadlinePreset('3days')}
                className={`btn btn-sm ${deadlinePreset === '3days' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Dans 3 jours
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset('1week')}
                className={`btn btn-sm ${deadlinePreset === '1week' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Dans 1 semaine
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset('custom')}
                className={`btn btn-sm ${deadlinePreset === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Date précise...
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset('none')}
                className={`btn btn-sm ${deadlinePreset === 'none' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Aucune / Fini
              </button>
            </div>

            {deadlinePreset === 'custom' && (
              <input
                type="date"
                className="input-field"
                value={customDeadline}
                onChange={(e) => setCustomDeadline(e.target.value)}
              />
            )}
          </div>

          {/* Note / Résumé */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              3. Note ou compte-rendu (enregistré dans l'historique)
            </label>
            <textarea
              rows={2}
              className="input-field"
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Ex: Ne pas rappeler avant lundi, souhaite un devis laser game pour 20 personnes..."
            />
          </div>

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleDismiss}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Ignorer
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Sparkles size={16} />
              Enregistrer l'historique & Statut
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
