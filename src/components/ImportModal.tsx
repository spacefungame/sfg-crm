import React, { useState } from 'react';
import { ImportService } from '../services/importService';
import type { ColumnMapping, ImportPreviewRow } from '../services/importService';
import type { Establishment } from '../types/crm';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Upload, FileSpreadsheet, Check, AlertCircle, Plus, ArrowRight, X } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDone?: () => void;
  onImportCompleted?: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportDone, onImportCompleted }) => {
  const { currentUser } = useAuth();
  const [, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    company: ''
  });
  
  const [selectedType, setSelectedType] = useState<string>('Entreprise');
  const [customTypeInput, setCustomTypeInput] = useState<string>('');
  const [isAddingType, setIsAddingType] = useState<boolean>(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment>('space_fun_games');
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'done'>('upload');
  const [previews, setPreviews] = useState<ImportPreviewRow[]>([]);
  const [importResult, setImportResult] = useState<{ addedCount: number; updatedCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const contactTypes = storageService.getContactTypes();
  const allTags = storageService.getTags();

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      try {
        const { headers: h, rows: r } = await ImportService.parseFile(selectedFile);
        if (h.length === 0 || r.length === 0) {
          setError('Le fichier semble vide ou illisible. Vérifiez le format (Excel .xlsx / CSV).');
          return;
        }
        setHeaders(h);
        setRawRows(r);
        const auto = ImportService.autoDetectColumns(h);
        setMapping(auto);
        setStep('mapping');
      } catch (err: any) {
        setError('Erreur lors de la lecture du fichier : ' + (err.message || String(err)));
      }
    }
  };

  const handleProceedToPreview = () => {
    if (!mapping.lastName && !mapping.firstName && !mapping.email && !mapping.phone && !mapping.company) {
      setError('Veuillez associer au moins une colonne (ex: Nom, Téléphone ou E-mail).');
      return;
    }
    setError(null);
    const p = ImportService.analyzeRows(rawRows, mapping);
    setPreviews(p);
    setStep('preview');
  };

  const handleAddCustomType = () => {
    if (customTypeInput.trim()) {
      storageService.addContactType(customTypeInput.trim());
      setSelectedType(customTypeInput.trim());
      setCustomTypeInput('');
      setIsAddingType(false);
    }
  };

  const handleConfirmImport = () => {
    const finalType = isAddingType && customTypeInput.trim() ? customTypeInput.trim() : selectedType;
    const result = ImportService.executeImport(
      previews,
      finalType,
      selectedEstablishment,
      currentUser?.username || 'Utilisateur anonyme',
      selectedTags
    );
    setImportResult(result);
    setStep('done');
    if (onImportDone) onImportDone();
    if (onImportCompleted) onImportCompleted();
  };


  return (
    <div className="overlay-backdrop animate-fade-in">
      <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Importer une liste de contacts</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Fichiers Excel (.xlsx, .xls) ou tableaux CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ backgroundColor: '#FDE8E8', color: '#C81E1E', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {step === 'upload' && (
            <div>
              <label style={{ 
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', backgroundColor: 'var(--surface-warm)', transition: 'all 0.2s ease'
              }}>
                <Upload size={38} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Cliquez ici pour choisir un fichier Excel ou CSV
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Ou glissez et déposez directement votre tableau `.xlsx` ou `.csv`
                </span>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          )}

          {step === 'mapping' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Paramètres généraux */}
              <div style={{ backgroundColor: 'var(--surface-warm)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>
                  1. Paramètres de l'import (Établissement & Type de client)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Établissement */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Établissement concerné *
                    </label>
                    <select
                      className="input-field"
                      value={selectedEstablishment}
                      onChange={(e) => setSelectedEstablishment(e.target.value as Establishment)}
                    >
                      <option value="space_fun_games">🚀 Space Fun Games</option>
                      <option value="share_and_fun">🎲 Share & Fun</option>
                      <option value="les_deux">🌟 Les deux (Space Fun Games & Share & Fun)</option>
                    </select>
                  </div>

                  {/* Type de client */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Type de contact *
                    </label>
                    {!isAddingType ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className="input-field"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          {contactTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Créer un nouveau type"
                          onClick={() => setIsAddingType(true)}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Ex: Club Sportif..."
                          value={customTypeInput}
                          onChange={(e) => setCustomTypeInput(e.target.value)}
                          autoFocus
                        />
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleAddCustomType}>
                          OK
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingType(false)}>
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags assignation */}
                <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    🏷️ Assignation automatique de Tags à tous les contacts importés (facultatif) :
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {allTags.map(tag => {
                      const isSelected = selectedTags.includes(tag.name);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedTags(isSelected ? selectedTags.filter(t => t !== tag.name) : [...selectedTags, tag.name]);
                          }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 'var(--radius-full)',
                            border: isSelected ? '2px solid #2A211D' : '1px dashed var(--border)',
                            backgroundColor: isSelected ? tag.color : 'var(--surface)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{tag.name}</span>
                        </button>
                      );
                    })}
                    {allTags.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        Aucun tag disponible. Vous pouvez en créer dans Paramètres &gt; Tags & Catégories.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mappage automatique */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                  2. Mappage des colonnes (Détecté automatiquement)
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Vérifiez que chaque information du CRM correspond à la bonne colonne de votre tableau ({headers.length} colonnes détectées).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Nom / Patronyme
                    </label>
                    <select
                      className="input-field"
                      value={mapping.lastName}
                      onChange={(e) => setMapping({ ...mapping, lastName: e.target.value })}
                    >
                      <option value="">-- Ignorer --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Prénom
                    </label>
                    <select
                      className="input-field"
                      value={mapping.firstName}
                      onChange={(e) => setMapping({ ...mapping, firstName: e.target.value })}
                    >
                      <option value="">-- Ignorer --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                      E-mail / Courriel
                    </label>
                    <select
                      className="input-field"
                      value={mapping.email}
                      onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                    >
                      <option value="">-- Ignorer --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Téléphone / GSM
                    </label>
                    <select
                      className="input-field"
                      value={mapping.phone}
                      onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                    >
                      <option value="">-- Ignorer --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Société / Nom de la structure (facultatif)
                    </label>
                    <select
                      className="input-field"
                      value={mapping.company}
                      onChange={(e) => setMapping({ ...mapping, company: e.target.value })}
                    >
                      <option value="">-- Ignorer --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                    3. Aperçu et détection des doublons ({previews.length} contacts trouvés)
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Les doublons existants dans votre base seront mis à jour/fusionnés sans créer de double fiche !
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge" style={{ backgroundColor: '#E8F5E9', color: '#1E6B34' }}>
                    ✔ {previews.filter(p => !p.isDuplicate).length} Nouveaux
                  </span>
                  <span className="badge" style={{ backgroundColor: '#FFF3E6', color: '#B86200' }}>
                    ⚡ {previews.filter(p => p.isDuplicate).length} Doublons (Fusion automatique)
                  </span>
                </div>
              </div>

              <div className="responsive-table-container" style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <table>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th>Nom / Prénom</th>
                      <th>Société</th>
                      <th>E-mail & Téléphone</th>
                      <th>Statut d'import</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previews.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>
                          {row.parsed.lastName} {row.parsed.firstName}
                        </td>
                        <td>{row.parsed.company || '-'}</td>
                        <td>
                          <div style={{ fontSize: '13px' }}>{row.parsed.email || '-'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.parsed.phone || '-'}</div>
                        </td>
                        <td>
                          {row.isDuplicate ? (
                            <span className="badge" style={{ backgroundColor: '#FFF3E6', color: '#B86200' }}>
                              ⚡ Doublon détecté (Mise à jour)
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#E8F4F8', color: '#1E6B82' }}>
                              + Nouveau (À contacter)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previews.length > 50 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                  Affichage des 50 premières lignes sur {previews.length}...
                </p>
              )}
            </div>
          )}

          {step === 'done' && importResult && (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', backgroundColor: '#E8F5E9', color: '#1E6B34', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Importation réussie !
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Votre base de données a été mise à jour avec succès sous l'établissement{' '}
                <strong>{selectedEstablishment === 'space_fun_games' ? 'Space Fun Games' : selectedEstablishment === 'share_and_fun' ? 'Share & Fun' : 'Les deux'}</strong>.
              </p>
              
              <div style={{ display: 'inline-flex', gap: '20px', backgroundColor: 'var(--surface-warm)', padding: '16px 28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>+{importResult.addedCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nouveaux contacts</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--secondary)' }}>{importResult.updatedCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Doublons fusionnés</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--surface-warm)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          {step !== 'done' && (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
          )}

          {step === 'mapping' && (
            <button type="button" className="btn btn-primary" onClick={handleProceedToPreview}>
              Continuer vers l'aperçu
              <ArrowRight size={16} />
            </button>
          )}

          {step === 'preview' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep('mapping')}>
                Retour au mappage
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmImport}>
                <Check size={16} />
                Valider l'importation ({previews.length} fiches)
              </button>
            </div>
          )}

          {step === 'done' && (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Voir les contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
