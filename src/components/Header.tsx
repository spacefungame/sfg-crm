import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, BarChart3, Mail, Plus, Upload, UserCheck, Shield, Rocket, Dices } from 'lucide-react';

interface HeaderProps {
  currentTab: 'contacts' | 'reports' | 'templates';
  onTabChange: (tab: 'contacts' | 'reports' | 'templates') => void;
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
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        
        {/* Brand & Establishments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(139, 90, 43, 0.25)'
          }}>
            <Rocket size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Space Fun Games <span style={{ color: 'var(--primary)', fontWeight: 400 }}>&</span> Share & Fun
                <Dices size={18} style={{ color: 'var(--secondary)' }} />
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              CRM Épuré & Collaboratif • 100% en ligne & Gratuit
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--surface-warm)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => onTabChange('contacts')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'contacts' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'contacts' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'contacts' ? 600 : 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: currentTab === 'contacts' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} />
            Contacts & Prospects
          </button>

          <button
            onClick={() => onTabChange('reports')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'reports' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'reports' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'reports' ? 600 : 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: currentTab === 'reports' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={16} />
            Rapports d'Activité
          </button>

          <button
            onClick={() => onTabChange('templates')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentTab === 'templates' ? 'var(--surface)' : 'transparent',
              color: currentTab === 'templates' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'templates' ? 600 : 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: currentTab === 'templates' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Mail size={16} />
            Modèles d'E-mails
          </button>
        </nav>

        {/* Right Action buttons & Active User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {currentTab === 'contacts' && (
            <>
              <button onClick={onOpenImport} className="btn btn-secondary btn-sm" title="Importer Excel / CSV">
                <Upload size={15} />
                Importer Excel
              </button>
              <button onClick={onOpenNewContact} className="btn btn-primary btn-sm" title="Ajouter un contact">
                <Plus size={16} />
                + Nouveau Client
              </button>
            </>
          )}

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

          <button
            onClick={onOpenLogin}
            className="btn btn-secondary btn-sm"
            style={{ 
              backgroundColor: 'var(--primary-light)', 
              borderColor: 'var(--border-focus)',
              color: 'var(--primary)',
              fontWeight: 600
            }}
            title="Changer d'utilisateur ou gérer l'équipe"
          >
            <UserCheck size={16} />
            <span>{currentUser ? currentUser.username : 'Connexion'}</span>
            {currentUser?.role === 'admin' && <Shield size={13} style={{ color: 'var(--accent)' }} />}
          </button>
        </div>

      </div>
    </header>
  );
};
