import React, { useState, useEffect } from 'react';
import type { Contact, ContactStatus, Establishment, EmailTemplate, TagDefinition } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Building2, Clock, X, Save, Plus, Trash2, Rocket, Dices, Sparkles, Send, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';

interface ContactCardModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onInitiateCall: (contact: Contact) => void;
  onInitiateMail: (contact: Contact, template?: EmailTemplate) => void;
}

export const ContactCardModal: React.FC<ContactCardModalProps> = ({
  contact,
  isOpen,
  onClose,
  onUpdate,
  onInitiateCall,
  onInitiateMail
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<Contact | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tagsList, setTagsList] = useState<TagDefinition[]>(storageService.getTags());
  const [showTagManager, setShowTagManager] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<string>('#8D5B4C');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState<string>('');
  const [editingTagColor, setEditingTagColor] = useState<string>('#8D5B4C');

  const [contactTypesList, setContactTypesList] = useState<string[]>(storageService.getContactTypes());
  const [showTypeManager, setShowTypeManager] = useState<boolean>(false);
  const [newContactTypeName, setNewContactTypeName] = useState<string>('');
  const [editingOldTypeName, setEditingOldTypeName] = useState<string | null>(null);
  const [editingNewTypeName, setEditingNewTypeName] = useState<string>('');

  const emailTemplates = storageService.getEmailTemplates();

  const statuses = storageService.getStatuses();

  const handleToggleTag = (tagName: string) => {
    if (!formData) return;
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    const updated = { ...formData, tags: newTags };
    setFormData(updated);
    storageService.saveContact(updated);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `${currentTags.includes(tagName) ? 'Tag retiré' : 'Tag ajouté'} : ${tagName}`
    });
    onUpdate();
  };

  const handleCreateAndAssignTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !formData) return;
    
    const tagName = newTagName.trim();
    let tagObj = tagsList.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (!tagObj) {
      tagObj = {
        id: 'tag-' + Date.now(),
        name: tagName,
        color: newTagColor
      };
      storageService.saveTag(tagObj);
    }

    const currentTags = formData.tags || [];
    if (!currentTags.includes(tagObj.name)) {
      const updated = { ...formData, tags: [...currentTags, tagObj.name] };
      setFormData(updated);
      storageService.saveContact(updated);
      storageService.addActivityLog(formData.id, {
        employeeName: currentUser ? currentUser.username : 'Collaborateur',
        actionType: 'status_change',
        summary: `Tag créé et attribué : ${tagObj.name}`
      });
    }

    setTagsList(storageService.getTags());
    setNewTagName('');
    onUpdate();
  };

  const handleUpdateTag = (tagId: string, oldName: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTagName.trim() || !formData) return;

    const newName = editingTagName.trim();
    storageService.saveTag({
      id: tagId,
      name: newName,
      color: editingTagColor
    });

    if (formData.tags && formData.tags.includes(oldName)) {
      setFormData({
        ...formData,
        tags: formData.tags.map(t => t === oldName ? newName : t)
      });
    }

    setTagsList(storageService.getTags());
    setEditingTagId(null);
    onUpdate();
  };

  const handleDeleteTagModal = (tagId: string, tagName: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm(`Confirmez-vous la suppression du tag "${tagName}" ? Il sera retiré de tous les contacts.`)) {
      storageService.deleteTag(tagId);
      if (formData && formData.tags && formData.tags.includes(tagName)) {
        const updated = { ...formData, tags: formData.tags.filter(t => t !== tagName) };
        setFormData(updated);
        storageService.saveContact(updated);
      }
      setTagsList(storageService.getTags());
      onUpdate();
    }
  };

  const handleToggleContactType = (typeName: string) => {
    if (!formData) return;
    const currentTypes = (formData.type || '').split(',').map(t => t.trim()).filter(Boolean);
    const newTypes = currentTypes.includes(typeName)
      ? currentTypes.filter(t => t !== typeName)
      : [...currentTypes, typeName];
    
    const finalTypeString = newTypes.length > 0 ? newTypes.join(', ') : 'Autre';
    const updated = { ...formData, type: finalTypeString };
    setFormData(updated);
    storageService.saveContact(updated);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `${currentTypes.includes(typeName) ? 'Type retiré' : 'Type ajouté'} : ${typeName}`
    });
    onUpdate();
  };

  const handleCreateAndAssignContactType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactTypeName.trim() || !formData) return;
    
    const typeName = newContactTypeName.trim();
    storageService.addContactType(typeName);

    const currentTypes = (formData.type || '').split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTypes.includes(typeName)) {
      const updatedTypes = [...currentTypes, typeName];
      const updated = { ...formData, type: updatedTypes.join(', ') };
      setFormData(updated);
      storageService.saveContact(updated);
      storageService.addActivityLog(formData.id, {
        employeeName: currentUser ? currentUser.username : 'Collaborateur',
        actionType: 'status_change',
        summary: `Type créé et attribué : ${typeName}`
      });
    }

    setContactTypesList(storageService.getContactTypes());
    setNewContactTypeName('');
    onUpdate();
  };

  const handleUpdateContactType = (oldType: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNewTypeName.trim() || !formData) return;

    const newType = editingNewTypeName.trim();
    storageService.updateContactType(oldType, newType);

    const currentTypes = (formData.type || '').split(',').map(t => t.trim()).filter(Boolean);
    if (currentTypes.includes(oldType)) {
      const updatedTypes = currentTypes.map(t => t === oldType ? newType : t);
      setFormData({
        ...formData,
        type: updatedTypes.join(', ')
      });
    }

    setContactTypesList(storageService.getContactTypes());
    setEditingOldTypeName(null);
    onUpdate();
  };

  const handleDeleteContactTypeModal = (typeName: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm(`Confirmez-vous la suppression du type "${typeName}" ? Il sera retiré de la liste du CRM.`)) {
      storageService.deleteContactType(typeName);
      const currentTypes = (formData?.type || '').split(',').map(t => t.trim()).filter(Boolean);
      if (formData && currentTypes.includes(typeName)) {
        const filtered = currentTypes.filter(t => t !== typeName);
        const updated = { ...formData, type: filtered.length > 0 ? filtered.join(', ') : 'Autre' };
        setFormData(updated);
        storageService.saveContact(updated);
      }
      setContactTypesList(storageService.getContactTypes());
      onUpdate();
    }
  };

  useEffect(() => {
    if (contact) {
      setFormData(JSON.parse(JSON.stringify(contact)));
      setIsEditing(false);
      setShowTemplateSelector(false);
      setTagsList(storageService.getTags());
      setShowTagManager(false);
      setEditingTagId(null);
      setContactTypesList(storageService.getContactTypes());
      setShowTypeManager(false);
      setEditingOldTypeName(null);
    }
  }, [contact]);

  if (!isOpen || !formData || !contact) return null;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveContact(formData);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'note',
      summary: 'Mise à jour manuelle des informations de la fiche contact.'
    });
    setIsEditing(false);
    onUpdate();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'note',
      summary: newNoteInput.trim()
    });
    
    // Refresh local contact state from DB
    const refreshed = storageService.getContactById(formData.id);
    if (refreshed) setFormData(JSON.parse(JSON.stringify(refreshed)));
    setNewNoteInput('');
    onUpdate();
  };

  const handleStatusOrDeadlineChange = (newStatus: ContactStatus | string, newDeadline?: string) => {
    const updated = { ...formData, status: newStatus as ContactStatus, deadline: newDeadline || undefined };
    setFormData(updated);
    storageService.saveContact(updated);
    storageService.addActivityLog(formData.id, {
      employeeName: currentUser ? currentUser.username : 'Collaborateur',
      actionType: 'status_change',
      summary: `Statut/Dead line mis à jour : ${newStatus} ${newDeadline ? `(Dead line : ${newDeadline})` : ''}`,
      newStatus,
      deadline: newDeadline
    });
    onUpdate();
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la fiche de ${formData.firstName} ${formData.lastName} ?`)) {
      storageService.deleteContact(formData.id);
      onUpdate();
      onClose();
    }
  };

  const getEstablishmentBadge = (est: Establishment) => {
    if (est === 'space_fun_games') {
      return <span className="badge badge-establishment-space" style={{ fontSize: '10.5px', padding: '2px 6px' }}><Rocket size={12} /> Space Fun Games</span>;
    } else if (est === 'share_and_fun') {
      return <span className="badge badge-establishment-share" style={{ fontSize: '10.5px', padding: '2px 6px' }}><Dices size={12} /> Share & Fun</span>;
    } else {
      return <span className="badge badge-establishment-both" style={{ fontSize: '10.5px', padding: '2px 6px' }}><Sparkles size={12} /> Les deux</span>;
    }
  };

  const getTagBadge = (tagName: string) => {
    const found = tagsList.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    const bg = found?.color || '#8B5A2B';
    return (
      <span key={tagName} style={{ backgroundColor: bg, color: '#FFF', fontSize: '10.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        🏷️ {tagName}
      </span>
    );
  };

  return (
    <div className="overlay-backdrop animate-fade-in" onClick={onClose} style={{ padding: isFullscreen ? '0' : undefined }}>
      <div
        className="card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isFullscreen ? '100vw' : '100%',
          maxWidth: isFullscreen ? '100vw' : '880px',
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '92vh',
          borderRadius: isFullscreen ? '0' : 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          backgroundColor: 'var(--surface)',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {/* Top Header Bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface-warm)', gap: '10px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
              {getEstablishmentBadge(formData.establishment)}
              {(formData.type || '').split(',').map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  📇 {t}
                </span>
              ))}
              {formData.tags && formData.tags.map(t => getTagBadge(t))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {formData.lastName} {formData.firstName}
              </h3>
              {formData.company && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={13} />
                  {formData.company}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 8px', fontSize: '11.5px' }}
            >
              {isEditing ? 'Annuler l\'édition' : '✏️ Modifier fiches'}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-secondary btn-icon"
              style={{ border: 'none', padding: '4px', cursor: 'pointer' }}
              title={isFullscreen ? "Réduire (quitter le plein écran)" : "Agrandir en plein écran"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none', padding: '4px', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Button Bar (Call & Email with Templates) */}
        <div style={{ padding: '8px 16px', backgroundColor: '#F9F7F2', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onInitiateCall(formData)}
              className="btn btn-primary"
              style={{ flex: 1, padding: '7px 14px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#1C7D4A' }}
              disabled={!formData.phone}
            >
              <Phone size={15} />
              Appeler le {formData.phone || '(sans numéro)'}
            </button>

            <button
              type="button"
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="btn btn-primary"
              style={{ flex: 1, padding: '7px 14px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#533B82' }}
              disabled={!formData.email}
            >
              <Mail size={15} />
              Envoyer un E-mail
            </button>
          </div>

          {showTemplateSelector && (
            <div className="animate-fade-in" style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #D8CEEA', boxShadow: 'var(--shadow-sm)' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#4A306D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Send size={14} />
                Choisissez un template :
              </h5>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                <button
                  type="button"
                  onClick={() => { setShowTemplateSelector(false); onInitiateMail(formData); }}
                  style={{ padding: '7px 10px', textAlign: 'left', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}
                >
                  ✉️ E-mail vierge
                </button>
                {emailTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => { setShowTemplateSelector(false); onInitiateMail(formData, tpl); }}
                    style={{ padding: '7px 10px', textAlign: 'left', borderRadius: 'var(--radius-sm)', border: '1px solid #E3D9F2', backgroundColor: '#FAF7FF', color: '#3B235E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '6px', backgroundColor: '#EFEBF6', color: '#533B82' }}>
                          {tpl.category || 'Général'}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '12.5px' }}>{tpl.title}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#7E699B' }}>Sujet : {tpl.subject}</div>
                    </div>
                    {tpl.shortcut && (
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', backgroundColor: '#FFF4E5', color: '#B76E00', border: '1px solid #FFE2B7', flexShrink: 0 }}>
                        ⚡ {tpl.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Statut actuel</label>
              <select value={formData.status} onChange={(e) => handleStatusOrDeadlineChange(e.target.value, formData.deadline)} className="input-field" style={{ padding: '5px 8px', fontSize: '12.5px', height: 'auto' }}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Dead line</label>
              <input type="date" className="input-field" value={formData.deadline || ''} onChange={(e) => handleStatusOrDeadlineChange(formData.status, e.target.value)} style={{ padding: '5px 8px', fontSize: '12.5px', height: 'auto' }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>📇 Type(s) du contact (cliquez pour en attribuer un ou plusieurs) :</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTypeManager(!showTypeManager)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-focus)', color: 'var(--primary)', fontWeight: 600 }}
                title="Créer, modifier ou supprimer des types de client directement depuis la fiche"
              >
                <span>{showTypeManager ? '✕ Fermer gestion' : '⚙️ Modifier / Créer des types'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {contactTypesList.map(type => {
                const currentTypes = (formData.type || '').split(',').map(t => t.trim()).filter(Boolean);
                const isSelected = currentTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleContactType(type)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '2px solid #2A211D' : '1px dashed var(--border)',
                      backgroundColor: isSelected ? '#E6D7C3' : 'transparent',
                      color: isSelected ? '#2A211D' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            {showTypeManager && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {/* Formulaire de création rapide de type */}
                <form onSubmit={handleCreateAndAssignContactType} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} style={{ color: 'var(--primary)' }} /> Nouveau type de client :
                  </span>
                  <input
                    type="text"
                    placeholder="Nom du type (ex: Mairie, Club)..."
                    className="input-field"
                    value={newContactTypeName}
                    onChange={(e) => setNewContactTypeName(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11.5px', height: 'auto', width: '180px' }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
                    Créer & Attribuer
                  </button>
                </form>

                {/* Liste des types existants pour modification / suppression */}
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  ⚙️ Modifier le nom ou supprimer un type de client :
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {contactTypesList.map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: 'var(--surface)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      {editingOldTypeName === t ? (
                        <form onSubmit={(e) => handleUpdateContactType(t, e)} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                          <input
                            type="text"
                            required
                            className="input-field"
                            value={editingNewTypeName}
                            onChange={(e) => setEditingNewTypeName(e.target.value)}
                            style={{ padding: '3px 6px', fontSize: '11px', height: 'auto', flex: 1 }}
                          />
                          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }} title="Enregistrer le nom">
                            <Save size={12} />
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingOldTypeName(null)} style={{ padding: '3px 8px', fontSize: '11px' }} title="Annuler">
                            ✕
                          </button>
                        </form>
                      ) : (
                        <>
                          <span style={{ fontSize: '11.5px', fontWeight: 600 }}>📇 {t}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => { setEditingOldTypeName(t); setEditingNewTypeName(t); }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '10.5px' }}
                              title="Renommer ce type de client"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteContactTypeModal(t, e)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '10.5px', color: '#C81E1E', borderColor: '#F8B4B4', backgroundColor: '#FDE8E8' }}
                              title="Supprimer ce type"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>🏷️ Tags attribués au contact (cliquez pour ajouter / retirer) :</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTagManager(!showTagManager)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-focus)', color: 'var(--primary)', fontWeight: 600 }}
                title="Créer un nouveau tag ou modifier/supprimer des tags existants directement depuis la fiche"
              >
                <span>{showTagManager ? '✕ Fermer gestion' : '⚙️ Modifier / Créer des tags'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tagsList.map(tag => {
                const isSelected = (formData.tags || []).includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.name)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '2px solid #2A211D' : '1px dashed var(--border)',
                      backgroundColor: isSelected ? tag.color : 'transparent',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{tag.name}</span>
                  </button>
                );
              })}
            </div>

            {showTagManager && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {/* Formulaire de création rapide */}
                <form onSubmit={handleCreateAndAssignTag} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} style={{ color: 'var(--primary)' }} /> Nouveau tag :
                  </span>
                  <input
                    type="text"
                    placeholder="Nom du tag (ex: VIP)..."
                    className="input-field"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11.5px', height: 'auto', width: '150px' }}
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    style={{ width: '30px', height: '26px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    title="Choisir la couleur"
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
                    Créer & Attribuer
                  </button>
                </form>

                {/* Liste des tags existants pour modification / suppression */}
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  ⚙️ Modifier le nom, la couleur ou supprimer un tag :
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {tagsList.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: 'var(--surface)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      {editingTagId === t.id ? (
                        <form onSubmit={(e) => handleUpdateTag(t.id, t.name, e)} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                          <input
                            type="text"
                            required
                            className="input-field"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            style={{ padding: '3px 6px', fontSize: '11px', height: 'auto', flex: 1 }}
                          />
                          <input
                            type="color"
                            value={editingTagColor}
                            onChange={(e) => setEditingTagColor(e.target.value)}
                            style={{ width: '26px', height: '22px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                          />
                          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }} title="Enregistrer les modifications">
                            <Save size={12} />
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingTagId(null)} style={{ padding: '3px 8px', fontSize: '11px' }} title="Annuler">
                            ✕
                          </button>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: t.color, display: 'inline-block' }} />
                            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{t.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => { setEditingTagId(t.id); setEditingTagName(t.name); setEditingTagColor(t.color || '#8D5B4C'); }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '10.5px' }}
                              title="Renommer / Changer couleur"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTagModal(t.id || t.name, t.name, e)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '10.5px', color: '#C81E1E', borderColor: '#F8B4B4', backgroundColor: '#FDE8E8' }}
                              title="Supprimer ce tag du CRM"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FFFDF9', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>Nom / Patronyme *</label>
                  <input type="text" className="input-field" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={{ padding: '5px 8px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>Prénom</label>
                  <input type="text" className="input-field" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={{ padding: '5px 8px', fontSize: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>Téléphone</label>
                  <input type="text" className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '5px 8px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>E-mail</label>
                  <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '5px 8px', fontSize: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>Société / Organisation</label>
                  <input type="text" className="input-field" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={{ padding: '5px 8px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Type(s) de contact (plusieurs possibles)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '6px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', maxHeight: '90px', overflowY: 'auto' }}>
                    {contactTypesList.map(t => {
                      const currentTypes = (formData.type || '').split(',').map(item => item.trim()).filter(Boolean);
                      const isChecked = currentTypes.includes(t);
                      return (
                        <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: isChecked ? 600 : 400, cursor: 'pointer', backgroundColor: isChecked ? '#F3ECE4' : 'transparent', padding: '2px 6px', borderRadius: '4px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const newTypes = isChecked
                                ? currentTypes.filter(item => item !== t)
                                : [...currentTypes, t];
                              setFormData({ ...formData, type: newTypes.length > 0 ? newTypes.join(', ') : 'Autre' });
                            }}
                            style={{ margin: 0 }}
                          />
                          {t}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>Établissement</label>
                <select className="input-field" value={formData.establishment} onChange={(e) => setFormData({ ...formData, establishment: e.target.value as Establishment })} style={{ padding: '5px 8px', fontSize: '12px' }}>
                  <option value="space_fun_games">🚀 Space Fun Games</option>
                  <option value="share_and_fun">🎲 Share & Fun</option>
                  <option value="les_deux">🌟 Les deux</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '3px' }}>Notes générales</label>
                <textarea rows={2} className="input-field" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ padding: '5px 8px', fontSize: '12px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary btn-sm"><Save size={14} /> Enregistrer</button>
              </div>
            </form>
          ) : (
            formData.notes && (
              <div style={{ backgroundColor: 'var(--surface-warm)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>📝 Notes sur le client :</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{formData.notes}</div>
              </div>
            )
          )}

          {/* Add Note / Quick Log input */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MessageSquare size={15} />
              Ajouter une note ou un compte-rendu rapide
            </h4>
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Le client confirme qu'il viendra en septembre, rappeler le 20 août..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!newNoteInput.trim()} style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Plus size={14} />
                Ajouter
              </button>
            </form>
          </div>

          {/* History Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Notes Section */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MessageSquare size={15} />
                Suivi des notes ({formData.logs ? formData.logs.filter(l => l.actionType === 'note').length : 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.logs && formData.logs.filter(l => l.actionType === 'note').map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #ECE7DE',
                      backgroundColor: 'var(--surface-warm)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '11.5px', color: 'var(--primary)' }}>
                          👤 {log.employeeName}
                        </span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-light)', fontWeight: 500 }}>
                        {new Date(log.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.35 }}>
                      {log.summary}
                    </div>
                  </div>
                ))}
                {(!formData.logs || formData.logs.filter(l => l.actionType === 'note').length === 0) && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>Aucune note pour le moment.</div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={15} />
                Historique des actions ({formData.logs ? formData.logs.filter(l => l.actionType !== 'note').length : 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.logs && formData.logs.filter(l => l.actionType !== 'note').map((log) => {
                  const isMail = log.actionType === 'mail';
                  const isCall = log.actionType === 'call';

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #ECE7DE',
                        backgroundColor: isMail ? '#FAF7FF' : isCall ? '#F4FAF6' : 'var(--surface)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '11.5px', color: 'var(--primary)' }}>
                            👤 {log.employeeName}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            • {log.actionType === 'call' ? '📞 Appel' : log.actionType === 'mail' ? '✉️ Courriel' : log.actionType === 'status_change' ? '🔄 Statut' : '📥 Import'}
                          </span>
                        </div>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-light)', fontWeight: 500 }}>
                          {new Date(log.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.35 }}>
                        {log.summary}
                      </div>

                      {log.newStatus && (
                        <div style={{ marginTop: '4px', fontSize: '11px', display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Nouveau statut :</span>
                          <span style={{ fontWeight: 600 }}>{log.newStatus}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!formData.logs || formData.logs.filter(l => l.actionType !== 'note').length === 0) && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>Aucune action pour le moment.</div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Delete option */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-warm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary btn-sm"
            style={{ color: '#C81E1E', borderColor: '#FBD5D5', backgroundColor: '#FDE8E8', padding: '5px 10px', fontSize: '11.5px' }}
          >
            <Trash2 size={13} />
            Supprimer ce client
          </button>

          <button type="button" onClick={onClose} className="btn btn-primary btn-sm" style={{ padding: '5px 12px', fontSize: '11.5px' }}>
            Fermer la fiche
          </button>
        </div>

      </div>
    </div>
  );
};
