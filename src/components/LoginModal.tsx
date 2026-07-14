import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import type { User } from '../types/crm';
import { UserCheck, UserPlus, LogIn, Shield, Users, Lock, Mail, Crown, CheckCircle, X, KeyRound, CheckCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, login, registerUser, updateUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [newFirstPassword, setNewFirstPassword] = useState<string>('');
  const [confirmFirstPassword, setConfirmFirstPassword] = useState<string>('');
  const [firstPasswordError, setFirstPasswordError] = useState<string>('');
  
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('user');

  // Boîte mail d'envoi de l'utilisateur actif
  const [activeEmailConfig, setActiveEmailConfig] = useState<string>(currentUser?.email || '');
  const [emailSavedMessage, setEmailSavedMessage] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectUserButton = (user: User) => {
    setSelectedUser(user);
    setPasswordInput('');
    setPasswordError('');
    setNewFirstPassword('');
    setConfirmFirstPassword('');
    setFirstPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const success = login(selectedUser.username, passwordInput);
    if (success) {
      setPasswordError('');
      setActiveEmailConfig(selectedUser.email || '');
      onClose();
    } else {
      setPasswordError('Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  const handleSaveFirstPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newFirstPassword.trim()) {
      setFirstPasswordError('Veuillez entrer un mot de passe.');
      return;
    }
    if (newFirstPassword !== confirmFirstPassword) {
      setFirstPasswordError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const updated = { ...selectedUser, password: newFirstPassword.trim() };
    updateUser(updated);
    login(updated.username, updated.password);
    setNewFirstPassword('');
    setConfirmFirstPassword('');
    setFirstPasswordError('');
    setActiveEmailConfig(updated.email || '');
    onClose();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      const isFirstUserOrSelf = !currentUser;
      registerUser(newUsername.trim(), newRole, newEmail.trim() || undefined, undefined, isFirstUserOrSelf);
      
      if (newEmail.trim()) {
        const inviteSubject = encodeURIComponent(`Invitation au CRM Space Fun Games & Share & Fun`);
        const inviteBody = encodeURIComponent(
          `Bonjour ${newUsername.trim()},\n\nVous avez été invité(e) à rejoindre le CRM de l'établissement Space Fun Games & Share & Fun en tant que ${newRole === 'directrice' ? 'Directrice' : newRole === 'admin' ? 'Administrateur' : newRole === 'user' ? 'Collaborateur' : newRole}.\n\nAccédez au CRM en ligne ici : https://spacefungame.github.io/sfg-crm/\n\nIdentifiant : ${newUsername.trim()}\n\nLors de votre première connexion sur le site, sélectionnez votre profil et vous pourrez définir vous-même votre mot de passe personnel.\n\nÀ très bientôt,\nL'équipe`
        );
        window.open(`mailto:${newEmail.trim()}?subject=${inviteSubject}&body=${inviteBody}`, '_blank');
      }

      setNewUsername('');
      setNewEmail('');
      setIsCreatingNew(false);
      setSelectedUser(null);
      if (isFirstUserOrSelf) {
        onClose();
      }
    }
  };

  const handleSaveActiveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUser({ ...currentUser, email: activeEmailConfig.trim() });
      setEmailSavedMessage(true);
      setTimeout(() => setEmailSavedMessage(false), 2500);
    }
  };

  return (
    <div className="overlay-backdrop animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card animate-scale-up" style={{ position: 'relative', width: '100%', maxWidth: '480px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          title="Fermer"
        >
          <X size={20} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' 
          }}>
            <Users size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {isCreatingNew ? 'Créer / Inviter un collaborateur' : selectedUser && selectedUser.password ? `Connexion sécurisée : ${selectedUser.username}` : 'Espace Collaborateur'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {isCreatingNew 
              ? 'Créez un profil pour un collaborateur et envoyez-lui une invitation par e-mail'
              : selectedUser && selectedUser.password 
              ? 'Veuillez saisir votre mot de passe personnel pour accéder au CRM'
              : selectedUser && !selectedUser.password
              ? 'Bienvenue ! Veuillez définir et enregistrer votre mot de passe pour cette 1ère connexion'
              : 'Sélectionnez votre profil pour vous connecter et synchroniser votre boîte mail'}
          </p>
        </div>

        {selectedUser && selectedUser.password && !isCreatingNew ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{selectedUser.username}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Rôle : <span style={{ fontWeight: 600, color: selectedUser.role === 'directrice' ? '#D97706' : 'var(--primary)' }}>
                    {selectedUser.role === 'directrice' ? 'Directrice' : selectedUser.role === 'admin' ? 'Administrateur' : selectedUser.role === 'user' ? 'Collaborateur' : selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Mot de passe *
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Saisissez votre mot de passe (ex: Jerome22...)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                required
              />
              {passwordError && (
                <div style={{ fontSize: '13px', color: '#DC2626', marginTop: '6px', fontWeight: 500 }}>
                  ⚠️ {passwordError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSelectedUser(null)}
              >
                Changer d'utilisateur
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <LogIn size={16} />
                Me connecter
              </button>
            </div>
          </form>
        ) : selectedUser && (!selectedUser.password || selectedUser.password.trim() === '') && !isCreatingNew ? (
          <form onSubmit={handleSaveFirstPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <KeyRound size={22} style={{ color: '#D97706' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#92400E' }}>
                  🌱 1ère connexion : {selectedUser.username}
                </div>
                <div style={{ fontSize: '12.5px', color: '#B45309', marginTop: '2px' }}>
                  Veuillez choisir et enregistrer le mot de passe personnel qui protégera votre compte.
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Choisissez votre mot de passe *
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Ex: MonSecret2026..."
                value={newFirstPassword}
                onChange={(e) => setNewFirstPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Confirmez votre mot de passe *
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Retapez votre mot de passe..."
                value={confirmFirstPassword}
                onChange={(e) => setConfirmFirstPassword(e.target.value)}
                required
              />
              {firstPasswordError && (
                <div style={{ fontSize: '13px', color: '#DC2626', marginTop: '6px', fontWeight: 500 }}>
                  ⚠️ {firstPasswordError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSelectedUser(null)}
              >
                Changer d'utilisateur
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <CheckCheck size={16} />
                Enregistrer & Accéder
              </button>
            </div>
          </form>
        ) : !isCreatingNew ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                Sélectionnez votre compte :
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isDir = u.role === 'directrice';
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUserButton(u)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent ? '2px solid var(--primary)' : isDir ? '1px solid #D97706' : '1px solid var(--border)',
                        backgroundColor: isCurrent ? 'var(--primary-light)' : isDir ? '#FEF3C7' : 'var(--surface)',
                        color: isCurrent ? 'var(--primary)' : isDir ? '#92400E' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isDir ? '0 2px 4px rgba(217, 119, 6, 0.1)' : 'none'
                      }}
                    >
                      {isDir ? <Crown size={16} style={{ color: '#D97706' }} /> : <UserCheck size={15} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
                      {u.role === 'admin' && <Shield size={13} style={{ color: 'var(--accent)' }} />}
                      {u.password && <Lock size={12} style={{ opacity: 0.6 }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Config Boîte Mail du collaborateur actif */}
            {currentUser && (
              <form onSubmit={handleSaveActiveEmail} style={{ padding: '14px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  <Mail size={16} style={{ color: 'var(--primary)' }} />
                  Configuration de votre boîte mail d'envoi ({currentUser.username}) :
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Ex: laureline@spacefungames.fr"
                    value={activeEmailConfig}
                    onChange={(e) => setActiveEmailConfig(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                    Enregistrer
                  </button>
                </div>
                {emailSavedMessage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', marginTop: '6px', fontWeight: 500 }}>
                    <CheckCircle size={14} />
                    Boîte mail enregistrée pour l'envoi de vos e-mails clients !
                  </div>
                )}
              </form>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setIsCreatingNew(true)}
                style={{ width: '100%' }}
              >
                <UserPlus size={16} />
                + Créer ou inviter un nouveau collaborateur
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateNew} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Prénom / Nom du collaborateur *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Jérôme, Julie..."
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Adresse e-mail du collaborateur (pour l'invitation & les envois)
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="Ex: jerome@spacefungames.fr"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Si renseigné, un e-mail d'invitation sera préparé automatiquement pour l'inviter.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Rôle au sein du CRM
                </label>
                <select
                  className="input-field"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {storageService.getRoles().map((r) => (
                    <option key={r} value={r}>
                      {r === 'directrice' ? 'Directrice' : r === 'admin' ? 'Administrateur' : r === 'user' ? 'Collaborateur' : r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
                Créer & Inviter
              </button>
            </div>
          </form>
        )}

        {!isCreatingNew && !selectedUser && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Fermer {currentUser ? `(Rester connecté en tant que ${currentUser.username})` : '(Fermer la fenêtre)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
