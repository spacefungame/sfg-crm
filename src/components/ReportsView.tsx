import React, { useState } from 'react';
import type { Contact, ActivityLog, Establishment } from '../types/crm';
import { storageService } from '../services/storageService';
import { Printer, Download, Users, Phone, Mail, Award } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
  contacts: Contact[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ contacts }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const users = storageService.getUsers();
  const contactTypes = storageService.getContactTypes();

  // Filter contacts according to report selection
  const filteredContacts = contacts.filter((c) => {
    if (selectedEstablishment !== 'all' && c.establishment !== selectedEstablishment && c.establishment !== 'les_deux') return false;
    if (selectedType !== 'all') {
      const contactTypes = (c.type || '').split(',').map(t => t.trim());
      if (!contactTypes.includes(selectedType) && c.type !== selectedType) return false;
    }
    if (selectedEmployee !== 'all') {
      const hasEmployeeActivity = c.logs?.some(
        (l) => l.employeeName.toLowerCase() === selectedEmployee.toLowerCase()
      );
      if (!hasEmployeeActivity) return false;
    }
    return true;
  });

  // Extract all activity logs from all filtered contacts
  const allLogs: { log: ActivityLog; contact: Contact }[] = [];
  filteredContacts.forEach((c) => {
    c.logs?.forEach((l) => {
      if (selectedEmployee === 'all' || l.employeeName.toLowerCase() === selectedEmployee.toLowerCase()) {
        allLogs.push({ log: l, contact: c });
      }
    });
  });

  // Sort logs by date descending
  allLogs.sort((a, b) => new Date(b.log.timestamp).getTime() - new Date(a.log.timestamp).getTime());

  // Statistics calculations
  const totalCalls = allLogs.filter((item) => item.log.actionType === 'call').length;
  const totalMails = allLogs.filter((item) => item.log.actionType === 'mail').length;
  const totalConversions = filteredContacts.filter((c) => c.status === 'Client converti').length;
  
  // Breakdown by establishment
  const spaceCount = filteredContacts.filter((c) => c.establishment === 'space_fun_games').length;
  const shareCount = filteredContacts.filter((c) => c.establishment === 'share_and_fun').length;
  const bothCount = filteredContacts.filter((c) => c.establishment === 'les_deux').length;

  // Breakdown by employee activity
  const employeeActivityMap: Record<string, { calls: number; mails: number; total: number }> = {};
  allLogs.forEach(({ log }) => {
    const name = log.employeeName || 'Inconnu';
    if (!employeeActivityMap[name]) {
      employeeActivityMap[name] = { calls: 0, mails: 0, total: 0 };
    }
    employeeActivityMap[name].total++;
    if (log.actionType === 'call') employeeActivityMap[name].calls++;
    if (log.actionType === 'mail') employeeActivityMap[name].mails++;
  });

  // Breakdown by contact status
  const statusCounts: Record<string, number> = {};
  filteredContacts.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const exportContactsData = filteredContacts.map((c) => {
      const relevantLog = selectedEmployee !== 'all'
        ? c.logs?.find((l) => l.employeeName.toLowerCase() === selectedEmployee.toLowerCase()) || c.logs?.[0]
        : c.logs?.[0];

      return {
        'Nom': c.lastName,
        'Prénom': c.firstName,
        'Société': c.company || '',
        'Type': c.type,
        'Établissement': c.establishment === 'space_fun_games' ? 'Space Fun Games' : c.establishment === 'share_and_fun' ? 'Share & Fun' : 'Les deux',
        'Téléphone': c.phone,
        'E-mail': c.email,
        'Statut actuel': c.status,
        'Dead line': c.deadline || '',
        'Action (Sélection)': relevantLog?.summary || '',
        'Employé (Sélection)': relevantLog?.employeeName || '',
        'Date action': relevantLog?.timestamp ? new Date(relevantLog.timestamp).toLocaleDateString('fr-FR') : ''
      };
    });

    const exportLogsData = allLogs.map(({ log, contact }) => ({
      'Date & Heure': new Date(log.timestamp).toLocaleDateString('fr-FR') + ' ' + new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      'Collaborateur': log.employeeName,
      'Client / Société': `${contact.lastName} ${contact.firstName}${contact.company ? ' (' + contact.company + ')' : ''}`,
      'Établissement': contact.establishment === 'space_fun_games' ? 'Space Fun Games' : contact.establishment === 'share_and_fun' ? 'Share & Fun' : 'Les deux',
      'Type action': log.actionType === 'call' ? 'Appel' : log.actionType === 'mail' ? 'E-mail' : log.actionType === 'status_change' ? 'Changement de statut' : 'Note',
      'Résumé de l\'échange': log.summary,
      'Statut résultant': log.newStatus || contact.status
    }));

    const workbook = XLSX.utils.book_new();
    const worksheetContacts = XLSX.utils.json_to_sheet(exportContactsData);
    XLSX.utils.book_append_sheet(workbook, worksheetContacts, 'Contacts_Sélectionnés');

    if (exportLogsData.length > 0) {
      const worksheetLogs = XLSX.utils.json_to_sheet(exportLogsData);
      XLSX.utils.book_append_sheet(workbook, worksheetLogs, 'Journal_Activité_Détaillé');
    }

    const cleanEmployeeName = selectedEmployee !== 'all' ? selectedEmployee.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Global';
    XLSX.writeFile(workbook, `Rapport_CRM_${cleanEmployeeName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Top Filter & Export Bar (Hidden on print) */}
      <div className="card no-print" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>👤 Employé :</span>
            <select
              className="input-field"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }}
            >
              <option value="all">Tous les collaborateurs</option>
              {users.map((u) => <option key={u.id} value={u.username}>{u.username}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>🏢 Établissement :</span>
            <select
              className="input-field"
              value={selectedEstablishment}
              onChange={(e) => setSelectedEstablishment(e.target.value as any)}
              style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }}
            >
              <option value="all">Tous</option>
              <option value="space_fun_games">🚀 Space Fun Games</option>
              <option value="share_and_fun">🎲 Share & Fun</option>
              <option value="les_deux">🌟 Les deux</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>🏷️ Type client :</span>
            <select
              className="input-field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }}
            >
              <option value="all">Tous les types</option>
              {contactTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleExportExcel} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }} title="Exporter le rapport en tableau Excel .xlsx">
            <Download size={13} />
            Exporter Excel (.xlsx)
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }} title="Imprimer ou enregistrer en PDF">
            <Printer size={13} />
            Imprimer le rapport
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="card" style={{ padding: '14px' }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              Rapport d'Activité CRM — Space Fun Games & Share & Fun
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Filtres actifs : Employé ({selectedEmployee === 'all' ? 'Tous' : selectedEmployee}) • Établissement ({selectedEstablishment === 'all' ? 'Tous' : selectedEstablishment === 'space_fun_games' ? 'Space Fun Games' : selectedEstablishment === 'share_and_fun' ? 'Share & Fun' : 'Les deux'}) • Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          
          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', backgroundColor: '#EDE8F5', color: '#4A306D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>{filteredContacts.length}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contacts suivis</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', backgroundColor: '#E8F8F0', color: '#1C7D4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1C7D4A' }}>{totalCalls}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Appels effectués</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', backgroundColor: '#E8F4F8', color: '#1E6B82', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E6B82' }}>{totalMails}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>E-mails envoyés</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FFF3E6', color: '#B86200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#B86200' }}>{totalConversions}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Clients convertis</div>
            </div>
          </div>

        </div>

        {/* 2 Grids: Activité par Collaborateur & Répartition par Établissement/Statut */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          
          {/* Tableau Collaborateurs */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
              📈 Bilan d'activité par collaborateur
            </h4>
            
            {Object.keys(employeeActivityMap).length === 0 ? (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aucune activité enregistrée sur cette sélection.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '11.5px' }}>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Appels 📞</th>
                    <th>Mails ✉️</th>
                    <th>Total actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(employeeActivityMap).map(([name, stats]) => (
                    <tr key={name}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{name}</td>
                      <td>{stats.calls}</td>
                      <td>{stats.mails}</td>
                      <td style={{ fontWeight: 700 }}>{stats.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Tableau Répartitions */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
              🏢 Répartition par Établissement & Statuts
            </h4>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, backgroundColor: '#EDE8F5', padding: '6px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#4A306D' }}>{spaceCount}</div>
                <div style={{ fontSize: '10.5px', color: '#4A306D' }}>🚀 Space Fun</div>
              </div>
              <div style={{ flex: 1, backgroundColor: '#FFF2E5', padding: '6px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#9C5414' }}>{shareCount}</div>
                <div style={{ fontSize: '10.5px', color: '#9C5414' }}>🎲 Share & Fun</div>
              </div>
              <div style={{ flex: 1, backgroundColor: '#E8F5E9', padding: '6px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#2E6B34' }}>{bothCount}</div>
                <div style={{ fontSize: '10.5px', color: '#2E6B34' }}>🌟 Les deux</div>
              </div>
            </div>

            <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0ECE4', paddingBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{status}</span>
                  <span style={{ fontWeight: 600 }}>{count} client{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Journal d'activité récent (Tableau détaillé pour impression) */}
        <div>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
            📋 Journal détaillé des communications récentes (Appels, Mails & Notes)
          </h4>

          {allLogs.length === 0 ? (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aucune action récente dans cette sélection.</p>
          ) : (
            <div className="responsive-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date & Heure</th>
                    <th>Collaborateur</th>
                    <th>Client / Société</th>
                    <th>Type d'action</th>
                    <th>Résumé de l'échange & Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {allLogs.slice(0, 40).map(({ log, contact }) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>
                        {new Date(log.timestamp).toLocaleDateString('fr-FR')} {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '11px' }}>
                        {log.employeeName}
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        <strong>{contact.lastName} {contact.firstName}</strong>
                        {contact.company && <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>{contact.company}</span>}
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: log.actionType === 'call' ? '#E8F8F0' : log.actionType === 'mail' ? '#EDE8F5' : '#F0ECE4',
                          color: log.actionType === 'call' ? '#1C7D4A' : log.actionType === 'mail' ? '#4A306D' : 'var(--text-main)',
                          fontSize: '10px'
                        }}>
                          {log.actionType === 'call' ? '📞 Appel' : log.actionType === 'mail' ? '✉️ E-mail' : log.actionType === 'status_change' ? '🔄 Statut' : '📝 Note'}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        <div>{log.summary}</div>
                        {log.newStatus && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            ➔ Statut : <strong>{log.newStatus}</strong>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
