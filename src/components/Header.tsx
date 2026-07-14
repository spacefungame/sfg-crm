import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, BarChart3, Mail, Plus, Upload, UserCheck, Shield, Rocket, Dices, Settings, Crown } from 'lucide-react';

interface HeaderProps {
  currentTab: 'contacts' | 'reports' | 'templates' | 'settings';
  onTabChange: (tab: 'contacts' | 'reports' | 'templates' | 'settings') => void;
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
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        
        {/* Brand & Establishments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(139, 90, 43, 0.25)'
          }}>
            <Rocket size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Space Fun Games <span style={{ color: 'var(--primary)', fontWeight: 400 }}>&</span> Share & Fun
                <Dices size={17} style={{ color: 'var(--secondary)' }} />
              </h1>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <nav style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => onTabChange('contacts')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'contacts' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'contacts' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'contacts' ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: currentTab === 'contacts' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} />
            Contacts & Prospects
          </button>

          <button
            onClick={() => onTabChange('reports')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'reports' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'reports' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'reports' ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: currentTab === 'reports' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={15} />
            Rapports d'Activité
          </button>

          <button
            onClick={() => onTabChange('templates')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'templates' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'templates' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'templates' ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: currentTab === 'templates' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Mail size={15} />
            Modèles d'E-mails
          </button>

          <button
            onClick={() => onTabChange('settings')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'settings' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'settings' ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: currentTab === 'settings' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Settings size={15} />
            Paramètres
          </button>
        </nav>

        {/* Right Action buttons & Active User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {currentTab === 'contacts' && (
            <>
              <button onClick={onOpenImport} className="btn btn-secondary btn-sm" title="Importer Excel / CSV">
                <Upload size={14} />
                Importer Excel
              </button>
              <button onClick={onOpenNewContact} className="btn btn-primary btn-sm" title="Ajouter un contact">
                <Plus size={15} />
                + Nouveau Client
              </button>
            </>
          )}

          <div style={{ height: '22px', width: '1px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

          <button
            onClick={onOpenLogin}
            className="btn btn-secondary btn-sm"
            style={{ 
              backgroundColor: currentUser?.role === 'directrice' ? '#FEF3C7' : 'var(--primary-light)', 
              borderColor: currentUser?.role === 'directrice' ? '#F59E0B' : 'var(--border-focus)',
              color: currentUser?.role === 'directrice' ? '#92400E' : 'var(--primary)',
              fontWeight: 600,
              padding: '5px 12px'
            }}
            title="Changer d'utilisateur ou gérer l'équipe"
          >
            {currentUser?.role === 'directrice' ? <Crown size={15} style={{ color: '#D97706' }} /> : <UserCheck size={15} />}
            <span>{currentUser ? currentUser.username : 'Connexion'}</span>
            {currentUser?.role === 'admin' && <Shield size={13} style={{ color: 'var(--accent)' }} />}
          </button>
        </div>

      </div>
    </header>
  );
};
