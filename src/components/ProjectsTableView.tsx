import React, { useState, useRef, useEffect } from 'react';
import type { Contact, Establishment } from '../types/crm';
import { ExternalLink } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ProjectsTableViewProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onRefresh: () => void;
}

const AutoResizingTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, placeholder, style }) => {
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const calculateHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      if (scrollHeight > 50) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
      
      if (expanded || scrollHeight <= 50) {
        textareaRef.current.style.height = scrollHeight + 'px';
      } else {
        textareaRef.current.style.height = '50px';
      }
    }
  };

  useEffect(() => {
    calculateHeight();
  }, [value, expanded]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <textarea
        ref={textareaRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        rows={1}
        style={{
          ...style,
          resize: 'none',
          overflow: expanded ? 'auto' : 'hidden',
          minHeight: '26px',
          lineHeight: '1.2',
          transition: 'height 0.2s ease'
        }}
        onFocus={e => { e.target.style.border='1px solid var(--border)'; }} 
        onBlur={e => { e.target.style.border='1px solid transparent'; }}
      />
      {isOverflowing && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '10px',
            cursor: 'pointer',
            padding: '2px 0',
            marginTop: '2px',
            textAlign: 'right',
            fontWeight: 600,
            textDecoration: 'underline'
          }}
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
        </button>
      )}
    </div>
  );
};

const parseDateString = (dateStr: string) => {
  const matchFR = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchFR) {
    return `${matchFR[3]}-${matchFR[2]}-${matchFR[1]}`;
  }
  return dateStr;
};

export const ProjectsTableView: React.FC<ProjectsTableViewProps> = ({ contacts, onContactClick, onRefresh }) => {
  const [filterEst, setFilterEst] = useState<'all' | Establishment | 'a_determiner'>('all');

  const filtered = contacts.filter(c => {
    if (filterEst === 'all') return true;
    const evEst = c.eventDetails?.establishment || 'a_determiner';
    return evEst === filterEst;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const aType = a.eventDetails?.dateType || 'tbd';
    const bType = b.eventDetails?.dateType || 'tbd';
    const aDate = parseDateString(a.eventDetails?.dateValue || '');
    const bDate = parseDateString(b.eventDetails?.dateValue || '');

    // "TBD" at the top
    if (aType === 'tbd' && bType !== 'tbd') return -1;
    if (bType === 'tbd' && aType !== 'tbd') return 1;
    if (aType === 'tbd' && bType === 'tbd') return 0;
    
    // Compare dates chronologically (YYYY-MM-DD or YYYY-MM)
    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;
    return 0;
  });

  const handleInlineChange = (contactId: string, field: keyof NonNullable<Contact['eventDetails']>, value: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    let newEventDetails: any = {
      ...(contact.eventDetails || {}),
      [field]: value
    };

    if (field === 'dateValue') {
      if (value.trim() === '') {
        newEventDetails.dateType = 'tbd';
      } else if (!newEventDetails.dateType || newEventDetails.dateType === 'tbd') {
        newEventDetails.dateType = 'exact';
      }
    }

    const updated = {
      ...contact,
      eventDetails: newEventDetails
    };
    storageService.saveContact(updated);
    onRefresh(); // Trigger a re-render from App.tsx
  };

  const handleRootChange = (contactId: string, field: keyof Contact, value: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const updated = { ...contact, [field]: value };
    storageService.saveContact(updated);
    onRefresh();
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
              <th style={{ padding: '10px 6px', minWidth: '140px' }}>Relance</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows: React.ReactNode[] = [];
              let currentMonth = '';

              sortedFiltered.forEach(contact => {
                const ev = contact.eventDetails || {};
                let month = 'À déterminer';
                
                const parsedDate = parseDateString(ev.dateValue || '');
                if (ev.dateType !== 'tbd' && parsedDate) {
                  const match = parsedDate.match(/^(\d{4})-(\d{2})/);
                  if (match) {
                    const year = match[1];
                    const monthNum = match[2];
                    const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                    const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    month = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                  }
                }

                if (month !== currentMonth) {
                  rows.push(
                    <tr key={`month-${month}`} style={{ backgroundColor: '#E2E8F0', borderBottom: '2px solid #CBD5E1' }}>
                      <td colSpan={14} style={{ padding: '8px 12px', fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>
                        {month}
                      </td>
                    </tr>
                  );
                  currentMonth = month;
                }

                let isDeadlineUrgent = false;
                if (contact.deadline) {
                  const deadlineDate = new Date(contact.deadline);
                  deadlineDate.setHours(0, 0, 0, 0);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffDays = (deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
                  if (diffDays <= 3) {
                    isDeadlineUrgent = true;
                  }
                }

                rows.push(
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
                    <AutoResizingTextarea value={ev.activities || ''} onChange={val => handleInlineChange(contact.id, 'activities', val)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <AutoResizingTextarea value={ev.catering || ''} onChange={val => handleInlineChange(contact.id, 'catering', val)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <AutoResizingTextarea value={ev.drinks || ''} onChange={val => handleInlineChange(contact.id, 'drinks', val)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <AutoResizingTextarea value={ev.equipment || ''} onChange={val => handleInlineChange(contact.id, 'equipment', val)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <AutoResizingTextarea value={ev.paymentStatus || ''} onChange={val => handleInlineChange(contact.id, 'paymentStatus', val)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={ev.quoteAmount || ''} onChange={e => handleInlineChange(contact.id, 'quoteAmount', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', textAlign: 'right', fontWeight: 600 }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input type="date" value={contact.deadline || ''} onChange={e => handleRootChange(contact.id, 'deadline', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: isDeadlineUrgent ? '#FEE2E2' : 'transparent', color: isDeadlineUrgent ? '#DC2626' : 'var(--text-main)', fontWeight: isDeadlineUrgent ? 'bold' : 'normal' }} onFocus={e => e.target.style.border='1px solid var(--border)'} onBlur={e => e.target.style.border='1px solid transparent'} />
                      <AutoResizingTextarea value={ev.followUpComment || ''} onChange={val => handleInlineChange(contact.id, 'followUpComment', val)} placeholder="Commentaire..." style={{ width: '100%', padding: '4px', border: '1px solid transparent', borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent' }} />
                    </div>
                  </td>
                </tr>
                );
              });
              
              if (sortedFiltered.length === 0) {
                rows.push(
                  <tr key="empty">
                    <td colSpan={14} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Aucun projet correspondant trouvé.
                    </td>
                  </tr>
                );
              }
              
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};
