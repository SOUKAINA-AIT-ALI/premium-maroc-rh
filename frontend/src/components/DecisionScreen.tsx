import { useState } from 'react';
import { api, errorMessage } from '../api';
import type { Evaluation, Employe, Decision } from '../types';
import { ArrowLeft, CheckCircle, XCircle, Printer, Upload, Check } from 'lucide-react';

interface DecisionScreenProps {
  employe: Employe;
  evaluations: Evaluation[];
  onBack: () => void;
  onSuccess: () => void;
}

export const DecisionScreen: React.FC<DecisionScreenProps> = ({
  employe,
  evaluations,
  onBack,
  onSuccess
}) => {
  const [statut, setStatut] = useState<'valide' | 'rompu'>('valide');
  const [dateEffet, setDateEffet] = useState('');
  const [axesAmelioration, setAxesAmelioration] = useState('');
  const [error, setError] = useState('');
  const [savedDecision, setSavedDecision] = useState<Decision | null>(null);
  
  // Scanned scan file mockup state
  const [uploadedScanUrl, setUploadedScanUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Trouver l'évaluation de type 2 (5 mois)
  const evalPhase2 = evaluations.find(e => e.type === 2);
  const evalPhase1 = evaluations.find(e => e.type === 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dateEffet) {
      setError('Veuillez renseigner la date d\'effet de la décision.');
      return;
    }

    if (!evalPhase2) {
      setError('L\'évaluation de fin de période d\'essai (5 mois) est introuvable.');
      return;
    }

    setSaving(true);
    try {
      const decision = await api.createDecision({
        employe_id: employe.id,
        evaluation_id: evalPhase2.id,
        statut,
        date_effet: dateEffet,
        axes_amelioration: axesAmelioration
      });
      setSavedDecision(decision);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  // Simuler l'upload d'un scan papier signé physiquement
  const handleUploadScan = async (file: File) => {
    if (!savedDecision) return;
    setUploading(true);
    setError('');
    try {
      const updated = await api.uploadSignedDecision(savedDecision.id, file);
      setSavedDecision(updated);
      setUploadedScanUrl(updated.document_signe_url || 'document-uploadé');
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calcul du score moyen
  const calculateAverageScore = (ev?: Evaluation) => {
    if (!ev || !ev.notes || ev.notes.length === 0) return 'Non évalué';
    const sum = ev.notes.reduce((acc, curr) => acc + curr.note, 0);
    return (sum / ev.notes.length).toFixed(1) + '/5';
  };

  return (
    <div className="decision-screen-view">
      <div className="page-title-area">
        <div>
          <button className="nav-link" onClick={onBack} style={{ paddingLeft: 0, marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Retour à la fiche collaborateur
          </button>
          <h2 className="page-title">Décision de Fin de Période d'Essai</h2>
          <p className="page-subtitle">Collaborateur : <strong>{employe.nom_complet}</strong> | Matricule : {employe.matricule}</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Comparatif synthétique des deux évaluations */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Bilan des Évaluations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Phase 1 */}
            <div style={{ borderLeft: '3px solid var(--info)', paddingLeft: '1rem' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Phase 1 (À 2 Mois)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Statut : <span className="badge badge-success">{evalPhase1?.statut.replace('_', ' ')}</span>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Score Moyen : <strong>{calculateAverageScore(evalPhase1)}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                « {evalPhase1?.appreciations_generales || 'Pas de commentaire saisi.'} »
              </p>
            </div>

            {/* Phase 2 */}
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Phase 2 (À 5 Mois)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Statut : <span className={`badge ${evalPhase2?.statut === 'recu' ? 'badge-success' : 'badge-warning'}`}>
                  {evalPhase2?.statut.replace('_', ' ')}
                </span>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Score Moyen : <strong>{calculateAverageScore(evalPhase2)}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                « {evalPhase2?.appreciations_generales || 'Pas de commentaire saisi.'} »
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de prise de décision */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Enregistrement de la Décision Finalisée
          </h3>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1.25rem'
            }}>
              {error}
            </div>
          )}

          {!savedDecision ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Décision du Comité / DCH *</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border: statut === 'valide' ? '2px solid var(--success)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: statut === 'valide' ? 'var(--success-bg)' : 'white',
                    color: statut === 'valide' ? 'var(--success)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="statut-decision" 
                      checked={statut === 'valide'}
                      onChange={() => setStatut('valide')}
                      style={{ display: 'none' }}
                    />
                    <CheckCircle size={18} />
                    Période d'essai validée
                  </label>

                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border: statut === 'rompu' ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: statut === 'rompu' ? 'var(--danger-bg)' : 'white',
                    color: statut === 'rompu' ? 'var(--danger)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="statut-decision" 
                      checked={statut === 'rompu'}
                      onChange={() => setStatut('rompu')}
                      style={{ display: 'none' }}
                    />
                    <XCircle size={18} />
                    Rupture de contrat
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date d'effet *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={dateEffet}
                  onChange={(e) => setDateEffet(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remarques ou axes de progrès à intégrer dans la lettre</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Ex: Maintenir les efforts sur l'anglais technique..."
                  value={axesAmelioration}
                  onChange={(e) => setAxesAmelioration(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer la Décision & Générer le PDF'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  <Check size={18} /> Décision enregistrée avec succès
                </h4>
                Le document d'évaluation final reprenant l'historique complet a été généré par l'application.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Étape 1 : Imprimer le document d'évaluation et le faire signer par le collaborateur et la direction.</p>
                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handlePrint}>
                    <Printer size={16} /> Imprimer le Document Officiel
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Étape 2 : Une fois signé physiquement, uploader le scan officiel.</p>
                  
                  {!uploadedScanUrl ? (
                    <>
                    <input id="decision-scan-upload" type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={event => event.target.files?.[0] && void handleUploadScan(event.target.files[0])} />
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => document.getElementById('decision-scan-upload')?.click()} disabled={uploading}>
                      <Upload size={16} /> {uploading ? 'Upload en cours...' : 'Uploader le Scan Signé'}
                    </button>
                    </>
                  ) : (
                    <div>
                      <span className="badge badge-success" style={{ width: '100%', padding: '0.5rem', justifyContent: 'center' }}>
                        Scan archivé avec succès
                      </span>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Lien : {uploadedScanUrl}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '1.5rem' }}
                onClick={onSuccess}
              >
                Terminer le dossier et quitter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
