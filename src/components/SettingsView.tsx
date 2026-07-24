import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import type { TagDefinition, User } from '../types/crm';
import { Settings, Bookmark, CheckCircle2, Tag as TagIcon, Users, Plus, Trash2, Edit3, Check, Mail, Shield, Crown, X, ArrowUp, ArrowDown, GripVertical, UserCheck, KeyRound } from 'lucide-react';
import { TemplatesManager } from './TemplatesManager';


export const SettingsView: React.FC = () => {
  const { users, currentUser, refreshUsers } = useAuth();
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
    const [authEmailsList, setAuthEmailsList] = useState<string[]>(storageService.getAuthorizedEmails());
  const [newAuthEmail, setNewAuthEmail] = useState<string>('');

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
    if (role?.toLowerCase() === 'coo') {
      alert("Le rôle COO ne peut pas être supprimé car c'est le rôle principal du système.");
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

  const handleAddAuthEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthEmail.trim()) return;
    storageService.addAuthorizedEmail(newAuthEmail.trim());
    setNewAuthEmail('');
    setAuthEmailsList(storageService.getAuthorizedEmails());
  };

  const handleRemoveAuthEmail = (email: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm(`Voulez-vous vraiment retirer l'autorisation pour ${email} ?`)) {
      storageService.removeAuthorizedEmail(email);
      setAuthEmailsList(storageService.getAuthorizedEmails());
    }
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

  const handleResetPassword = (userToReset: User, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const newPass = window.prompt(`Entrez le nouveau mot de passe pour ${userToReset.username} :`);
    if (newPass && newPass.trim() !== '') {
      storageService.saveUser({ ...userToReset, password: newPass.trim() });
      refreshUsers();
      window.alert(`Mot de passe mis à jour avec succès pour ${userToReset.username}.`);
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
                        onClick={(e) => handleDeleteTag(tag.id || tag.name, e)}
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
                    <select
                      value={storageService.getStatusCategory(st)}
                      onChange={(e) => {
                        storageService.setStatusCategory(st, e.target.value);
                        setStatusesList([...statusesList]);
                      }}
                      className="input-field"
                      style={{ padding: '2px 5px', fontSize: '11px', width: 'auto', marginRight: '8px' }}
                      title="Catégorie dans laquelle ce statut apparaîtra"
                    >
                      <option value="prospect">Prospects</option>
                      <option value="project">Projets en cours</option>
                    </select>
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
                const isDir = role?.toLowerCase() === 'coo';
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
                            {role?.toLowerCase() === 'coo' ? 'COO' : role?.toLowerCase() === 'user' ? 'Collaborateur' : role}
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
              Autoriser une adresse e-mail
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Ajoutez l'adresse e-mail d'un collaborateur pour l'autoriser à créer son compte.
            </p>
            <form onSubmit={handleAddAuthEmail} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  E-mail autorisé *
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Ex: julie@spacefungames.fr"
                  value={newAuthEmail}
                  onChange={(e) => setNewAuthEmail(e.target.value)}
                  style={{ fontSize: '12px' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '12px' }}>
                Autoriser l'adresse
              </button>
            </form>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>E-mails en attente / autorisés :</h4>
              {authEmailsList.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aucun e-mail autorisé.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {authEmailsList.map(email => (
                    <div key={email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: 'var(--surface-warm)', borderRadius: 'var(--radius-sm)', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{email}</span>
                      <button type="button" onClick={(e) => handleRemoveAuthEmail(email, e)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }} title="Retirer l'autorisation">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Membres de l'équipe ({users.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {users.map((u) => {
                const isDir = u.role?.toLowerCase() === 'coo';
                const isMe = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: isDir ? '#FEF3C7' : 'var(--surface)',
                      borderRadius: 'var(--radius-md)',
                      border: isDir ? '1px solid #F59E0B' : '1px solid var(--border)',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isDir ? '#FDE68A' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDir ? '#D97706' : 'var(--primary)' }}>
                        {isDir ? <Crown size={14} /> : u.isAdmin ? <Shield size={14} style={{ color: 'var(--accent)' }} /> : <UserCheck size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {u.username}
                          {isMe && <span style={{ fontSize: '10px', color: 'var(--primary)', marginLeft: '6px', fontWeight: 500 }}>(Moi)</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {u.loginEmail || u.email || 'Pas d\'e-mail'} • <span style={{ color: isDir ? '#D97706' : 'var(--primary)', fontWeight: 600 }}>{u.role}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {!isDir && (currentUser?.isAdmin || currentUser?.role?.toLowerCase() === 'coo') && (
                        <>
                          <select
                            className="input-field"
                            value={u.role}
                            onChange={(e) => {
                              const updatedUser = { ...u, role: e.target.value };
                              storageService.saveUser(updatedUser);
                              refreshUsers();
                            }}
                            style={{ fontSize: '11px', padding: '2px 6px', height: 'auto', minHeight: '24px' }}
                          >
                            {storageService.getRoles().map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-main)', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={!!u.isAdmin} 
                              onChange={(e) => {
                                const updatedUser = { ...u, isAdmin: e.target.checked };
                                storageService.saveUser(updatedUser);
                                refreshUsers();
                              }}
                            />
                            Admin
                          </label>
                        </>
                      )}
                      {!isDir && (currentUser?.isAdmin || currentUser?.role?.toLowerCase() === 'coo') && (
                        <button
                          type="button"
                          onClick={(e) => handleResetPassword(u, e)}
                          className="btn-icon"
                          style={{ border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
                          title="Réinitialiser le mot de passe"
                        >
                          <KeyRound size={13} />
                        </button>
                      )}
                      {!isDir && !isMe && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteUser(u, e)}
                          className="btn-icon"
                          style={{ border: 'none', background: '#FDE8E8', cursor: 'pointer', color: '#C81E1E', padding: '4px' }}
                          title="Supprimer ce profil"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
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
