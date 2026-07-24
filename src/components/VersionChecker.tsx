import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface VersionInfo {
  version: string;
  description: string;
}

export const VersionChecker: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [newVersionInfo, setNewVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    // 1. Charger la version actuelle au démarrage de l'app
    const fetchInitialVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${new Date().getTime()}`);
        if (res.ok) {
          const data: VersionInfo = await res.json();
          setCurrentVersion(data.version);
        }
      } catch (err) {
        console.error('Erreur lors du chargement initial de la version', err);
      }
    };
    fetchInitialVersion();
  }, []);

  useEffect(() => {
    if (!currentVersion) return; // Ne pas vérifier tant qu'on n'a pas chargé la version de base

    // 2. Fonction pour vérifier si une nouvelle version existe
    const checkForUpdates = async () => {
      try {
        const res = await fetch(`/version.json?t=${new Date().getTime()}`);
        if (res.ok) {
          const data: VersionInfo = await res.json();
          if (data.version && data.version !== currentVersion) {
            setNewVersionInfo(data);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de version', err);
      }
    };

    // Vérifier toutes les 2 minutes
    const interval = setInterval(checkForUpdates, 120000);

    // Et vérifier à chaque fois que l'utilisateur revient sur l'onglet
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentVersion]);

  if (!newVersionInfo) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        textAlign: 'center',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          width: '60px', height: '60px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <RefreshCw size={28} color="#fff" />
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
          Mise à jour disponible
        </h2>
        
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          Une nouvelle version du CRM est prête. Afin de garantir le bon fonctionnement de votre travail, vous devez recharger la page.
        </p>
        
        <div style={{
          background: 'var(--surface-warm)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '24px',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <AlertCircle size={15} style={{ color: 'var(--primary)' }}/> Nouveautés de la version {newVersionInfo.version} :
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
            {newVersionInfo.description}
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '10px'
          }}
        >
          <RefreshCw size={18} />
          Mettre à jour maintenant
        </button>
      </div>
    </div>
  );
};
