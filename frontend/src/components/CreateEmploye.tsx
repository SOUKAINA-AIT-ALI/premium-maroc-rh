import { useEffect, useState } from 'react';
import { Save, UserPlus, X } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Responsable } from '../types';
import { LoadingState } from './AsyncState';

interface CreateEmployeProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateEmploye = ({ onBack, onSuccess }: CreateEmployeProps) => {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [matricule, setMatricule] = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [poste, setPoste] = useState('');
  const [societe, setSociete] = useState('Groupe Premium');
  const [responsableId, setResponsableId] = useState('');
  const [dateEmbauche, setDateEmbauche] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getResponsables()
      .then(setResponsables)
      .catch(loadError => setError(errorMessage(loadError)))
      .finally(() => setLoading(false));
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onBack();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onBack]);

  const selectedResponsable = responsables.find(responsable => responsable.id === Number(responsableId));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!matricule.trim() || !nomComplet.trim() || !poste.trim() || !societe || !responsableId || !dateEmbauche) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSaving(true);
    try {
      await api.createEmploye({
      matricule: matricule.trim(),
      nom_complet: nomComplet.trim(),
      poste: poste.trim(),
      societe,
      responsable_id: Number(responsableId),
      date_embauche: dateEmbauche
      });
      onSuccess();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="employee-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onBack()}>
      <section className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
        <header className="employee-modal-header">
          <div className="employee-modal-icon"><UserPlus size={23} /></div>
          <div>
            <h2 id="employee-modal-title">Nouveau Dossier Période d'Essai</h2>
            <p>Enregistrement d'un nouveau collaborateur — Groupe Premium Maroc</p>
          </div>
          <button type="button" className="employee-modal-close" onClick={onBack} aria-label="Fermer"><X size={21} /></button>
        </header>

        <form onSubmit={handleSubmit} className="employee-modal-body">
          {error && <div className="employee-modal-error">{error}</div>}

          {loading && <LoadingState label="Chargement des responsables..." />}

          <div className="employee-form-grid">
            <div className="form-group">
              <label className="form-label">Matricule <span>*</span></label>
              <input autoFocus type="text" className="form-input" placeholder="Ex: M2026_161" value={matricule} onChange={event => setMatricule(event.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Nom &amp; prénom du collaborateur <span>*</span></label>
              <input type="text" className="form-input" placeholder="Ex: Karim ALAOUI" value={nomComplet} onChange={event => setNomComplet(event.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Poste / intitulé de fonction <span>*</span></label>
              <input type="text" className="form-input" placeholder="Ex: Chef de Projet IT" value={poste} onChange={event => setPoste(event.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Société / entité <span>*</span></label>
              <select className="form-input" value={societe} onChange={event => setSociete(event.target.value)} required>
                <option>Groupe Premium</option><option>SRM</option><option>Premium Offshore</option><option>AFIT</option><option>Premium Mobility</option><option>CCIC</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Responsable hiérarchique <span>*</span></label>
              <select className="form-input" value={responsableId} onChange={event => setResponsableId(event.target.value)} required>
                <option value="">Sélectionner un responsable...</option>
                {responsables.map(responsable => <option key={responsable.id} value={responsable.id}>{responsable.nom_complet}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail responsable</label>
              <input type="email" className="form-input employee-readonly" value={selectedResponsable?.email || ''} placeholder="Sélectionnez d'abord un responsable" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Date d'embauche <span>*</span></label>
              <input type="date" className="form-input" value={dateEmbauche} onChange={event => setDateEmbauche(event.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Planification automatique</label>
              <input type="text" className="form-input employee-readonly" value="Phase 1 : +2 mois  •  Phase 2 : +5 mois" readOnly />
            </div>
          </div>

          <p className="employee-schedule-note">Les deux évaluations seront créées automatiquement à partir de la date d'embauche.</p>

          <footer className="employee-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onBack}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving || loading}><Save size={16} /> {saving ? 'Enregistrement...' : 'Créer le dossier'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
};
