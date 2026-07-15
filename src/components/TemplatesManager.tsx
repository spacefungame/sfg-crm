import React, { useState } from 'react';
import type { EmailTemplate } from '../types/crm';
import { storageService } from '../services/storageService';
import { Mail, Plus, Edit, Trash2, Save, X, Sparkles, ChevronDown, FolderPlus, Tag, Zap, Settings } from 'lucide-react';

interface TemplatesManagerProps {
  onTemplatesChanged: () => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({ onTemplatesChanged }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(storageService.getEmailTemplates());
  const [categories, setCategories] = useState<string[]>(storageService.getTemplateCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  
  // Create / Edit state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Category Manager state
  const [showCategoryManager, setShowCategoryManager] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [editingCatName, setEditingCatName] = useState<{ oldName: string; newName: string } | null>(null);

  const refreshState = () => {
    setTemplates(storageService.getEmailTemplates());
    setCategories(storageService.getTemplateCategories());
    onTemplatesChanged();
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: 'tpl-' + Date.now(),
      title: 'Nouveau modèle d\'e-mail',
      category: selectedCategory !== 'all' ? selectedCategory : (categories[0] || 'Général'),
      shortcut: '/nouveau',
      subject: 'Sujet de votre message pour {Société}',
      body: 'Bonjour {Prénom},\n\n\n\nCordialement,\nL\'équipe Space Fun Games & Share & Fun'
    });
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.title.trim()) return;

    let shortcut = editingTemplate.shortcut?.trim() || `/${editingTemplate.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`;
    if (!shortcut.startsWith('/') && !shortcut.startsWith('#')) {
      shortcut = '/' + shortcut;
    }

    const templateToSave: EmailTemplate = {
      ...editingTemplate,
      category: editingTemplate.category || 'Général',
      shortcut
    };

    storageService.saveEmailTemplate(templateToSave);
    setEditingTemplate(null);
    setIsCreating(false);
    refreshState();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${title}" ?`)) {
      storageService.deleteEmailTemplate(id);
      if (expandedTemplateId === id) setExpandedTemplateId(null);
      if (editingTemplate?.id === id) setEditingTemplate(null);
      refreshState();
    }
  };

  // --- Category Actions ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    storageService.addTemplateCategory(newCategoryInput.trim());
    setNewCategoryInput('');
    refreshState();
  };

  const handleDeleteCategory = (cat: string) => {
    if (categories.length <= 1) {
      alert("Vous devez conserver au moins une catégorie.");
      return;
    }
    if (window.confirm(`Supprimer la catégorie "${cat}" ? Les modèles associés seront déplacés.`)) {
      storageService.deleteTemplateCategory(cat);
      if (selectedCategory === cat) setSelectedCategory('all');
      refreshState();
    }
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName.trim()) {
      setEditingCatName(null);
      return;
    }
    storageService.updateTemplateCategory(oldName, newName.trim());
    setEditingCatName(null);
    if (selectedCategory === oldName) setSelectedCategory(newName.trim());
    refreshState();
  };

  const filteredTemplates = templates.filter(tpl => {
    if (selectedCategory === 'all') return true;
    return (tpl.category || 'Général') === selectedCategory;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editingTemplate ? '1fr 1fr' : '1fr', gap: '14px', alignItems: 'start' }}>
      
      {/* Liste des templates et gestionnaire */}
      <div className="card" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} style={{ color: 'var(--primary)' }} />
              Modèles d'e-mails & Raccourcis
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Cliquez sur un titre pour dérouler le contenu. Organisez vos messages types par catégorie et raccourci rapide.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              title="Gérer les catégories"
            >
              <Settings size={13} />
              {showCategoryManager ? 'Fermer catégories' : 'Gérer catégories'}
            </button>

            {!editingTemplate && (
              <button onClick={handleCreateNew} className="btn btn-primary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }}>
                <Plus size={13} />
                + Nouveau modèle
              </button>
            )}
          </div>
        </div>

        {/* Panneau Gestion des Catégories */}
        {showCategoryManager && (
          <div className="animate-fade-in" style={{ backgroundColor: 'var(--surface-warm)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={16} style={{ color: 'var(--primary)' }} />
              Catégories de modèles
            </h4>

            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Nouvelle catégorie (ex: Partenariats, Relance VIP...)"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
                <FolderPlus size={15} /> Ajouter
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((cat) => {
                const isEditing = editingCatName?.oldName === cat;
                return (
                  <div
                    key={cat}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px' }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingCatName.newName}
                        onChange={(e) => setEditingCatName({ ...editingCatName, newName: e.target.value })}
                        onBlur={() => handleRenameCategory(cat, editingCatName.newName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCategory(cat, editingCatName.newName);
                          if (e.key === 'Escape') setEditingCatName(null);
                        }}
                        style={{ width: '120px', padding: '2px 6px', border: '1px solid var(--primary)', borderRadius: '4px' }}
                      />
                    ) : (
                      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{cat}</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingCatName(isEditing ? null : { oldName: cat, newName: cat })}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Renommer"
                    >
                      <Edit size={13} />
                    </button>

                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        style={{ background: 'none', border: 'none', color: '#C81E1E', cursor: 'pointer', padding: '2px' }}
                        title="Supprimer la catégorie"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtres par catégorie */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedCategory === 'all' ? 'var(--primary)' : 'var(--surface)',
              color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            Toutes ({templates.length})
          </button>

          {categories.map((cat) => {
            const count = templates.filter(t => (t.category || 'Général') === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{cat}</span>
                <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '10px', backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#EAE4D8' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accordéon de la liste des templates */}
        {filteredTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 14px', color: 'var(--text-muted)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', fontSize: '12px' }}>
            Aucun modèle d'e-mail dans cette catégorie.
            <div style={{ marginTop: '8px' }}>
              <button onClick={handleCreateNew} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }}>
                + Créer un modèle ici
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredTemplates.map((tpl) => {
              const isExpanded = expandedTemplateId === tpl.id;
              const isSelectedEditing = editingTemplate?.id === tpl.id;

              return (
                <div
                  key={tpl.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: isSelectedEditing ? '2px solid var(--primary)' : isExpanded ? '1px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelectedEditing ? 'var(--primary-light)' : '#FFFFFF',
                    boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header / Titre cliquable pour dérouler */}
                  <div
                    onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'var(--primary-light)' : '#FFFFFF',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', backgroundColor: '#EFEBF6', color: '#533B82' }}>
                        {tpl.category || 'Général'}
                      </span>

                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                        {tpl.title}
                      </h4>

                      {tpl.shortcut && (
                        <span style={{ fontSize: '10.5px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FFF4E5', color: '#B76E00', border: '1px solid #FFE2B7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Zap size={11} /> {tpl.shortcut}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {isExpanded ? 'Réduire' : 'Dérouler'}
                      </span>
                      <ChevronDown size={15} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {/* Contenu déroulé (Sujet, Corps, Actions) */}
                  {isExpanded && (
                    <div className="animate-fade-in" style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', backgroundColor: '#FAF8F5' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          SUJET DE L'E-MAIL :
                        </span>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #ECE7DE' }}>
                          {tpl.subject}
                        </div>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          CORPS DE DU MESSAGE :
                        </span>
                        <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #ECE7DE', fontSize: '12px', color: 'var(--text-main)', whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto', lineHeight: 1.4 }}>
                          {tpl.body}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate(tpl);
                            setIsCreating(false);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          <Edit size={13} />
                          Modifier ce modèle
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tpl.id, tpl.title);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#C81E1E', padding: '3px 8px', fontSize: '11px' }}
                        >
                          <Trash2 size={13} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Éditeur de template */}
      {editingTemplate && (
        <div className="card animate-fade-in" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)' }}>
              {isCreating ? 'Créer un nouveau modèle' : 'Modifier le modèle'}
            </h3>
            <button onClick={() => setEditingTemplate(null)} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Titre du modèle (en interne) *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={editingTemplate.title}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                placeholder="Ex: Relance devis après 1 semaine"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Catégorie *
                </label>
                <select
                  className="input-field"
                  value={editingTemplate.category || 'Général'}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  style={{ fontWeight: 600 }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Raccourci (ex: /intro) *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={editingTemplate.shortcut || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, shortcut: e.target.value })}
                  placeholder="Ex: /intro, /relance, #devis"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Objet / Sujet de l'e-mail *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={editingTemplate.subject}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                placeholder="Ex: Proposition pour {Société}"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Corps du message *
              </label>
              <textarea
                rows={9}
                className="input-field"
                required
                value={editingTemplate.body}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                style={{ fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            </div>

            {/* Aide balises */}
            <div style={{ backgroundColor: 'var(--surface-warm)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                <Sparkles size={14} /> Balises dynamiques disponibles :
              </div>
              Intégrez ces mots-clés dans votre sujet ou texte pour qu'ils soient remplacés automatiquement par les infos du client :
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span style={{ backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>{"{Prénom}"}</span>
                <span style={{ backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>{"{Nom}"}</span>
                <span style={{ backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>{"{Société}"}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingTemplate(null)}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                Enregistrer le modèle
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
