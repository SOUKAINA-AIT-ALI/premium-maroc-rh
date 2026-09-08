import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle, ChevronRight, Clock3, FileCheck2, RefreshCw } from 'lucide-react';
import { api, errorMessage, getDynamicEvaluationStatus } from '../api';
import type { Employe, Evaluation, Responsable } from '../types';
import { ErrorState, LoadingState } from './AsyncState';
import { getManagerEvaluationGroup } from './managerEvaluationStatus';
import type { ManagerEvaluationDynamicStatus, ManagerEvaluationGroup } from './managerEvaluationStatus';

interface ManagerEvaluationsProps {
  manager: Responsable;
  onNavigateToEvaluation: (evaluation: Evaluation, employe: Employe) => void;
}

type EvaluationWithEmployee = {
  evaluation: Evaluation;
  employe: Employe;
  status: ManagerEvaluationDynamicStatus;
  group: ManagerEvaluationGroup;
};

const STATUS_META: Record<ManagerEvaluationDynamicStatus, { label: string; css: string }> = {
  en_retard: { label: 'En retard', css: 'badge-danger' },
  envoye: { label: 'À faire', css: 'badge-warning' },
  proche: { label: 'À venir bientôt', css: 'badge-warning' },
  a_venir: { label: 'À venir', css: 'badge-info' },
  recu: { label: 'Évaluée', css: 'badge-success' },
};

const GROUPS = [
  { key: 'todo', title: 'À faire', description: 'Évaluations disponibles et en attente de saisie.', empty: 'Aucune évaluation ne nécessite votre intervention.', Icon: AlertTriangle },
  { key: 'upcoming', title: 'À venir', description: 'Évaluations planifiées pour les prochaines échéances.', empty: 'Aucune nouvelle échéance planifiée.', Icon: Clock3 },
  { key: 'completed', title: 'Terminées', description: 'Évaluations déjà complétées et consultables.', empty: 'Aucune évaluation terminée pour le moment.', Icon: CheckCircle },
] as const;

const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR');

export const ManagerEvaluations = ({ manager, onNavigateToEvaluation }: ManagerEvaluationsProps) => {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeData, evaluationData] = await Promise.all([
        api.getEmployes(manager.id),
        api.getEvaluations(),
      ]);
      setEmployes(employeeData);
      setEvaluations(evaluationData);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [manager.id]);

  useEffect(() => { void loadData(); }, [loadData]);

  const rows = useMemo<EvaluationWithEmployee[]>(() => evaluations
    .map(evaluation => ({
      evaluation,
      employe: employes.find(item => item.id === evaluation.employe_id),
      status: getDynamicEvaluationStatus(evaluation),
      group: getManagerEvaluationGroup(evaluation),
    }))
    .filter((item): item is EvaluationWithEmployee => item.employe !== undefined)
    .sort((first, second) => first.evaluation.date_prevue_envoi.localeCompare(second.evaluation.date_prevue_envoi)),
  [employes, evaluations]);

  return (
    <div className="dashboard-manager-view manager-evaluations-view">
      <div className="page-title-area manager-page-heading">
        <div>
          <div className="manager-eyebrow">Espace personnel · Responsable hiérarchique</div>
          <h2 className="page-title">Mes évaluations</h2>
          <p className="page-subtitle">Toutes les phases d'évaluation de votre équipe, classées selon leur état d'avancement.</p>
        </div>
        <button className="btn btn-secondary manager-evaluations-refresh" type="button" onClick={() => void loadData()} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'is-spinning' : ''} /> Actualiser
        </button>
      </div>

      {loading && <LoadingState label="Chargement de vos évaluations..." />}
      {error && <ErrorState message={error} onRetry={() => void loadData()} />}

      {!loading && !error && (
        <>
          <div className="manager-evaluation-summary" aria-label="Résumé des évaluations">
            {GROUPS.map(group => {
              const SummaryIcon = group.Icon;
              return (
                <div className={`manager-evaluation-summary-card is-${group.key}`} key={group.key}>
                  <span><SummaryIcon size={18} /></span>
                  <div><small>{group.title}</small><strong>{rows.filter(item => item.group === group.key).length}</strong></div>
                </div>
              );
            })}
          </div>

          <div className="manager-evaluation-groups">
          {GROUPS.map(group => {
            const items = rows.filter(item => item.group === group.key);
            const GroupIcon = group.Icon;
            return (
              <section className={`card manager-evaluation-group manager-evaluation-group-${group.key}`} key={group.key}>
                <div className="manager-evaluation-group-header">
                  <span className="manager-evaluation-group-icon"><GroupIcon size={18} /></span>
                  <div><h3>{group.title}</h3><p>{group.description}</p></div>
                  <span className="manager-evaluation-count">{items.length}</span>
                </div>

                <div className="manager-evaluation-list">
                  {items.map(({ evaluation, employe, status }) => {
                    const statusMeta = STATUS_META[status];
                    return (
                      <article className={`manager-evaluation-row ${status === 'en_retard' ? 'is-late' : ''}`} key={evaluation.id}>
                        <div className="manager-evaluation-person">
                          <span className="manager-evaluation-avatar">{employe.nom_complet.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>
                          <div><strong>{employe.nom_complet}</strong><span>{employe.poste}</span></div>
                        </div>
                        <span className="manager-phase-pill">P{evaluation.type}</span>
                        <div className="manager-evaluation-date"><CalendarDays size={15} /><span><small>Échéance</small>{formatDate(evaluation.date_prevue_envoi)}</span></div>
                        <span className={`badge ${statusMeta.css}`}>{statusMeta.label}</span>
                        <button className="btn btn-secondary manager-evaluation-open" type="button" onClick={() => onNavigateToEvaluation(evaluation, employe)}>
                          <FileCheck2 size={15} /> Ouvrir la fiche <ChevronRight size={14} />
                        </button>
                      </article>
                    );
                  })}
                  {items.length === 0 && <div className="manager-evaluation-empty"><GroupIcon size={21} /><strong>{group.empty}</strong><span>Cette section se mettra à jour automatiquement.</span></div>}
                </div>
              </section>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
};
