import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserPlus, LogIn, Shield, Users } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, login, registerUser, currentUser } = useAuth();
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsername) {
      login(selectedUsername);
      onClose();
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      registerUser(newUsername.trim(), newRole);
      setNewUsername('');
      setIsCreatingNew(false);
      onClose();
    }
  };

  return (
    <div className="overlay-backdrop animate-fade-in">
      <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' 
          }}>
            <Users size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {isCreatingNew ? 'Nouveau collaborateur' : 'Espace Collaborateur'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {isCreatingNew 
              ? 'Créez votre profil en 10 secondes pour suivre votre activité'
              : 'Sélectionnez votre identifiant pour tracer vos appels, mails et relances'}
          </p>
        </div>

        {!isCreatingNew ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Choisir votre compte
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUsername(u.username);
                        login(u.username);
                        onClose();
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isCurrent ? 'var(--primary-light)' : 'var(--surface)',
                        color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <UserCheck size={16} />
                      {u.username}
                      {u.role === 'admin' && <Shield size={13} style={{ color: 'var(--accent)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Ou saisir un autre identifiant
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Antoine, Céline..."
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!selectedUsername.trim()}>
                    <LogIn size={16} />
                    Entrer
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setIsCreatingNew(true)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                <UserPlus size={16} />
                + Ajouter un nouveau collaborateur
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateNew} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Prénom ou Nom du collaborateur *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Sophie"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Rôle au sein de l'équipe
              </label>
              <select
                className="input-field"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
              >
                <option value="user">Collaborateur / Commercial</option>
                <option value="admin">Administrateur / Gérant</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setIsCreatingNew(false)}
              >
                Retour
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!newUsername.trim()}
              >
                Créer et me connecter
              </button>
            </div>
          </form>
        )}

        {currentUser && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Fermer (Rester connecté en tant que {currentUser.username})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
