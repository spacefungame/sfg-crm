import React, { useState } from 'react';
import type { Contact, Establishment } from '../types/crm';
import { ExternalLink } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ProjectsTableViewProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onRefresh: () => void;
}

export const ProjectsTableView: React.FC<ProjectsTableViewProps> = ({ contacts, onContactClick, onRefresh }) => {
  const [filterEst, setFilterEst] = useState<'all' | Establishment | 'a_determiner'>('all');

  const filtered = contacts.filter(c => {
    if (filterEst === 'all') return true;
    const evEst = c.eventDetails?.establishment || 'a_determiner';
    return evEst === filterEst;
  });

  const handleInlineChange = (contactId: string, field: keyof NonNullable<Contact['eventDetails']>, value: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    const updated = {
      ...contact,
      eventDetails: {
        ...(contact.eventDetails || {}),
        [field]: value
      }
    };
    storageService.saveContact(updated);
    onRefresh(); // Trigger a re-render from App.tsx
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#FFF', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '13px' }}>Filtre Établissement :</span>
        <select className="input-field" style={{ width: '200px', padding: '6px' }} value={filterEst} onChange={(e) => setFilterEst(e.target.value as any)}>
          <option value="all">Tous</option>
          <option value="space_fun_games">Space Fun Games</option>
          <option value="share_and_fun">Share & Fun</option>
          <option value="les_deux">Les deux</option>
          <option value="a_determiner">À déterminer</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F0F4F8', borderBottom: '2px solid #D0DCE5', textAlign: 'left' }}>
              <th style={{ padding: '10px 6px', width: '70px', textAlign: 'center' }}>Action</th>
              <th style={{ padding: '10px 6px', minWidth: '140px' }}>Client / Société</th>
              <th style={{ padding: '10px 6px', width: '110px' }}>Établissement</th>
              <th style={{ padding: '10px 6px', width: '100px' }}>Date</th>
              <th style={{ padding: '10px 6px', width: '70px' }}>Personnes</th>
              <th style={{ padding: '10px 6px', width: '70px' }}>Arrivée</th>
              <th style={{ padding: '10px 6px', width: '70px' }}>Départ</th>
              <th style={{ padding: '10px 6px', minWidth: '140px' }}>Activités</th>
              <th style={{ padding: '10px 6px', minWidth: '120px' }}>Catering</th>
              <th style={{ padding: '10px 6px', minWidth: '120px' }}>Boissons</th>
              <th style={{ padding: '10px 6px', minWidth: '120px' }}>Matériel</th>
              <th style={{ padding: '10px 6px', width: '100px' }}>Paiement</th>
              <th style={{ padding: '10px 6px', width: '80px' }}>Devis (€)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => {
              const ev = contact.eventDetails || {};
              return (
                <tr key={contact.id} style={{ borderBottom: '1px solid #ECE7DE' }}>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <button onClick={() => onContactClick(contact)} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={12} /> Fiche
                    </button>
                  </td>
                  <td style={{ padding: '6px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {contact.firstName} {contact.lastName}<br/>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 400 }}>{contact.company}</span>
                  </td>
                  <td style={{ padding: '6px' }}>
                    <select value={ev.establishment || 'a_determiner'} onChange={e => handleInlineChange(contact.id, 'establishment', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }}>
                      <option value="a_determiner">À déterminer</option>
                      <option value="space_fun_games">SFG</option>
                      <option value="share_and_fun">S&F</option>
                      <option value="les_deux">Les 2</option>
                    </select>
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.dateValue || ''} placeholder={ev.dateType === 'tbd' ? 'TBD' : 'Date'} onChange={e => handleInlineChange(contact.id, 'dateValue', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.guestCount || ''} onChange={e => handleInlineChange(contact.id, 'guestCount', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', textAlign: 'center' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.arrivalTime || ''} onChange={e => handleInlineChange(contact.id, 'arrivalTime', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', textAlign: 'center' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.departureTime || ''} onChange={e => handleInlineChange(contact.id, 'departureTime', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', textAlign: 'center' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.activities || ''} onChange={e => handleInlineChange(contact.id, 'activities', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.catering || ''} onChange={e => handleInlineChange(contact.id, 'catering', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.drinks || ''} onChange={e => handleInlineChange(contact.id, 'drinks', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.equipment || ''} onChange={e => handleInlineChange(contact.id, 'equipment', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.paymentStatus || ''} onChange={e => handleInlineChange(contact.id, 'paymentStatus', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.quoteAmount || ''} onChange={e => handleInlineChange(contact.id, 'quoteAmount', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', textAlign: 'right', fontWeight: 600 }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Aucun projet correspondant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
