import React, { useState } from 'react';
import type { Contact, ContactStatus } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Building2, ChevronRight, AlertTriangle, Clock, Rocket, Dices, Sparkles, LayoutGrid, List } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onRefresh: () => void;
  onQuickCall: (contact: Contact, e: React.MouseEvent) => void;
  onQuickMail: (contact: Contact, e: React.MouseEvent) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onSelectContact,
  onRefresh,
  onQuickCall,
  onQuickMail
}) => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const statuses: ContactStatus[] = [
    'Nouveau : à contacter',
    'À relancer',
    'Rendez-vous fixé',
    'Devis envoyé',
    'Client converti',
    'Pas intéressé'
  ];

  const handleQuickStatusChange = (contact: Contact, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    storageService.addActivityLog(contact.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `Modification manuelle rapide du statut : ${newStatus}`,
      newStatus
    });
    onRefresh();
  };

  const handleQuickDeadlineChange = (contact: Contact, newDeadline: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    storageService.addActivityLog(contact.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `Mise à jour manuelle de la dead line : ${newDeadline || 'Aucune'}`,
      deadline: newDeadline || undefined
    });
    onRefresh();
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Nouveau : à contacter':
        return { backgroundColor: 'var(--status-new-bg)', color: 'var(--status-new-text)' };
      case 'À relancer':
        return { backgroundColor: 'var(--status-relance-bg)', color: 'var(--status-relance-text)' };
      case 'Rendez-vous fixé':
        return { backgroundColor: 'var(--status-rdv-bg)', color: 'var(--status-rdv-text)' };
      case 'Client converti':
        return { backgroundColor: 'var(--status-converti-bg)', color: 'var(--status-converti-text)' };
      case 'Devis envoyé':
        return { backgroundColor: 'var(--status-devis-bg)', color: 'var(--status-devis-text)' };
      case 'Pas intéressé':
        return { backgroundColor: 'var(--status-non-bg)', color: 'var(--status-non-text)' };
      default:
        return { backgroundColor: '#F0ECE4', color: 'var(--text-main)' };
    }
  };

  const getUrgencyBadge = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date().toISOString().split('T')[0];
    if (deadline < today) {
      return (
        <span className="badge" style={{ backgroundColor: '#FDE8E8', color: '#C81E1E', fontSize: '11px' }} title="Dead line dépassée !">
          <AlertTriangle size={12} />
          En retard ({deadline.split('-').reverse().join('/')})
        </span>
      );
    } else if (deadline === today) {
      return (
        <span className="badge" style={{ backgroundColor: '#FEF08A', color: '#854D0E', fontSize: '11px' }} title="Dead line pour aujourd'hui">
          🔥 Aujourd'hui
        </span>
      );
    } else {
      return (
        <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#475569', fontSize: '11px' }}>
          <Clock size={12} />
          {deadline.split('-').reverse().join('/')}
        </span>
      );
    }
  };

  const getEstablishmentBadge = (est: Contact['establishment']) => {
    if (est === 'space_fun_games') {
      return (
        <span className="badge badge-establishment-space">
          <Rocket size={12} /> Space Fun Games
        </span>
      );
    } else if (est === 'share_and_fun') {
      return (
        <span className="badge badge-establishment-share">
          <Dices size={12} /> Share & Fun
        </span>
      );
    } else {
      return (
        <span className="badge badge-establishment-both">
          <Sparkles size={12} /> Les deux
        </span>
      );
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
          Aucun contact ne correspond à vos filtres actuels.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Essayez de réinitialiser vos filtres de recherche ou d'importer une nouvelle liste Excel / CSV.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'table' ? 'var(--surface)' : 'transparent',
              color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'table' ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
            }}
            title="Vue Tableau (optimal sur PC)"
          >
            <List size={15} />
            Tableau rapide
          </button>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'cards' ? 'var(--surface)' : 'transparent',
              color: viewMode === 'cards' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'cards' ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: viewMode === 'cards' ? 'var(--shadow-sm)' : 'none'
            }}
            title="Vue Cartes (tactile et smartphone)"
          >
            <LayoutGrid size={15} />
            Cartes tactiles
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Vue Tableau PC / Tablette (Responsive avec défilement si écran petit) */
        <div className="card responsive-table-container">
          <table>
            <thead>
              <tr>
                <th>Contact & Société</th>
                <th>Établissement & Type</th>
                <th>Coordonnées (Appel & Mail rapides)</th>
                <th>Statut actuel (Modifiable en 1 clic)</th>
                <th>Dead line d'action</th>
                <th>Dernière activité</th>
                <th style={{ width: '40px' }}>Ouvrir</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectContact(c)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                >
                  {/* Nom + Société */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '15px' }}>
                      {c.lastName} {c.firstName}
                    </div>
                    {c.company && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Building2 size={13} />
                        {c.company}
                      </div>
                    )}
                  </td>

                  {/* Établissement & Type */}
                  <td>
                    <div style={{ marginBottom: '6px' }}>
                      {getEstablishmentBadge(c.establishment)}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', backgroundColor: '#F3ECE4', padding: '3px 8px', borderRadius: '4px' }}>
                      {c.type}
                    </span>
                  </td>

                  {/* Coordonnées + boutons action rapide */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={(e) => onQuickCall(c, e)}
                            className="btn btn-sm"
                            style={{ padding: '3px 8px', fontSize: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}
                            title="Appeler sur téléphone ou mobile"
                          >
                            <Phone size={13} />
                            {c.phone}
                          </button>
                        </div>
                      )}
                      {c.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={(e) => onQuickMail(c, e)}
                            className="btn btn-sm"
                            style={{ padding: '3px 8px', fontSize: '12px', backgroundColor: '#EDE8F5', color: '#4A306D', border: 'none' }}
                            title="Envoyer un mail (avec templates)"
                          >
                            <Mail size={13} />
                            {c.email}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Statut modifiable manuellement en 1 clic */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={c.status}
                      onChange={(e) => handleQuickStatusChange(c, e.target.value, e)}
                      className="input-field"
                      style={{
                        padding: '6px 10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        width: 'auto',
                        minWidth: '170px',
                        ...getStatusBadgeStyle(c.status)
                      }}
                    >
                      {statuses.map(s => <option key={s} value={s} style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>{s}</option>)}
                    </select>
                  </td>

                  {/* Dead line d'action */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getUrgencyBadge(c.deadline)}
                      <input
                        type="date"
                        className="input-field"
                        value={c.deadline || ''}
                        onChange={(e) => handleQuickDeadlineChange(c, e.target.value, e)}
                        style={{ padding: '4px 8px', fontSize: '12px', width: '130px' }}
                      />
                    </div>
                  </td>

                  {/* Dernière activité */}
                  <td>
                    {c.logs && c.logs.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong>{c.logs[0].employeeName}</strong> : {c.logs[0].summary}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                          {new Date(c.logs[0].timestamp).toLocaleDateString('fr-FR')} {new Date(c.logs[0].timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Aucune action</span>
                    )}
                  </td>

                  {/* Bouton flèche */}
                  <td>
                    <button className="btn btn-secondary btn-icon" style={{ padding: '6px', border: 'none' }}>
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vue Cartes Tactiles pour Smartphone & Mobile */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectContact(c)}
              className="card card-hover"
              style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}
            >
              {/* Top Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {c.lastName} {c.firstName}
                  </h4>
                  {c.company && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Building2 size={13} />
                      {c.company}
                    </div>
                  )}
                </div>
                <ChevronRight size={20} style={{ color: 'var(--text-light)' }} />
              </div>

              {/* Établissement & Type */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {getEstablishmentBadge(c.establishment)}
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', backgroundColor: '#F3ECE4', padding: '3px 8px', borderRadius: '4px' }}>
                  {c.type}
                </span>
              </div>

              {/* Statut & Deadline (Selects en 1 clic) */}
              <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--surface-warm)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Statut :</span>
                  <select
                    value={c.status}
                    onChange={(e) => handleQuickStatusChange(c, e.target.value, e)}
                    className="input-field"
                    style={{
                      padding: '5px 8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      width: 'auto',
                      flex: 1,
                      ...getStatusBadgeStyle(c.status)
                    }}
                  >
                    {statuses.map(s => <option key={s} value={s} style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>{s}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Dead line :</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    {getUrgencyBadge(c.deadline)}
                    <input
                      type="date"
                      className="input-field"
                      value={c.deadline || ''}
                      onChange={(e) => handleQuickDeadlineChange(c, e.target.value, e)}
                      style={{ padding: '3px 6px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Appeler & Envoyer Mail) */}
              <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                {c.phone ? (
                  <button
                    onClick={(e) => onQuickCall(c, e)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Phone size={14} />
                    Appeler
                  </button>
                ) : (
                  <button disabled className="btn btn-secondary btn-sm" style={{ flex: 1, opacity: 0.5 }}>
                    Sans n° tel
                  </button>
                )}

                {c.email ? (
                  <button
                    onClick={(e) => onQuickMail(c, e)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#EDE8F5', color: '#4A306D', border: 'none' }}
                  >
                    <Mail size={14} />
                    E-mail
                  </button>
                ) : (
                  <button disabled className="btn btn-secondary btn-sm" style={{ flex: 1, opacity: 0.5 }}>
                    Sans mail
                  </button>
                )}
              </div>

              {/* Log preview */}
              {c.logs && c.logs.length > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid #F0ECE4', paddingTop: '8px' }}>
                  <strong>{c.logs[0].employeeName}</strong> : {c.logs[0].summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
