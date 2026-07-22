import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { LogIn, UserPlus, X, Mail, Shield, CheckCircle } from 'lucide-react';


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, registerUser, currentUser, updateUser } = useAuth();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regLoginEmail, setRegLoginEmail] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPreferredEmail, setRegPreferredEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [regError, setRegError] = useState('');

  // Email Config State
  const [activeEmailConfig, setActiveEmailConfig] = useState<string>(currentUser?.email || '');
  const [emailSavedMessage, setEmailSavedMessage] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Veuillez entrer votre e-mail de connexion.');
      return;
    }
    const success = login(loginEmail, loginPassword);
    if (success) {
      setLoginError('');
      setActiveEmailConfig(currentUser?.email || '');
      onClose();
    } else {
      setLoginError('E-mail ou mot de passe incorrect.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    
    if (!regLoginEmail.trim() || !regFirstName.trim() || !regLastName.trim() || !regPassword.trim()) {
      setRegError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Les mots de passe ne correspondent pas.');
      return;
    }

    const newUser = registerUser(
      regLoginEmail, 
      regFirstName, 
      regLastName, 
      regRole, 
      regPreferredEmail.trim() || undefined, 
      regPassword
    );

    if (!newUser) {
      setRegError("Cette adresse e-mail n'est pas autorisée. Veuillez contacter l'administrateur.");
      return;
    }

    onClose();
  };

  const handleSaveActiveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUser({ ...currentUser, email: activeEmailConfig.trim() });
      setEmailSavedMessage(true);
      setTimeout(() => setEmailSavedMessage(false), 2500);
    }
  };

  const availableRoles = storageService.getRoles().filter(r => r !== 'admin' && r !== 'coo');

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
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)' }}>
            Espace Collaborateur
          </h2>
        </div>

        {/* Tabs */}
        {!currentUser && (
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab('login')}
              style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', background: activeTab === 'login' ? 'var(--surface)' : 'transparent', color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            >
              Se connecter
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('register')}
              style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', background: activeTab === 'register' ? 'var(--surface)' : 'transparent', color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            >
              Créer un compte
            </button>
          </div>
        )}

        {currentUser ? (
          <div>
            <div style={{ padding: '14px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Shield size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>Connecté en tant que : {currentUser.username}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Rôle : <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{currentUser.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveActiveEmail} style={{ padding: '14px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                Boîte mail d'envoi préférée :
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Ex: contact@spacefungames.fr"
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
                  Enregistré !
                </div>
              )}
            </form>
          </div>
        ) : activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Adresse e-mail
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Votre e-mail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Votre mot de passe"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {loginError && (
                <div style={{ fontSize: '13px', color: '#DC2626', marginTop: '6px', fontWeight: 500 }}>
                  ⚠️ {loginError}
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              <LogIn size={16} /> Me connecter
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Adresse e-mail autorisée *
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="E-mail de connexion"
                value={regLoginEmail}
                onChange={(e) => setRegLoginEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Prénom *
                </label>
                <input type="text" className="input-field" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom *
                </label>
                <input type="text" className="input-field" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Mot de passe *
                </label>
                <input type="password" className="input-field" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Confirmer *
                </label>
                <input type="password" className="input-field" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Adresse e-mail préférée pour l'envoi aux clients (Optionnel)
              </label>
              <input type="email" className="input-field" placeholder="Ex: contact@..." value={regPreferredEmail} onChange={(e) => setRegPreferredEmail(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Votre rôle
              </label>
              <select className="input-field" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                {availableRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {regError && (
              <div style={{ fontSize: '13px', color: '#DC2626', marginTop: '6px', fontWeight: 500 }}>
                ⚠️ {regError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              <UserPlus size={16} /> Créer mon compte
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
