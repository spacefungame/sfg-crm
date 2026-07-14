import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import type { TagDefinition, User } from '../types/crm';
import { Settings, Bookmark, CheckCircle2, Tag as TagIcon, Users, Plus, Trash2, Edit3, Check, Mail, Lock, Shield, Crown, X } from 'lucide-react';
import { TemplatesManager } from './TemplatesManager';

export const SettingsView: React.FC = () => {
  const { users, currentUser, registerUser, refreshUsers } = useAuth();
  const [activeSection, setActiveSection] = useState<'tags' | 'statuses' | 'types' | 'roles' | 'users' | 'templates'>('tags');

  // --- Tags State ---
  const [tagsList, setTagsList] = useState<TagDefinition[]>(storageService.getTags());
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagDesc, setNewTagDesc] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<string>('#8B5A2B');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // --- Statuses State ---
  const [statusesList, setStatusesList] = useState<string[]>(storageService.getStatuses());
  const [newStatusName, setNewStatusName] = useState<string>('');

  // --- Types State ---
  const [typesList, setTypesList] = useState<string[]>(storageService.getContactTypes());
  const [newTypeName, setNewTypeName] = useState<string>('');

  // --- Roles State ---
  const [rolesList, setRolesList] = useState<string[]>(storageService.getRoles());
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [editingRoleOldName, setEditingRoleOldName] = useState<string | null>(null);
  const [newRoleEditName, setNewRoleEditName] = useState<string>('');

  // --- Users State ---
  const [newUsername, setNewUsername] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('user');

  const colorPalette = [
    { name: 'Marron / Caramel', code: '#8B5A2B' },
    { name: 'Beige Doré', code: '#D4AF37' },
    { name: 'Bleu Océan', code: '#2563EB' },
    { name: 'Vert Émeraude', code: '#10B981' },
    { name: 'Violet Imperial', code: '#8B5CF6' },
    { name: 'Rose Fushia', code: '#EC4899' },
    { name: 'Rouge Sienne', code: '#DC2626' },
    { name: 'Orange Solaire', code: '#F59E0B' },
    { name: 'Gris Ardoise', code: '#64748B' },
    { name: 'Cyan Tech', code: '#06B6D4' }
  ];

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    if (editingTagId) {
      storageService.saveTag({
        id: editingTagId,
        name: newTagName.trim(),
        description: newTagDesc.trim() || undefined,
        color: newTagColor
      });
      setEditingTagId(null);
    } else {
      storageService.saveTag({
        id: 'tag-' + Date.now(),
        name: newTagName.trim(),
        description: newTagDesc.trim() || undefined,
        color: newTagColor
      });
    }

    setNewTagName('');
    setNewTagDesc('');
    setNewTagColor('#8B5A2B');
    setTagsList(storageService.getTags());
  };

  const handleDeleteTag = (id: string) => {
    if (window.confirm('Confirmez-vous la suppression de ce tag ?')) {
      storageService.deleteTag(id);
      setTagsList(storageService.getTags());
    }
  };

  const handleStartEditTag = (tag: TagDefinition) => {
    setEditingTagId(tag.id);
    setNewTagName(tag.name);
    setNewTagDesc(tag.description || '');
    setNewTagColor(tag.color || '#8B5A2B');
  };

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    storageService.addStatus(newStatusName.trim());
    setNewStatusName('');
    setStatusesList(storageService.getStatuses());
  };

  const handleDeleteStatus = (status: string) => {
    if (window.confirm(`Supprimer le statut "${status}" ?`)) {
      storageService.deleteStatus(status);
      setStatusesList(storageService.getStatuses());
    }
  };

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    storageService.addContactType(newTypeName.trim());
    setNewTypeName('');
    setTypesList(storageService.getContactTypes());
  };

  const handleDeleteType = (type: string) => {
    if (window.confirm(`Supprimer le type de contact "${type}" ?`)) {
      storageService.deleteContactType(type);
      setTypesList(storageService.getContactTypes());
    }
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    storageService.addRole(newRoleName.trim());
    setNewRoleName('');
    setRolesList(storageService.getRoles());
  };

  const handleDeleteRole = (role: string) => {
    if (role === 'directrice') {
      alert("Le rôle Directrice ne peut pas être supprimé car c'est le rôle principal du système.");
      return;
    }
    if (window.confirm(`Supprimer le rôle "${role}" ? Les collaborateurs ayant ce rôle passeront en rôle "user".`)) {
      storageService.deleteRole(role);
      setRolesList(storageService.getRoles());
      refreshUsers();
    }
  };

  const handleStartEditRole = (role: string) => {
    setEditingRoleOldName(role);
    setNewRoleEditName(role);
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleOldName || !newRoleEditName.trim()) return;
    storageService.updateRole(editingRoleOldName, newRoleEditName.trim());
    setEditingRoleOldName(null);
    setNewRoleEditName('');
    setRolesList(storageService.getRoles());
    refreshUsers();
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    registerUser(newUsername.trim(), newRole, newEmail.trim() || undefined, newPassword.trim() || undefined);

    if (newEmail.trim()) {
      const inviteSubject = encodeURIComponent(`Invitation au CRM Space Fun Games & Share & Fun`);
      const inviteBody = encodeURIComponent(
        `Bonjour ${newUsername.trim()},\n\nVous avez été invité(e) à rejoindre le CRM de l'établissement Space Fun Games & Share & Fun en tant que ${newRole === 'directrice' ? 'Directrice' : newRole === 'admin' ? 'Administrateur' : 'Collaborateur'}.\n\nAccédez au CRM en ligne ici : https://spacefungame.github.io/sfg-crm/\n\nIdentifiant : ${newUsername.trim()}\n${newPassword ? `Mot de passe provisoire : ${newPassword}\n` : ''}\nÀ très bientôt,\nL'équipe`
      );
      window.open(`mailto:${newEmail.trim()}?subject=${inviteSubject}&body=${inviteBody}`, '_blank');
    }

    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    refreshUsers();
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (userToDelete.id === currentUser?.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte actif.');
      return;
    }
    if (window.confirm(`Confirmez-vous la suppression du collaborateur "${userToDelete.username}" ?`)) {
      storageService.deleteUser(userToDelete.id);
      refreshUsers();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* En-tête des paramètres */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={22} style={{ color: 'var(--primary)' }} />
            Paramètres & Personnalisation du CRM
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Gérez vos tags colorisés, vos statuts, vos types de contacts, et l'équipe des collaborateurs.
          </p>
        </div>

        {/* Navigation sous-onglets */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--surface-warm)', padding: '5px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSection('tags')}
            className={`btn btn-sm ${activeSection === 'tags' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Bookmark size={14} />
            Tags ({tagsList.length})
          </button>
          <button
            onClick={() => setActiveSection('statuses')}
            className={`btn btn-sm ${activeSection === 'statuses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <CheckCircle2 size={14} />
            Statuts ({statusesList.length})
          </button>
          <button
            onClick={() => setActiveSection('types')}
            className={`btn btn-sm ${activeSection === 'types' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <TagIcon size={14} />
            Types ({typesList.length})
          </button>
          <button
            onClick={() => setActiveSection('roles')}
            className={`btn btn-sm ${activeSection === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Crown size={14} />
            Rôles ({rolesList.length})
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`btn btn-sm ${activeSection === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Users size={14} />
            Équipe ({users.length})
          </button>
          <button
            onClick={() => setActiveSection('templates')}
            className={`btn btn-sm ${activeSection === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Mail size={14} />
            Modèles d'E-mails
          </button>
        </div>
      </div>

      {/* Section 1: TAGS & ÉTIQUETTES */}
      {activeSection === 'tags' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} style={{ color: 'var(--primary)' }} />
              {editingTagId ? 'Modifier le Tag' : 'Créer un nouveau Tag'}
            </h3>
            <form onSubmit={handleSaveTag} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du tag *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: VIP, Grand Compte, Relance urgente..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Description (optionnelle)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Clients avec contrat annuel..."
                  value={newTagDesc}
                  onChange={(e) => setNewTagDesc(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Couleur d'affichage :
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {colorPalette.map((col) => (
                    <button
                      key={col.code}
                      type="button"
                      onClick={() => setNewTagColor(col.code)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: col.code,
                        border: newTagColor === col.code ? '3px solid #2A211D' : '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                      title={col.name}
                    >
                      {newTagColor === col.code && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {editingTagId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingTagId(null);
                      setNewTagName('');
                      setNewTagDesc('');
                      setNewTagColor('#8B5A2B');
                    }}
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingTagId ? 'Enregistrer' : '+ Ajouter le Tag'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={18} style={{ color: 'var(--primary)' }} />
              Tags disponibles ({tagsList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tagsList.map((tag) => (
                <div
                  key={tag.id}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--surface-warm)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: tag.color || '#8B5A2B',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      🏷️ {tag.name}
                    </span>
                    {tag.description && (
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        — {tag.description}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleStartEditTag(tag)}
                      className="btn-icon"
                      style={{ border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--primary)' }}
                      title="Modifier"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="btn-icon"
                      style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E' }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {tagsList.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Aucun tag créé. Créez votre premier tag ci-contre pour catégoriser vos clients !
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: STATUTS */}
      {activeSection === 'statuses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} style={{ color: 'var(--primary)' }} />
              Ajouter un statut personnalisé
            </h3>
            <form onSubmit={handleAddStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du statut *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: En attente de signature, Contrat validé..."
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                + Ajouter le Statut
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>
              Statuts du cycle de vente ({statusesList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {statusesList.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--surface-warm)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                    {st}
                  </div>
                  <button
                    onClick={() => handleDeleteStatus(st)}
                    className="btn-icon"
                    style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E' }}
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: TYPES DE CONTACTS */}
      {activeSection === 'types' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} style={{ color: 'var(--primary)' }} />
              Ajouter un type de contact
            </h3>
            <form onSubmit={handleAddType} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du type *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Partenaire, Comité d'entreprise (CE)..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                + Ajouter le Type
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>
              Types de contacts ({typesList.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {typesList.map((tp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'var(--surface-warm)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--text-main)'
                  }}
                >
                  <span>{tp}</span>
                  <button
                    onClick={() => handleDeleteType(tp)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C81E1E', display: 'flex' }}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 4: RÔLES DE COLLABORATEURS */}
      {activeSection === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} style={{ color: 'var(--primary)' }} />
              Ajouter un rôle
            </h3>
            <form onSubmit={handleAddRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du rôle *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Stagiaire, Responsable Événements, Animateur..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                + Ajouter le Rôle
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>
              Rôles existants ({rolesList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rolesList.map((role, idx) => {
                const isDir = role === 'directrice';
                const isEditing = editingRoleOldName === role;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: isDir ? '#FEF3C7' : 'var(--surface-warm)',
                      borderRadius: 'var(--radius-md)',
                      border: isDir ? '1px solid #F59E0B' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    {isEditing ? (
                      <form onSubmit={handleSaveEditRole} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <input
                          type="text"
                          className="input-field"
                          value={newRoleEditName}
                          onChange={(e) => setNewRoleEditName(e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '13px' }}
                          required
                          autoFocus
                        />
                        <button type="submit" className="btn btn-primary btn-sm" title="Enregistrer">
                          <Check size={14} />
                        </button>
                        <button type="button" onClick={() => setEditingRoleOldName(null)} className="btn btn-secondary btn-sm" title="Annuler">
                          <X size={14} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: isDir ? '#D97706' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isDir ? <Crown size={16} /> : <Shield size={16} style={{ color: 'var(--primary)' }} />}
                          <span>
                            {role === 'directrice' ? 'Directrice' : role === 'admin' ? 'Administrateur' : role === 'user' ? 'Collaborateur' : role}
                          </span>
                          {isDir && <span className="badge" style={{ backgroundColor: '#D97706', color: '#FFF', fontSize: '10px' }}>Système</span>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleStartEditRole(role)}
                            className="btn-icon"
                            style={{ border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-main)' }}
                            title="Renommer ce rôle"
                          >
                            <Edit3 size={15} />
                          </button>
                          {!isDir && (
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="btn-icon"
                              style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E' }}
                              title="Supprimer ce rôle"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Section 5: ÉQUIPE & UTILISATEURS */}
      {activeSection === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              Inviter / Créer un profil
            </h3>
            <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Prénom & Nom *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Julie Martin"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  E-mail du collaborateur
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Ex: julie@spacefungames.fr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Mot de passe (optionnel)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: MotDePasse123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Créer profil & Inviter
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>
              Membres de l'équipe ({users.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map((u) => {
                const isDir = u.role === 'directrice';
                const isMe = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: isMe ? 'var(--primary-light)' : 'var(--surface-warm)',
                      borderRadius: 'var(--radius-md)',
                      border: isDir ? '1px solid #F59E0B' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isDir ? '#FEF3C7' : 'var(--surface)',
                        color: isDir ? '#D97706' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                        border: '1px solid var(--border)'
                      }}>
                        {isDir ? <Crown size={18} /> : u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {u.username}
                          {isMe && <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#FFF', fontSize: '10px' }}>Vous</span>}
                          {u.role === 'admin' && <span title="Administrateur" style={{ display: 'inline-flex' }}><Shield size={14} style={{ color: 'var(--accent)' }} /></span>}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Rôle :
                            <select
                              value={u.role}
                              onChange={(e) => {
                                u.role = e.target.value;
                                storageService.saveUser(u);
                                refreshUsers();
                              }}
                              disabled={!isDir && !isMe && currentUser?.role !== 'directrice' && currentUser?.role !== 'admin'}
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                fontWeight: 600,
                                fontSize: '12px',
                                backgroundColor: 'var(--surface)',
                                color: isDir ? '#D97706' : 'inherit',
                                cursor: 'pointer'
                              }}
                            >
                              {storageService.getRoles().map((r) => (
                                <option key={r} value={r}>
                                  {r === 'directrice' ? 'Directrice' : r === 'admin' ? 'Administrateur' : r === 'user' ? 'Collaborateur' : r}
                                </option>
                              ))}
                            </select>
                          </span>
                          {u.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {u.email}</span>}
                          {u.password && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.7 }}><Lock size={12} /> Sécurisé</span>}
                        </div>
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="btn-icon"
                        style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E' }}
                        title="Supprimer ce compte"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Section 5: MODÈLES D'E-MAILS */}
      {activeSection === 'templates' && (
        <div className="animate-fade-in">
          <TemplatesManager onTemplatesChanged={() => {}} />
        </div>
      )}

    </div>
  );
};
