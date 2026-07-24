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
  const allTags = storageService.getTags();

  const getTagBadge = (tagName: string) => {
    const found = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    const bg = found?.color || '#8B5A2B';
    return (
      <span key={tagName} style={{ backgroundColor: bg, color: '#FFF', fontSize: '10px', fontWeight: 600, padding: '1px 5px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
        🏷️ {tagName}
      </span>
    );
  };

  const statuses = storageService.getStatuses();

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
        <span className="badge" style={{ backgroundColor: '#FDE8E8', color: '#C81E1E', fontSize: '10px', padding: '1px 5px' }} title="Dead line dépassée !">
          <AlertTriangle size={11} />
          En retard ({deadline.split('-').reverse().join('/')})
        </span>
      );
    } else if (deadline === today) {
      return (
        <span className="badge" style={{ backgroundColor: '#FEF08A', color: '#854D0E', fontSize: '10px', padding: '1px 5px' }} title="Dead line pour aujourd'hui">
          🔥 Aujourd'hui
        </span>
      );
    } else {
      return (
        <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#475569', fontSize: '10px', padding: '1px 5px' }}>
          <Clock size={11} />
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--surface-warm)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'table' ? 'var(--surface)' : 'transparent',
              color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'table' ? 600 : 500,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
            }}
            title="Vue Tableau (optimal sur PC)"
          >
            <List size={13} />
            Tableau rapide
          </button>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'cards' ? 'var(--surface)' : 'transparent',
              color: viewMode === 'cards' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'cards' ? 600 : 500,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: viewMode === 'cards' ? 'var(--shadow-sm)' : 'none'
            }}
            title="Vue Cartes (tactile et smartphone)"
          >
            <LayoutGrid size={13} />
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
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '12.5px' }}>
                      {c.lastName} {c.firstName}
                    </div>
                    {c.company && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                        <Building2 size={11} />
                        {c.company}
                      </div>
                    )}
                  </td>

                  {/* Établissement & Type + Tags */}
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ marginBottom: '4px' }}>
                      {getEstablishmentBadge(c.establishment)}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center' }}>
                      {(c.type || '').split(',').map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted)', backgroundColor: '#F3ECE4', padding: '1px 5px', borderRadius: '3px', display: 'inline-block' }}>
                          📇 {t}
                        </span>
                      ))}
                      {c.tags && c.tags.map(t => getTagBadge(t))}
                    </div>
                  </td>

                  {/* Coordonnées + boutons action rapide */}
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onQuickCall(c, e); }}
                            className="btn btn-sm"
                            style={{ padding: '2px 5px', fontSize: '11px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}
                            title="Appeler sur téléphone ou mobile"
                          >
                            <Phone size={11} />
                            {c.phone}
                          </button>
                        </div>
                      )}
                      {c.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onQuickMail(c, e); }}
                            className="btn btn-sm"
                            style={{ padding: '2px 5px', fontSize: '11px', backgroundColor: '#EDE8F5', color: '#4A306D', border: 'none' }}
                            title="Envoyer un mail (avec templates)"
                          >
                            <Mail size={11} />
                            {c.email}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Statut modifiable manuellement en 1 clic */}
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    <select
                      value={c.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleQuickStatusChange(c, e.target.value, e)}
                      className="input-field"
                      style={{
                        padding: '2px 5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        width: 'auto',
                        minWidth: '135px',
                        ...getStatusBadgeStyle(c.status)
                      }}
                    >
                      {statuses.map(s => <option key={s} value={s} style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>{s}</option>)}
                    </select>
                  </td>

                  {/* Dead line d'action */}
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {getUrgencyBadge(c.deadline)}
                      <input
                        type="date"
                        className="input-field"
                        onClick={(e) => e.stopPropagation()}
                        value={c.deadline || ''}
                        onChange={(e) => handleQuickDeadlineChange(c, e.target.value, e)}
                        style={{ padding: '2px 4px', fontSize: '11px', width: '110px' }}
                      />
                    </div>
                  </td>

                  {/* Dernière activité */}
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    {c.logs && c.logs.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-main)', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong>{c.logs[0].employeeName}</strong> : {c.logs[0].summary}
                        </div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-light)' }}>
                          {new Date(c.logs[0].timestamp).toLocaleDateString('fr-FR')} {new Date(c.logs[0].timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Aucune action</span>
                    )}
                  </td>

                  {/* Bouton flèche */}
                  <td onClick={() => onSelectContact(c)} style={{ cursor: 'pointer' }}>
                    <button type="button" onClick={() => onSelectContact(c)} className="btn btn-secondary btn-icon" style={{ padding: '3px', border: 'none' }}>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vue Cartes Tactiles pour Smartphone & Mobile */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectContact(c)}
              className="card card-hover"
              style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer' }}
            >
              {/* Top Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {c.lastName} {c.firstName}
                  </h4>
                  {c.company && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                      <Building2 size={11} />
                      {c.company}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
              </div>

              {/* Établissement & Type + Tags */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                {getEstablishmentBadge(c.establishment)}
                {(c.type || '').split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted)', backgroundColor: '#F3ECE4', padding: '1px 5px', borderRadius: '3px', display: 'inline-block' }}>
                    📇 {t}
                  </span>
                ))}
                {c.tags && c.tags.map(t => getTagBadge(t))}
              </div>

              {/* Statut & Deadline (Selects en 1 clic) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Statut :</span>
                  <select
                    value={c.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleQuickStatusChange(c, e.target.value, e)}
                    className="input-field"
                    style={{
                      padding: '2px 5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      width: 'auto',
                      flex: 1,
                      ...getStatusBadgeStyle(c.status)
                    }}
                  >
                    {statuses.map(s => <option key={s} value={s} style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>{s}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Dead line :</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    {getUrgencyBadge(c.deadline)}
                    <input
                      type="date"
                      className="input-field"
                      onClick={(e) => e.stopPropagation()}
                      value={c.deadline || ''}
                      onChange={(e) => handleQuickDeadlineChange(c, e.target.value, e)}
                      style={{ padding: '2px 4px', fontSize: '11px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Appeler & Envoyer Mail) */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                {c.phone ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onQuickCall(c, e); }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '3px 6px', fontSize: '11px' }}
                  >
                    <Phone size={12} />
                    Appeler
                  </button>
                ) : (
                  <button disabled className="btn btn-secondary btn-sm" style={{ flex: 1, opacity: 0.5, padding: '3px 6px', fontSize: '11px' }}>
                    Sans n° tel
                  </button>
                )}

                {c.email ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onQuickMail(c, e); }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: '#EDE8F5', color: '#4A306D', border: 'none', padding: '3px 6px', fontSize: '11px' }}
                  >
                    <Mail size={12} />
                    E-mail
                  </button>
                ) : (
                  <button disabled className="btn btn-secondary btn-sm" style={{ flex: 1, opacity: 0.5, padding: '3px 6px', fontSize: '11px' }}>
                    Sans mail
                  </button>
                )}
              </div>

              {/* Log preview */}
              {c.logs && c.logs.length > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid #F0ECE4', paddingTop: '4px' }}>
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
