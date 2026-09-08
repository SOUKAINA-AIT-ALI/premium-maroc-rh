import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, ChevronRight, Clock, FileEdit, Search, Users } from 'lucide-react';
import { api, errorMessage, getDynamicEvaluationStatus } from '../api';
import type { Employe, Evaluation, Responsable } from '../types';
import { ActiveDeadline, getProgressInfo, PhaseStepper, ProgressStatus } from './EmployeeProgress';
import { ErrorState, LoadingState } from './AsyncState';

interface DashboardManagerProps {
  manager: Responsable;
  onNavigateToEvaluation: (evaluation: Evaluation, employe: Employe) => void;
}

export const DashboardManager = ({ manager, onNavigateToEvaluation }: DashboardManagerProps) => {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const myEmployes = await api.getEmployes(manager.id);
      const evaluationGroups = await Promise.all(myEmployes.map(employee => api.getEvaluations(employee.id)));
      setEmployes(myEmployes);
      setEvaluations(evaluationGroups.flat());
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [manager.id]);

  useEffect(() => { void loadData(); }, [loadData]);

  const evaluationsFor = (id: number) => evaluations.filter(evaluation => evaluation.employe_id === id);
  const progressFor = (id: number) => getProgressInfo(evaluationsFor(id));
  const evalsAFaire = evaluations.filter(evaluation => ['envoye', 'en_retard'].includes(getDynamicEvaluationStatus(evaluation)));
  const evalsFaites = evaluations.filter(evaluation => getDynamicEvaluationStatus(evaluation) === 'recu');
  const search = searchTerm.trim().toLowerCase();
  const filteredEmployes = employes.filter(emp => !search || [emp.nom_complet, emp.matricule, emp.poste, emp.societe].some(value => value.toLowerCase().includes(search)));

  const openProgress = (emp: Employe) => {
    const info = progressFor(emp.id);
    const evaluation = info.active || info.phase2 || info.phase1;
    if (evaluation) onNavigateToEvaluation(evaluation, emp);
  };

  return (
    <div className="dashboard-manager-view" id="manager-overview">
      <div className="page-title-area manager-page-heading"><div><div className="manager-eyebrow">Espace personnel · Responsable hiérarchique</div><h2 className="page-title">Espace Manager</h2><p className="page-subtitle">Bienvenue, <strong>{manager.nom_complet}</strong>. Voici les dossiers de votre équipe.</p></div></div>
      {loading && <LoadingState label="Chargement de votre équipe..." />}
      {error && <ErrorState message={error} onRetry={() => void loadData()} />}
      <div className="grid-3 manager-stats-grid">
        <div className="stat-card stat-info"><div className="stat-icon"><Users size={24} /></div><div className="stat-info"><h4>Collaborateurs assignés</h4><p>{employes.length}</p></div></div>
        <div className="stat-card stat-warning" style={{ borderColor: evalsAFaire.length ? 'var(--warning)' : 'var(--border-color)' }}><div className="stat-icon">{evalsAFaire.length ? <AlertCircle size={24} /> : <Clock size={24} />}</div><div className="stat-info"><h4>Évaluations à remplir</h4><p>{evalsAFaire.length}</p></div></div>
        <div className="stat-card stat-success"><div className="stat-icon"><CheckCircle size={24} /></div><div className="stat-info"><h4>Évaluations finalisées</h4><p>{evalsFaites.length}</p></div></div>
      </div>

      <div id="manager-evaluations">
      {evalsAFaire.length > 0 && <div className="card manager-actions-card">
        <h3><AlertCircle size={18} /> Actions requises</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{evalsAFaire.map(evaluation => {
          const emp = employes.find(item => item.id === evaluation.employe_id);
          if (!emp) return null;
          const late = getDynamicEvaluationStatus(evaluation) === 'en_retard';
          return <div key={evaluation.id} className={`manager-action-item ${late ? 'is-late' : ''}`}>
            <div><div style={{ fontWeight: 600 }}>{emp.nom_complet} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>— {emp.poste}</span></div><div style={{ fontSize: '0.85rem', color: late ? 'var(--danger)' : 'var(--text-secondary)' }}>Fiche d'évaluation à {evaluation.type === 1 ? '2 mois' : '5 mois'}{late && <strong> (En retard)</strong>}</div></div>
            <button className="btn btn-primary" onClick={() => onNavigateToEvaluation(evaluation, emp)}><FileEdit size={16} /> Remplir la fiche</button>
          </div>;
        })}</div>
      </div>}
      </div>

      <div className="card manager-team-card" id="manager-team">
        <h3>Mon Équipe</h3>
        <div className="filter-bar" style={{ padding: 0, border: 'none', marginBottom: '1rem' }}><div className="search-input-wrapper"><Search className="search-icon" /><input type="text" placeholder="Rechercher un collaborateur, un poste ou une société..." className="search-input" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} /></div></div>
        <div className="table-container"><table className="custom-table">
          <thead><tr><th>Matricule</th><th>Collaborateur</th><th>Poste</th><th>Société</th><th>Embauche</th><th>Étape</th><th>Échéance</th><th>Statut</th><th style={{ width: 70 }}>Actions</th></tr></thead>
          <tbody>{filteredEmployes.map(emp => {
            const progress = progressFor(emp.id);
            return <tr key={emp.id} style={{ cursor: 'pointer' }} onClick={() => openProgress(emp)}>
              <td style={{ fontWeight: 600 }}>{emp.matricule}</td><td>{emp.nom_complet}</td><td>{emp.poste}</td><td>{emp.societe}</td><td>{new Date(emp.date_embauche).toLocaleDateString('fr-FR')}</td>
              <td><PhaseStepper info={progress} /></td><td><ActiveDeadline info={progress} /></td><td><ProgressStatus status={progress.status} /></td>
              <td><button className="btn btn-secondary btn-icon" onClick={event => { event.stopPropagation(); openProgress(emp); }} aria-label={`Ouvrir le dossier de ${emp.nom_complet}`}><ChevronRight size={16} /></button></td>
            </tr>;
          })}{filteredEmployes.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun collaborateur trouvé.</td></tr>}</tbody>
        </table></div>
      </div>
    </div>
  );
};
