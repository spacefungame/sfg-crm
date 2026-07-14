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
    <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
      
      {/* Top row: Search Bar & Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Rechercher par nom, téléphone, e-mail ou société..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            style={{ paddingLeft: '36px', paddingRight: filters.search ? '60px' : '12px', paddingTop: '6px', paddingBottom: '6px', fontSize: '13px' }}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600 }}
            >
              Effacer
            </button>
          )}
        </div>

        {/* Count & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-warm)', padding: '5px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
            <strong>{filteredCount}</strong> affiché{filteredCount !== 1 ? 's' : ''} / {totalCount}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ color: '#C81E1E', borderColor: '#FBD5D5', backgroundColor: '#FDE8E8', padding: '5px 10px' }}
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw size={13} />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Filter dropdowns (Compact line) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', borderTop: '1px solid #F0ECE4', paddingTop: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '2px' }}>
          <Filter size={14} style={{ color: 'var(--primary)' }} />
          Filtres :
        </div>

        {/* Menu déroulant Établissement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Building2 size={13} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.establishment}
            onChange={(e) => onFilterChange({ ...filters, establishment: e.target.value as any })}
            style={{ width: 'auto', minWidth: '150px', padding: '5px 8px', fontSize: '12.5px', fontWeight: filters.establishment !== 'all' ? 600 : 400, borderColor: filters.establishment !== 'all' ? 'var(--primary)' : 'var(--border)' }}
          >
            <option value="all">Établissement : Tous</option>
            <option value="space_fun_games">🚀 Space Fun Games</option>
            <option value="share_and_fun">🎲 Share & Fun</option>
            <option value="les_deux">🌟 Les deux</option>
          </select>
        </div>

        {/* Menu déroulant Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TagIcon size={13} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            style={{ width: 'auto', minWidth: '130px', padding: '5px 8px', fontSize: '12.5px', fontWeight: filters.type !== 'all' ? 600 : 400, borderColor: filters.type !== 'all' ? 'var(--secondary)' : 'var(--border)' }}
          >
            <option value="all">Type : Tous</option>
            {contactTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Menu déroulant Statut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            style={{ width: 'auto', minWidth: '150px', padding: '5px 8px', fontSize: '12.5px', fontWeight: filters.status !== 'all' ? 600 : 400, borderColor: filters.status !== 'all' ? 'var(--primary)' : 'var(--border)' }}
          >
            <option value="all">Statut : Tous</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Menu déroulant Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Bookmark size={13} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.tag || 'all'}
            onChange={(e) => onFilterChange({ ...filters, tag: e.target.value })}
            style={{ width: 'auto', minWidth: '130px', padding: '5px 8px', fontSize: '12.5px', fontWeight: filters.tag && filters.tag !== 'all' ? 600 : 400, borderColor: filters.tag && filters.tag !== 'all' ? '#D97706' : 'var(--border)' }}
          >
            <option value="all">Tag : Tous</option>
            {tags.map((tg) => (
              <option key={tg.name} value={tg.name}>🏷️ {tg.name}</option>
            ))}
          </select>
        </div>

        {/* Menu déroulant Dead line urgence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} style={{ color: 'var(--text-light)' }} />
          <select
            className="input-field"
            value={filters.urgency}
            onChange={(e) => onFilterChange({ ...filters, urgency: e.target.value as any })}
            style={{ width: 'auto', minWidth: '140px', padding: '5px 8px', fontSize: '12.5px', fontWeight: filters.urgency !== 'all' ? 600 : 400, borderColor: filters.urgency !== 'all' ? '#C81E1E' : 'var(--border)' }}
          >
            <option value="all">Dead line : Toutes</option>
            <option value="late">⚠️ En retard</option>
            <option value="today">🔥 Aujourd'hui</option>
            <option value="future">⏳ À venir</option>
            <option value="none">Sans dead line</option>
          </select>
        </div>

      </div>
    </div>
  );
};
