import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import type { TagDefinition, User } from '../types/crm';
import { Settings, Bookmark, CheckCircle2, Tag as TagIcon, Users, Plus, Trash2, Edit3, Check, Mail, Lock, Shield, Crown, X, KeyRound, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { TemplatesManager } from './TemplatesManager';
import { EmailProviderSelector } from './EmailProviderSelector';

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
  const [draggedStatusIdx, setDraggedStatusIdx] = useState<number | null>(null);

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
  const [newRole, setNewRole] = useState<string>('user');
  const [inviteProvider, setInviteProvider] = useState<string>(storageService.getPreferredEmailProvider());

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

  React.useEffect(() => {
    const handleSync = () => {
      setTagsList(storageService.getTags());
      setStatusesList(storageService.getStatuses());
      setTypesList(storageService.getContactTypes());
      setRolesList(storageService.getRoles());
    };
    window.addEventListener('crm_data_updated', handleSync);
    return () => window.removeEventListener('crm_data_updated', handleSync);
  }, []);

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

  const handleDeleteTag = (id: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm('Confirmez-vous la suppression de ce tag ?')) {
      storageService.deleteTag(id);
      setTagsList(storageService.getTags());
    }
  };

  const handleStartEditTag = (tag: TagDefinition, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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

  const handleDeleteStatus = (status: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm(`Supprimer le statut "${status}" ?`)) {
      storageService.deleteStatus(status);
      setStatusesList(storageService.getStatuses());
    }
  };

  const handleMoveStatusUp = (index: number, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (index <= 0) return;
    const newList = [...statusesList];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    storageService.reorderStatuses(newList);
    setStatusesList(storageService.getStatuses());
  };

  const handleMoveStatusDown = (index: number, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (index >= statusesList.length - 1) return;
    const newList = [...statusesList];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    storageService.reorderStatuses(newList);
    setStatusesList(storageService.getStatuses());
  };

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    storageService.addContactType(newTypeName.trim());
    setNewTypeName('');
    setTypesList(storageService.getContactTypes());
  };

  const handleDeleteType = (type: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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

  const handleDeleteRole = (role: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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

  const handleStartEditRole = (role: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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
    registerUser(newUsername.trim(), newRole, newEmail.trim() || undefined, undefined, false);

    if (newEmail.trim()) {
      const inviteSubject = `Invitation au CRM Space Fun Games & Share & Fun`;
      const inviteBody = `Bonjour ${newUsername.trim()},\n\nVous avez été invité(e) à rejoindre le CRM de l'établissement Space Fun Games & Share & Fun en tant que ${newRole === 'directrice' ? 'Directrice' : newRole === 'admin' ? 'Administrateur' : newRole === 'user' ? 'Collaborateur' : newRole}.\n\nAccédez au CRM en ligne ici : https://spacefungame.github.io/sfg-crm/\n\nIdentifiant : ${newUsername.trim()}\n\nLors de votre première connexion sur le site, cliquez sur votre profil et vous pourrez définir et enregistrer vous-même votre mot de passe personnel.\n\nÀ très bientôt,\nL'équipe`;
      storageService.dispatchEmail(newEmail.trim(), inviteSubject, inviteBody, inviteProvider);
    }

    setNewUsername('');
    setNewEmail('');
    refreshUsers();
  };

  const handleDeleteUser = (userToDelete: User, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* En-tête des paramètres */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={18} style={{ color: 'var(--primary)' }} />
            Paramètres & Personnalisation du CRM
          </h2>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Gérez vos tags, vos statuts, vos types de contacts, et l'équipe des collaborateurs.
          </p>
        </div>

        {/* Navigation sous-onglets */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveSection('tags')}
            className={`btn btn-sm ${activeSection === 'tags' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '4px 8px', fontSize: '11px' }}
          >
            <Bookmark size={13} />
            Tags ({tagsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('statuses')}
            className={`btn btn-sm ${activeSection === 'statuses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '4px 8px', fontSize: '11px' }}
          >
            <CheckCircle2 size={13} />
            Statuts ({statusesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('types')}
            className={`btn btn-sm ${activeSection === 'types' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '4px 8px', fontSize: '11px' }}
          >
            <TagIcon size={13} />
            Types ({typesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('roles')}
            className={`btn btn-sm ${activeSection === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '4px 8px', fontSize: '11px' }}
          >
            <Crown size={13} />
            Rôles ({rolesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('users')}
            className={`btn btn-sm ${activeSection === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '4px 8px', fontSize: '11px' }}
          >
            <Users size={13} />
            Équipe ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('templates')}
            className={`btn btn-sm ${activeSection === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '4px 8px', fontSize: '11px' }}
          >
            <Mail size={13} />
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
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}>
                  {editingTagId ? 'Enregistrer' : '+ Ajouter le Tag'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={15} style={{ color: 'var(--primary)' }} />
              Tags disponibles ({tagsList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tagsList.map((tag) => (
                <div
                  key={tag.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--surface-warm)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: tag.color || '#8B5A2B',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '11.5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🏷️ {tag.name}
                    </span>
                    {tag.description && (
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        — {tag.description}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleStartEditTag(tag, e)}
                      className="btn-icon"
                      style={{ border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
                      title="Modifier"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTag(tag.id, e)}
                      className="btn-icon"
                      style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E', padding: '4px' }}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {tagsList.length === 0 && (
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Aucun tag créé. Créez votre premier tag ci-contre pour catégoriser vos clients !
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: STATUTS */}
      {activeSection === 'statuses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} style={{ color: 'var(--primary)' }} />
              Ajouter un statut personnalisé
            </h3>
            <form onSubmit={handleAddStatus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du statut *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: En attente de signature, Contrat validé..."
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  style={{ fontSize: '12px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '12px' }}>
                + Ajouter le Statut
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Statuts du cycle de vente ({statusesList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {statusesList.map((st, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDraggedStatusIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedStatusIdx !== null && draggedStatusIdx !== idx) {
                      const newList = [...statusesList];
                      const [removed] = newList.splice(draggedStatusIdx, 1);
                      newList.splice(idx, 0, removed);
                      storageService.reorderStatuses(newList);
                      setStatusesList(storageService.getStatuses());
                    }
                    setDraggedStatusIdx(null);
                  }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: draggedStatusIdx === idx ? 'var(--primary-light)' : 'var(--surface-warm)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'grab',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span title="Glisser-déposer pour déplacer" style={{ display: 'flex', alignItems: 'center' }}>
                      <GripVertical size={14} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                    </span>
                    <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                    {st}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleMoveStatusUp(idx, e)}
                      disabled={idx === 0}
                      className="btn-icon"
                      style={{ border: 'none', background: idx === 0 ? 'var(--surface-warm)' : 'var(--surface)', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? 'var(--border)' : 'var(--primary)', padding: '4px' }}
                      title="Monter ce statut vers le début"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleMoveStatusDown(idx, e)}
                      disabled={idx === statusesList.length - 1}
                      className="btn-icon"
                      style={{ border: 'none', background: idx === statusesList.length - 1 ? 'var(--surface-warm)' : 'var(--surface)', cursor: idx === statusesList.length - 1 ? 'not-allowed' : 'pointer', color: idx === statusesList.length - 1 ? 'var(--border)' : 'var(--primary)', padding: '4px' }}
                      title="Descendre ce statut vers la fin"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteStatus(st, e)}
                      className="btn-icon"
                      style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E', padding: '4px' }}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: TYPES DE CONTACTS */}
      {activeSection === 'types' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} style={{ color: 'var(--primary)' }} />
              Ajouter un type de contact
            </h3>
            <form onSubmit={handleAddType} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du type *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Partenaire, Comité d'entreprise (CE)..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  style={{ fontSize: '12px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '12px' }}>
                + Ajouter le Type
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Types de contacts ({typesList.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {typesList.map((tp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: 'var(--surface-warm)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    fontSize: '11.5px',
                    color: 'var(--text-main)'
                  }}
                >
                  <span>{tp}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteType(tp, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C81E1E', display: 'flex', padding: '2px' }}
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 4: RÔLES DE COLLABORATEURS */}
      {activeSection === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} style={{ color: 'var(--primary)' }} />
              Ajouter un rôle
            </h3>
            <form onSubmit={handleAddRole} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nom du rôle *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Stagiaire, Responsable Événements..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  style={{ fontSize: '12px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '12px' }}>
                + Ajouter le Rôle
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Rôles existants ({rolesList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {rolesList.map((role, idx) => {
                const isDir = role === 'directrice';
                const isEditing = editingRoleOldName === role;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isDir ? '#FEF3C7' : 'var(--surface-warm)',
                      borderRadius: 'var(--radius-md)',
                      border: isDir ? '1px solid #F59E0B' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    {isEditing ? (
                      <form onSubmit={handleSaveEditRole} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <input
                          type="text"
                          className="input-field"
                          value={newRoleEditName}
                          onChange={(e) => setNewRoleEditName(e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          required
                          autoFocus
                        />
                        <button type="submit" className="btn btn-primary btn-sm" title="Enregistrer" style={{ padding: '4px 8px' }}>
                          <Check size={13} />
                        </button>
                        <button type="button" onClick={() => setEditingRoleOldName(null)} className="btn btn-secondary btn-sm" title="Annuler" style={{ padding: '4px 8px' }}>
                          <X size={13} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: isDir ? '#D97706' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isDir ? <Crown size={14} /> : <Shield size={14} style={{ color: 'var(--primary)' }} />}
                          <span>
                            {role === 'directrice' ? 'Directrice' : role === 'admin' ? 'Administrateur' : role === 'user' ? 'Collaborateur' : role}
                          </span>
                          {isDir && <span className="badge" style={{ backgroundColor: '#D97706', color: '#FFF', fontSize: '9.5px', padding: '1px 5px' }}>Système</span>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleStartEditRole(role, e)}
                            className="btn-icon"
                            style={{ border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-main)', padding: '4px' }}
                            title="Renommer ce rôle"
                          >
                            <Edit3 size={13} />
                          </button>
                          {!isDir && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteRole(role, e)}
                              className="btn-icon"
                              style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E', padding: '4px' }}
                              title="Supprimer ce rôle"
                            >
                              <Trash2 size={13} />
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} style={{ color: 'var(--primary)' }} />
              Inviter / Créer un profil
            </h3>
            <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Prénom & Nom *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Julie Martin"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ fontSize: '12px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  E-mail du collaborateur
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Ex: julie@spacefungames.fr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Rôle au sein du CRM
                </label>
                <select
                  className="input-field"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ fontSize: '12px' }}
                >
                  {storageService.getRoles().map((r) => (
                    <option key={r} value={r}>
                      {r === 'directrice' ? 'Directrice' : r === 'admin' ? 'Administrateur' : r === 'user' ? 'Collaborateur' : r}
                    </option>
                  ))}
                </select>
              </div>

              <EmailProviderSelector value={inviteProvider} onChange={setInviteProvider} compact />

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '12px' }}>
                Créer profil & Inviter
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Membres de l'équipe ({users.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {users.map((u) => {
                const isDir = u.role === 'directrice';
                const isMe = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isMe ? 'var(--primary-light)' : 'var(--surface-warm)',
                      borderRadius: 'var(--radius-md)',
                      border: isDir ? '1px solid #F59E0B' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isDir ? '#FEF3C7' : 'var(--surface)',
                        color: isDir ? '#D97706' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: '1px solid var(--border)'
                      }}>
                        {isDir ? <Crown size={15} /> : u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {u.username}
                          {isMe && <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#FFF', fontSize: '9.5px', padding: '1px 5px' }}>Vous</span>}
                          {u.role === 'admin' && <span title="Administrateur" style={{ display: 'inline-flex' }}><Shield size={12} style={{ color: 'var(--accent)' }} /></span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                padding: '1px 4px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                fontWeight: 600,
                                fontSize: '11px',
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
                          {u.email && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Mail size={11} /> {u.email}</span>}
                          {u.password ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.7 }}><Lock size={11} /> Sécurisé</span>
                              {!isDir && !isMe && (currentUser?.role === 'directrice' || currentUser?.role === 'admin') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Réinitialiser le mot de passe de ${u.username} ? À sa prochaine connexion, le collaborateur devra choisir un nouveau mot de passe.`)) {
                                      u.password = undefined;
                                      storageService.saveUser(u);
                                      refreshUsers();
                                    }
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '10.5px', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                                  title="Réinitialiser pour que le collaborateur crée un nouveau mot de passe à sa prochaine connexion"
                                >
                                  <KeyRound size={11} /> Réinitialiser mdp
                                </button>
                              )}
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontWeight: 600, fontSize: '11px' }}>
                              <KeyRound size={12} /> En attente de 1ère connexion (créera son mdp)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteUser(u, e)}
                        className="btn-icon"
                        style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E', padding: '4px' }}
                        title="Supprimer ce compte"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Section 6: MODÈLES D'E-MAILS */}
      {activeSection === 'templates' && (
        <div className="animate-fade-in">
          <TemplatesManager onTemplatesChanged={() => {}} />
        </div>
      )}

    </div>
  );
};
