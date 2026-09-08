import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, Clock, Download, Plus, Search, UserCheck, Users } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Employe, Evaluation, Responsable } from '../types';
import { ActiveDeadline, getProgressInfo, PhaseStepper, ProgressStatus } from './EmployeeProgress';
import { ErrorState, LoadingState } from './AsyncState';

interface DashboardProps {
  onSelectEmploye: (id: number) => void;
  onNavigateToCreate: () => void;
}

export const Dashboard = ({ onSelectEmploye, onNavigateToCreate }: DashboardProps) => {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeData, evaluationData, managerData] = await Promise.all([
        api.getEmployes(), api.getEvaluations(), api.getResponsables()
      ]);
      setEmployes(employeeData);
      setEvaluations(evaluationData);
      setResponsables(managerData);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const progressFor = (id: number) => getProgressInfo(evaluations.filter(e => e.employe_id === id));
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEmployes = employes.filter(emp => {
    const matchesSearch = !normalizedSearch || [emp.nom_complet, emp.matricule, emp.poste, emp.societe]
      .some(value => value.toLowerCase().includes(normalizedSearch));
    const matchesManager = !filterManager || emp.responsable_id === Number(filterManager);
    const matchesStatus = !filterStatut || progressFor(emp.id).status === filterStatut;
    return matchesSearch && matchesManager && matchesStatus;
  });

  const countStatus = (status: string) => employes.filter(emp => progressFor(emp.id).status === status).length;

  const handleExportCSV = () => {
    const header = 'Matricule,Nom Complet,Poste,Société,Responsable,Date Embauche,Étape,Échéance,Statut\n';
    const rows = filteredEmployes.map(emp => {
      const manager = responsables.find(r => r.id === emp.responsable_id)?.nom_complet || 'Inconnu';
      const progress = progressFor(emp.id);
      return `"${emp.matricule}","${emp.nom_complet}","${emp.poste}","${emp.societe}","${manager}","${emp.date_embauche}","${progress.active ? `P${progress.active.type}` : ''}","${progress.active?.date_prevue_envoi || ''}","${progress.status}"`;
    }).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(`data:text/csv;charset=utf-8,${header}${rows}`);
    link.download = `premium_maroc_rh_suivi_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="dashboard-view">
      <div className="page-title-area">
        <div><h2 className="page-title">Tableau de Bord RH</h2><p className="page-subtitle">Suivi digital de la période d'essai — Groupe Premium Maroc</p></div>
        <button className="btn btn-primary" onClick={onNavigateToCreate}><Plus size={16} /> Nouvel Employé</button>
      </div>

      {loading && <LoadingState label="Chargement du tableau de bord..." />}
      {error && <ErrorState message={error} onRetry={() => void loadData()} />}

      <div className="grid-3">
        <div className="stat-card stat-info"><div className="stat-icon"><Users size={24} /></div><div className="stat-info"><h4>Total Dossiers Actifs</h4><p>{employes.length}</p></div></div>
        <div className="stat-card stat-danger"><div className="stat-icon"><AlertTriangle size={24} /></div><div className="stat-info"><h4>Dossiers en Retard</h4><p>{countStatus('en_retard')}</p></div></div>
        <div className="stat-card stat-warning"><div className="stat-icon"><Clock size={24} /></div><div className="stat-info"><h4>Évaluations en cours</h4><p>{countStatus('en_cours')}</p></div></div>
        <div className="stat-card stat-success"><div className="stat-icon"><UserCheck size={24} /></div><div className="stat-info"><h4>Périodes évaluées</h4><p>{countStatus('validee')}</p></div></div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper"><Search className="search-icon" /><input type="text" placeholder="Rechercher par collaborateur, matricule, poste, société..." className="search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <select className="filter-select" value={filterManager} onChange={e => setFilterManager(e.target.value)}><option value="">Tous les responsables</option>{responsables.map(r => <option key={r.id} value={r.id}>{r.nom_complet}</option>)}</select>
        <select className="filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}><option value="">Tous les statuts</option><option value="non_echue">Non échue</option><option value="en_cours">En cours</option><option value="en_retard">En retard</option><option value="validee">Évaluée</option></select>
        <button className="btn btn-secondary" onClick={handleExportCSV}><Download size={16} /> Exporter CSV</button>
      </div>

      <div className="table-container dashboard-rh-table-container">
        <table className="custom-table dashboard-rh-table">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '7%' }} />
          </colgroup>
          <thead><tr><th>Matricule</th><th>Collaborateur</th><th>Poste</th><th>Société</th><th>Responsable</th><th>Embauche</th><th>Étape</th><th>Échéance</th><th>Statut</th><th style={{ width: 70 }}>Actions</th></tr></thead>
          <tbody>
            {filteredEmployes.map(emp => {
              const manager = responsables.find(r => r.id === emp.responsable_id);
              const progress = progressFor(emp.id);
              return <tr key={emp.id} style={{ cursor: 'pointer' }} onClick={() => onSelectEmploye(emp.id)}>
                <td style={{ fontWeight: 600 }}>{emp.matricule}</td><td>{emp.nom_complet}</td><td>{emp.poste}</td><td>{emp.societe}</td>
                <td><div style={{ fontWeight: 500 }}>{manager?.nom_complet || 'Inconnu'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{manager?.email}</div></td>
                <td>{new Date(emp.date_embauche).toLocaleDateString('fr-FR')}</td><td><PhaseStepper info={progress} /></td><td><ActiveDeadline info={progress} /></td><td><ProgressStatus status={progress.status} /></td>
                <td><button className="btn btn-secondary btn-icon" onClick={event => { event.stopPropagation(); onSelectEmploye(emp.id); }} aria-label={`Ouvrir la fiche de ${emp.nom_complet}`}><ChevronRight size={16} /></button></td>
              </tr>;
            })}
            {filteredEmployes.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Aucun dossier trouvé pour les critères de recherche.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
