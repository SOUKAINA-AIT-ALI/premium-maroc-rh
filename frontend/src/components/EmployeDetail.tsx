import React, { useCallback, useState, useEffect } from 'react';
import { api, errorMessage, getDynamicEvaluationStatus } from '../api';
import type { Employe, Evaluation, Responsable, Decision } from '../types';
import { ErrorState, LoadingState } from './AsyncState';
import { parseLocalDate } from './progressStatus';
import { 
  ArrowLeft, 
  User, 
  Award, 
  Clock, 
  CheckCircle, 
  Upload, 
  Download
} from 'lucide-react';

interface EmployeDetailProps {
  employeId: number;
  onBack: () => void;
  onNavigateToEvaluation: (evaluation: Evaluation) => void;
  onNavigateToDecision: (employe: Employe, evaluations: Evaluation[]) => void;
}

export const EmployeDetail: React.FC<EmployeDetailProps> = ({
  employeId,
  onBack,
  onNavigateToEvaluation,
  onNavigateToDecision
}) => {
  const [employe, setEmploye] = useState<Employe | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [manager, setManager] = useState<Responsable | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [uploadingSigned, setUploadingSigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [foundEmp, allManagers, filteredE, decisions] = await Promise.all([
        api.getEmploye(employeId), api.getResponsables(),
        api.getEvaluations(employeId), api.getDecisions(employeId)
      ]);
      setEmploye(foundEmp);
      setManager(allManagers.find(item => item.id === foundEmp.responsable_id) ?? null);
      setEvaluations(filteredE);
      setDecision(decisions[0] ?? null);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [employeId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingState label="Chargement du collaborateur..." />;
  }
  if (error || !employe) {
    return <ErrorState message={error || 'Collaborateur introuvable.'} onRetry={() => void loadData()} />;
  }

  const handleUploadSignedDocument = async (file: File) => {
    if (!decision) return;
    setUploadingSigned(true);
    setError('');
    try {
      setDecision(await api.uploadSignedDecision(decision.id, file));
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setUploadingSigned(false);
    }
  };

  // Rendu de l'état d'un critère
  const getBadgeStyle = (statut: string) => {
    switch(statut) {
      case 'recu': return 'badge-success';
      case 'en_retard': return 'badge-danger';
      case 'envoye': return 'badge-warning';
      case 'proche': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getStatusText = (statut: string) => {
    switch(statut) {
      case 'recu': return 'ÉVALUÉE';
      case 'en_retard': return 'EN RETARD';
      case 'envoye': return 'EN COURS';
      default: return 'À VENIR';
    }
  };

  const formatDate = (value?: string) => value
    ? parseLocalDate(value).toLocaleDateString('fr-FR')
    : '—';

  const addDaysToIsoDate = (value: string, days: number) => {
    const date = parseLocalDate(value);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Phase 2 reçue = on peut saisir la décision finale
  const phase2 = evaluations.find(e => e.type === 2);
  const canDecide = phase2?.statut === 'recu';
  const phase2EnCours = phase2 && phase2.statut !== 'recu'; // Phase 2 pas encore finalisée

  return (
    <div className="employe-detail-view">
      {error && <ErrorState message={error} />}
      <div className="page-title-area">
        <div>
          <button className="nav-link" onClick={onBack} style={{ paddingLeft: 0, marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Retour au tableau de bord
          </button>
          <h2 className="page-title">Fiche Collaborateur : {employe.nom_complet}</h2>
          <p className="page-subtitle">Suivi du dossier de période d'essai et des évaluations obligatoires</p>
        </div>

        {/* Le bouton "Saisir la Décision" est désormais dans le panneau Statut pour plus de cohérence */}
      </div>

      <div className="grid-3">
        {/* Infos Collaborateur */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Profil Général</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Matricule</span>
              <strong>{employe.matricule}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Poste de Travail</span>
              <strong>{employe.poste}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Société</span>
              <strong>{employe.societe}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Date d'Embauche</span>
              <strong>{new Date(employe.date_embauche).toLocaleDateString('fr-FR')}</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Responsable Hiérarchique</span>
              <strong>{manager?.nom_complet}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{manager?.email}</div>
            </div>
          </div>
        </div>

        {/* Décision Finale */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Award size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Statut et Décision de Période d'Essai</h3>
          </div>

          {decision ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className={`badge ${decision.statut === 'valide' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  {decision.statut === 'valide' ? 'PÉRIODE D\'ESSAI VALIDÉE' : 'RUPTURE DE CONTRAT'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Date d'effet : <strong>{new Date(decision.date_effet).toLocaleDateString('fr-FR')}</strong>
                </span>
              </div>

              {decision.axes_amelioration && (
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', borderLeft: '3px solid var(--accent)' }}>
                  <strong>Axes d'améliorations / remarques :</strong> {decision.axes_amelioration}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => decision.document_pdf_url && api.openProtectedDocument(decision.document_pdf_url).catch(downloadError => setError(errorMessage(downloadError)))} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                  <Download size={14} /> Document d'Évaluation (PDF)
                </button>

                {decision.document_signe_url ? (
                  <button type="button" onClick={() => decision.document_signe_url && api.openProtectedDocument(decision.document_signe_url).catch(downloadError => setError(errorMessage(downloadError)))} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                    <CheckCircle size={14} /> Voir le scan signé physiquement
                  </button>
                ) : (
                  <>
                  <input id="signed-document-upload" type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={event => event.target.files?.[0] && void handleUploadSignedDocument(event.target.files[0])} />
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => document.getElementById('signed-document-upload')?.click()} disabled={uploadingSigned}>
                    <Upload size={14} /> {uploadingSigned ? 'Uploader le scan...' : 'Uploader le Scan Signé'}
                  </button>
                  </>
                )}
              </div>
            </div>
          ) : canDecide ? (
            // Phase 2 reçue mais décision pas encore saisie
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={16} color="var(--success)" />
                <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.9rem' }}>
                  Les deux évaluations sont reçues. La décision finale peut être saisie.
                </span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => onNavigateToDecision(employe, evaluations)}
              >
                Saisir la Décision Finale
              </button>
            </div>
          ) : (
            // Phase 2 pas encore finalisée
            <div style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={16} />
                <span>Décision finale en attente.</span>
              </div>
              {phase2EnCours && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Le responsable doit d'abord compléter l'évaluation à 5 mois (Phase 2) pour débloquer la saisie de la décision finale.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline des Évaluations */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Suivi des Étapes d'Évaluations Obligatoires
        </h3>

        <div className="timeline">
          {evaluations.map(ev => {
            const dynamicStatus = getDynamicEvaluationStatus(ev);
            const isCompleted = dynamicStatus === 'recu';
            const scoreSum = ev.notes?.reduce((sum, n) => sum + n.note, 0) || 0;
            const avgScore = ev.notes?.length > 0 ? (scoreSum / ev.notes.length).toFixed(1) : null;
            const responseDeadline = ev.date_limite_reponse || (ev.date_envoi_reelle
              ? addDaysToIsoDate(ev.date_envoi_reelle, 7)
              : undefined);

            return (
              <div key={ev.id} className="timeline-item">
                <div className={`timeline-badge ${isCompleted ? 'active' : ''}`}>
                  {ev.type}
                </div>
                
                <div className="timeline-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>
                      Phase {ev.type} : Évaluation à {ev.type === 1 ? '2 mois' : '5 mois'}
                    </h4>
                    <span className={`badge ${getBadgeStyle(dynamicStatus)}`}>
                      {getStatusText(dynamicStatus)}
                    </span>
                  </div>

                  <div className="evaluation-tracking-grid">
                    <div><span>Date d'échéance</span><strong>{formatDate(ev.date_prevue_envoi)}</strong></div>
                    <div><span>Date d'envoi de l'email</span><strong>{formatDate(ev.date_envoi_reelle)}</strong></div>
                    <div><span>Date limite de réponse</span><strong>{formatDate(responseDeadline)}</strong></div>
                    <div><span>Responsable hiérarchique</span><strong>{manager?.nom_complet || '—'}</strong></div>
                    {isCompleted && <div><span>Date de soumission</span><strong>{formatDate(ev.date_reception)}</strong></div>}
                  </div>

                  <div className="evaluation-tracking-actions">
                    {isCompleted && avgScore && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Note globale moyenne : <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{avgScore}/5</strong></span>}
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => onNavigateToEvaluation(ev)}>
                      Consulter la fiche
                    </button>
                  </div>

                  {isCompleted && ev.appreciations_generales && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      {ev.appreciations_generales && (
                        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-primary)', backgroundColor: 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          « {ev.appreciations_generales} »
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
