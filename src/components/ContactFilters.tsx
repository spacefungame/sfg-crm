import React from 'react';
import type { Establishment } from '../types/crm';
import { storageService } from '../services/storageService';
import { Search, Calendar, Building2, Tag, CheckCircle2, RotateCcw } from 'lucide-react';

export interface FilterState {
  search: string;
  establishment: Establishment | 'all';
  type: string;
  status: string;
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

  const statuses = [
    'Nouveau : à contacter',
    'À relancer',
    'Rendez-vous fixé',
    'Devis envoyé',
    'Client converti',
    'Pas intéressé'
  ];

  const resetFilters = () => {
    onFilterChange({
      search: '',
      establishment: 'all',
      type: 'all',
      status: 'all',
      urgency: 'all'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.establishment !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.urgency !== 'all';

  return (
    <div className="card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
      
      {/* Top row: Search Bar & Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Rechercher par nom, téléphone, e-mail ou société..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            style={{ paddingLeft: '40px' }}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '12px' }}
            >
              Effacer
            </button>
          )}
        </div>

        {/* Count & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-warm)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
            <strong>{filteredCount}</strong> contact{filteredCount !== 1 ? 's' : ''} affiché{filteredCount !== 1 ? 's' : ''} sur {totalCount}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ color: '#C81E1E', borderColor: '#FBD5D5', backgroundColor: '#FDE8E8' }}
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Filter rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F0ECE4', paddingTop: '14px' }}>
        
        {/* Row 1: Établissement & Type */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          
          {/* Établissement */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={15} />
              Établissement :
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Tous' },
                { id: 'space_fun_games', label: '🚀 Space Fun Games' },
                { id: 'share_and_fun', label: '🎲 Share & Fun' },
                { id: 'les_deux', label: '🌟 Les deux' }
              ].map((item) => {
                const active = filters.establishment === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onFilterChange({ ...filters, establishment: item.id as any })}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
                      color: active ? '#FFFFFF' : 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)' }} />

          {/* Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={15} />
              Type :
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onFilterChange({ ...filters, type: 'all' })}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  border: filters.type === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: filters.type === 'all' ? 'var(--primary)' : 'var(--surface)',
                  color: filters.type === 'all' ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: filters.type === 'all' ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                Tous
              </button>
              {contactTypes.map((t) => {
                const active = filters.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => onFilterChange({ ...filters, type: active ? 'all' : t })}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1px solid var(--secondary)' : '1px solid var(--border)',
                      backgroundColor: active ? 'var(--secondary)' : 'var(--surface)',
                      color: active ? '#FFFFFF' : 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Row 2: Statut & Urgence Dead line */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          
          {/* Statut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} />
              Statut :
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onFilterChange({ ...filters, status: 'all' })}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  border: filters.status === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: filters.status === 'all' ? 'var(--primary)' : 'var(--surface)',
                  color: filters.status === 'all' ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: filters.status === 'all' ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                Tous
              </button>
              {statuses.map((s) => {
                const active = filters.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onFilterChange({ ...filters, status: active ? 'all' : s })}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)' }} />

          {/* Dead lines urgence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={15} />
              Dead line :
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'late', label: '⚠️ En retard', bg: '#FDE8E8', color: '#C81E1E' },
                { id: 'today', label: '🔥 Aujourd\'hui', bg: '#FEF08A', color: '#854D0E' },
                { id: 'future', label: '⏳ À venir' },
                { id: 'none', label: 'Sans dead line' }
              ].map((item) => {
                const active = filters.urgency === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onFilterChange({ ...filters, urgency: item.id as any })}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1px solid #B89778' : '1px solid var(--border)',
                      backgroundColor: active ? (item.bg || 'var(--primary)') : 'var(--surface)',
                      color: active ? (item.color || '#FFFFFF') : 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
