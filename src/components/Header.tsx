import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, BarChart3, Plus, Upload, UserCheck, Shield, Rocket, Dices, Settings, Crown } from 'lucide-react';

interface HeaderProps {
  currentTab: 'contacts' | 'reports' | 'settings';
  onTabChange: (tab: 'contacts' | 'reports' | 'settings') => void;
  onOpenImport: () => void;
  onOpenNewContact: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenImport,
  onOpenNewContact,
  onOpenLogin
}) => {
  const { currentUser } = useAuth();

  return (
    <header style={{ 
      backgroundColor: 'var(--surface)', 
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ 
        maxWidth: '1680px', 
        margin: '0 auto', 
        padding: '5px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        
        {/* Brand & Establishments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(139, 90, 43, 0.25)'
          }}>
            <Rocket size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Space Fun Games <span style={{ color: 'var(--primary)', fontWeight: 400 }}>&</span> Share & Fun
                <Dices size={15} style={{ color: 'var(--secondary)' }} />
              </h1>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <nav style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--surface-warm)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => onTabChange('contacts')}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'contacts' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'contacts' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'contacts' ? 600 : 500,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: currentTab === 'contacts' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={13} />
            Contacts & Prospects
          </button>

          <button
            onClick={() => onTabChange('reports')}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'reports' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'reports' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'reports' ? 600 : 500,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: currentTab === 'reports' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={13} />
            Rapports d'Activité
          </button>


          <button
            onClick={() => onTabChange('settings')}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'settings' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'settings' ? 600 : 500,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: currentTab === 'settings' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Settings size={13} />
            Paramètres
          </button>
        </nav>

        {/* Right Action buttons & Active User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {currentTab === 'contacts' && (
            <>
              <button onClick={onOpenImport} className="btn btn-secondary btn-sm" title="Importer Excel / CSV">
                <Upload size={13} />
                Importer Excel
              </button>
              <button onClick={onOpenNewContact} className="btn btn-primary btn-sm" title="Ajouter un contact">
                <Plus size={13} />
                + Nouveau Client
              </button>
            </>
          )}

          <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

          <button
            onClick={onOpenLogin}
            className="btn btn-secondary btn-sm"
            style={{ 
              backgroundColor: currentUser?.role === 'coo' ? '#FEF3C7' : 'var(--primary-light)', 
              borderColor: currentUser?.role === 'coo' ? '#F59E0B' : 'var(--border-focus)',
              color: currentUser?.role === 'coo' ? '#92400E' : 'var(--primary)',
              fontWeight: 600,
              padding: '3px 8px'
            }}
            title="Changer d'utilisateur ou gérer l'équipe"
          >
            {currentUser?.role === 'coo' ? <Crown size={13} style={{ color: '#D97706' }} /> : <UserCheck size={13} />}
            <span>{currentUser ? currentUser.username : 'Connexion'}</span>
            {currentUser?.isAdmin && <Shield size={12} style={{ color: 'var(--accent)' }} />}
          </button>
        </div>

      </div>
    </header>
  );
};
