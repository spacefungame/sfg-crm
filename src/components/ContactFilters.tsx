import React from 'react';
import type { Establishment } from '../types/crm';
import { storageService } from '../services/storageService';
import { Search, Calendar, Building2, Tag as TagIcon, CheckCircle2, RotateCcw, Filter, Bookmark } from 'lucide-react';

export interface FilterState {
  search: string;
  establishment: Establishment | 'all';
  type: string;
  status: string;
  tag: string;
  urgency: 'all' | 'late' | 'today' | 'future' | 'none';
}

interface ContactFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount
}) => {
  const contactTypes = storageService.getContactTypes();
  const statuses = storageService.getStatuses();
  const tags = storageService.getTags();

  const resetFilters = () => {
    onFilterChange({
      search: '',
      establishment: 'all',
      type: 'all',
      status: 'all',
      tag: 'all',
      urgency: 'all'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.establishment !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    (filters.tag && filters.tag !== 'all') ||
    filters.urgency !== 'all';

  return (
    <div className="card" style={{ padding: '6px 10px', marginBottom: '8px' }}>
      
      {/* Top row: Search Bar & Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
          <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Rechercher (nom, tél, mail, société)..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            style={{ paddingLeft: '26px', paddingRight: filters.search ? '50px' : '8px', paddingTop: '4px', paddingBottom: '4px', fontSize: '11.5px' }}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '10.5px', fontWeight: 600 }}
            >
              Effacer
            </button>
          )}
        </div>

        {/* Count & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-warm)', padding: '3px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
            <strong>{filteredCount}</strong> affiché{filteredCount !== 1 ? 's' : ''} / {totalCount}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ color: '#C81E1E', borderColor: '#FBD5D5', backgroundColor: '#FDE8E8', padding: '3px 8px', fontSize: '10.5px' }}
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw size={12} />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Filter dropdowns (Compact line) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', borderTop: '1px solid #F0ECE4', paddingTop: '6px', marginTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '2px' }}>
          <Filter size={12} style={{ color: 'var(--primary)' }} />
          Filtres :
        </div>

        {/* Menu déroulant Établissement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Building2 size={12} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.establishment}
            onChange={(e) => onFilterChange({ ...filters, establishment: e.target.value as any })}
            style={{ width: 'auto', minWidth: '125px', padding: '3px 6px', fontSize: '11px', fontWeight: filters.establishment !== 'all' ? 600 : 400, borderColor: filters.establishment !== 'all' ? 'var(--primary)' : 'var(--border)' }}
          >
            <option value="all">Établissement : Tous</option>
            <option value="space_fun_games">🚀 Space Fun Games</option>
            <option value="share_and_fun">🎲 Share & Fun</option>
            <option value="les_deux">🌟 Les deux</option>
          </select>
        </div>

        {/* Menu déroulant Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <TagIcon size={12} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            style={{ width: 'auto', minWidth: '105px', padding: '3px 6px', fontSize: '11px', fontWeight: filters.type !== 'all' ? 600 : 400, borderColor: filters.type !== 'all' ? 'var(--secondary)' : 'var(--border)' }}
          >
            <option value="all">Type : Tous</option>
            {contactTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Menu déroulant Statut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <CheckCircle2 size={12} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            style={{ width: 'auto', minWidth: '115px', padding: '3px 6px', fontSize: '11px', fontWeight: filters.status !== 'all' ? 600 : 400, borderColor: filters.status !== 'all' ? '#1E6B82' : 'var(--border)' }}
          >
            <option value="all">Statut : Tous</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Menu déroulant Urgence / Relances */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Calendar size={12} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.urgency}
            onChange={(e) => onFilterChange({ ...filters, urgency: e.target.value as any })}
            style={{ width: 'auto', minWidth: '110px', padding: '3px 6px', fontSize: '11px', fontWeight: filters.urgency !== 'all' ? 600 : 400, borderColor: filters.urgency !== 'all' ? '#C81E1E' : 'var(--border)' }}
          >
            <option value="all">Dead line : Toutes</option>
            <option value="late">🚨 En retard (à relancer !)</option>
            <option value="today">🔥 Pour aujourd'hui</option>
            <option value="future">📅 Futures actions</option>
            <option value="none">ℹ️ Sans dead line</option>
          </select>
        </div>

        {/* Menu déroulant Tags (Catégories) */}
        {tags && tags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Bookmark size={12} style={{ color: 'var(--text-light)' }} />
            <select
              className="input-field"
              value={filters.tag}
              onChange={(e) => onFilterChange({ ...filters, tag: e.target.value })}
              style={{ width: 'auto', minWidth: '100px', padding: '3px 6px', fontSize: '11px', fontWeight: filters.tag !== 'all' && filters.tag ? 600 : 400, borderColor: filters.tag !== 'all' && filters.tag ? 'var(--primary)' : 'var(--border)' }}
            >
              <option value="all">Catégorie : Toutes</option>
              {tags.map((t) => (
                <option key={t.name} value={t.name}>🏷️ {t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
