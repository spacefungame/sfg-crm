import React, { useState } from 'react';
import type { EmailTemplate } from '../types/crm';
import { storageService } from '../services/storageService';
import { Mail, Plus, Edit, Trash2, Save, X, Sparkles } from 'lucide-react';

interface TemplatesManagerProps {
  onTemplatesChanged: () => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({ onTemplatesChanged }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(storageService.getEmailTemplates());
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateNew = () => {
    setEditingTemplate({
      id: 'tpl-' + Date.now(),
      title: 'Nouveau modèle d\'e-mail',
      subject: 'Sujet de votre message pour {Société}',
      body: 'Bonjour {Prénom},\n\n\n\nCordialement,\nL\'équipe Space Fun Games & Share & Fun'
    });
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.title.trim()) return;

    storageService.saveEmailTemplate(editingTemplate);
    setTemplates(storageService.getEmailTemplates());
    setEditingTemplate(null);
    setIsCreating(false);
    onTemplatesChanged();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${title}" ?`)) {
      storageService.deleteEmailTemplate(id);
      setTemplates(storageService.getEmailTemplates());
      if (editingTemplate?.id === id) setEditingTemplate(null);
      onTemplatesChanged();
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editingTemplate ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* Liste des templates */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={20} style={{ color: 'var(--primary)' }} />
              Modèles d'e-mails pour l'équipe
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Préparez vos messages types pour envoyer des devis, présentations et relances en 1 clic
            </p>
          </div>

          {!editingTemplate && (
            <button onClick={handleCreateNew} className="btn btn-primary btn-sm">
              <Plus size={16} />
              + Nouveau modèle
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {templates.map((tpl) => {
            const isSelected = editingTemplate?.id === tpl.id;
            return (
              <div
                key={tpl.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {tpl.title}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      <strong>Sujet :</strong> {tpl.subject}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setIsCreating(false);
                      }}
                      className="btn btn-secondary btn-icon"
                      title="Modifier ce modèle"
                      style={{ padding: '6px' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id, tpl.title)}
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '6px', color: '#C81E1E' }}
                      title="Supprimer ce modèle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #ECE7DE', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                  {tpl.body}
                </div>
              </div>
            );
          })}
        </div>
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
                Titre du modèle (en interne pour l'équipe) *
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Corps du message *
                </label>
              </div>
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
