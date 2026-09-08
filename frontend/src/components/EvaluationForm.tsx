import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { api, errorMessage } from '../api';
import { CRITERES_EVALUATION } from '../types';
import type { Evaluation, Employe, CritereNote, Responsable } from '../types';
import { Save, Printer, ArrowLeft } from 'lucide-react';
import { ErrorState, LoadingState } from './AsyncState';

interface EvaluationFormProps {
  evaluation: Evaluation;
  employe: Employe;
  onBack: () => void;
  onSuccess: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  evaluation,
  employe,
  onBack,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  
  // 1. Un RH ne peut jamais modifier le formulaire du manager.
  // 2. Si l'évaluation est déjà 'recu', elle est verrouillée, même pour le manager.
  const isReadonly = evaluation.statut === 'recu' || currentUser?.role === 'RH';

  const [notes, setNotes] = useState<CritereNote[]>(evaluation.notes || []);
  
  // Nouveaux champs
  const [objectifsStatut, setObjectifsStatut] = useState<'depasses' | 'atteints' | 'partiellement_atteints' | ''>(evaluation.objectifs_statut || '');
  const [objectifsCommentaires, setObjectifsCommentaires] = useState(evaluation.objectifs_commentaires || '');
  
  const [appreciation, setAppreciation] = useState(evaluation.appreciations_generales || '');
  const [pointsForts, setPointsForts] = useState(evaluation.points_forts || '');
  const [axesAmelioration, setAxesAmelioration] = useState(evaluation.axes_amelioration || '');
  
  const [recommandationStatut, setRecommandationStatut] = useState<'validation' | 'rupture' | ''>(evaluation.recommandation_statut || '');
  const [recommandationDateEffet, setRecommandationDateEffet] = useState(evaluation.recommandation_date_effet || '');
  const [recommandationCommentaires, setRecommandationCommentaires] = useState(evaluation.recommandation_commentaires || '');

  // Champ RH (Note interne)
  const [noteInterneRH, setNoteInterneRH] = useState(evaluation.note_interne_rh || '');
  const [manager, setManager] = useState<Responsable | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getResponsable(employe.responsable_id)
      .then(setManager)
      .catch(loadError => setError(errorMessage(loadError)))
      .finally(() => setLoading(false));
  }, [employe.responsable_id]);

  const handleNoteChange = (critereId: string, note: number) => {
    if (isReadonly) return;
    const existing = notes.find(n => n.critere_id === critereId);
    if (existing) {
      setNotes(notes.map(n => n.critere_id === critereId ? { ...n, note } : n));
    } else {
      setNotes([...notes, { critere_id: critereId, note, commentaire: '' }]);
    }
  };

  const handleCommentaireCritereChange = (critereId: string, commentaire: string) => {
    if (isReadonly) return;
    const existing = notes.find(n => n.critere_id === critereId);
    if (existing) {
      setNotes(notes.map(n => n.critere_id === critereId ? { ...n, commentaire } : n));
    } else {
      setNotes([...notes, { critere_id: critereId, note: 0, commentaire }]);
    }
  };

  const handleSave = async () => {
    // Vérification basique
    if (notes.length < CRITERES_EVALUATION.length) {
      if (!window.confirm("Certains critères n'ont pas été notés. Voulez-vous quand même enregistrer ?")) {
        return;
      }
    }
    if (!currentUser) return;

    setSaving(true);
    setError('');
    try {
      await api.submitEvaluation(evaluation.id, {
        notes,
        appreciations_generales: appreciation,
        points_forts: pointsForts,
        axes_amelioration: axesAmelioration,
        objectifs_statut: objectifsStatut,
        objectifs_commentaires: objectifsCommentaires,
        recommandation_statut: recommandationStatut,
        recommandation_date_effet: recommandationDateEffet || null,
        recommandation_commentaires: recommandationCommentaires
      });
      onSuccess();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNoteRH = async () => {
    if (!currentUser) return;
    setSaving(true);
    setError('');
    try {
      await api.updateNoteRh(evaluation.id, noteInterneRH);
      alert("Note interne RH enregistrée avec succès.");
      onSuccess();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const getNote = (critereId: string) => {
    return notes.find(n => n.critere_id === critereId)?.note || 0;
  };
  
  const getCommentaireCritere = (critereId: string) => {
    return notes.find(n => n.critere_id === critereId)?.commentaire || '';
  };

  const competencesPro = CRITERES_EVALUATION.filter(c => c.categorie === 'competences_professionnelles');
  const aptitudesPerso = CRITERES_EVALUATION.filter(c => c.categorie === 'aptitudes_personnelles');
  const bonnesPratiques = CRITERES_EVALUATION.filter(c => c.categorie === 'bonnes_pratiques_qse');

  return (
    <div className="evaluation-form-page" style={{ paddingBottom: '4rem' }}>
      {loading && <LoadingState label="Chargement de l'évaluation..." />}
      {error && <ErrorState message={error} />}
      <div className="page-title-area" style={{ marginBottom: '1rem' }}>
        <div>
          <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Version Imprimable / PDF
          </button>
          {!isReadonly && (
            <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving || loading}>
              <Save size={16} /> Soumettre l'évaluation
            </button>
          )}
        </div>
      </div>

      <div className="document-a4">
        <table className="document-print-layout">
          <thead>
            <tr>
              <td className="document-print-header-cell">
                {/* En-tête officiel répété par le moteur d’impression */}
                <div className="document-a4-header">
                  <div className="document-a4-logo">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', letterSpacing: '2px', color: '#666' }}>GROUPE</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'black' }}>PREMIUM</span>
                    </div>
                  </div>
                  <div className="document-a4-title-area">
                    <div className="document-a4-title">
                      FICHE D’OBJECTIFS ET D’EVALUATION DE LA PERIODE D’ESSAI
                    </div>
                    <div className="document-a4-meta">
                      <div>Référence : <strong>PS07PR02IN02FO02</strong></div>
                      <div>Etat : <strong>Mise à Jour</strong></div>
                      <div>Version n° : <strong>3.0</strong></div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="document-print-content-cell">

        {/* 1. Renseignements */}
        <div className="document-section-title">
          Renseignements du collaborateur
        </div>
        <table className="document-table">
          <tbody>
            <tr>
              <td style={{ width: '50%' }}><strong>Nom :</strong> {employe.nom_complet.split(' ').slice(1).join(' ') || employe.nom_complet}</td>
              <td style={{ width: '50%' }}><strong>Poste :</strong> {employe.poste}</td>
            </tr>
            <tr>
              <td><strong>Prénom :</strong> {employe.nom_complet.split(' ')[0]}</td>
              <td><strong>Direction/ Division :</strong> Non spécifié</td>
            </tr>
            <tr>
              <td><strong>Date d’intégration :</strong> {new Date(employe.date_embauche).toLocaleDateString('fr-FR')}</td>
              <td><strong>Supérieur Hiérarchique :</strong> {manager?.nom_complet}</td>
            </tr>
            <tr>
              <td><strong>Date de l’évaluation :</strong> {new Date().toLocaleDateString('fr-FR')}</td>
              <td><strong>Nom de l'évaluateur :</strong> {manager?.nom_complet}</td>
            </tr>
          </tbody>
        </table>

        {/* 2. Objectifs */}
        <div className="document-box">
          <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Evaluation des objectifs :
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 1rem' }}>
            <strong>Objectifs</strong>
            
            <label className="document-checkbox-container">
              Dépassés
              <input type="checkbox" className="document-checkbox" 
                checked={objectifsStatut === 'depasses'}
                onChange={() => !isReadonly && setObjectifsStatut('depasses')}
                disabled={isReadonly}
              />
            </label>
            
            <label className="document-checkbox-container">
              Atteints
              <input type="checkbox" className="document-checkbox" 
                checked={objectifsStatut === 'atteints'}
                onChange={() => !isReadonly && setObjectifsStatut('atteints')}
                disabled={isReadonly}
              />
            </label>
            
            <label className="document-checkbox-container">
              Partiellement atteints
              <input type="checkbox" className="document-checkbox" 
                checked={objectifsStatut === 'partiellement_atteints'}
                onChange={() => !isReadonly && setObjectifsStatut('partiellement_atteints')}
                disabled={isReadonly}
              />
            </label>
          </div>

          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Commentaires synthétiques sur les objectifs :</div>
          <textarea 
            className="document-textarea" 
            style={{ minHeight: '60px' }}
            value={objectifsCommentaires}
            onChange={(e) => setObjectifsCommentaires(e.target.value)}
            disabled={isReadonly}
          />
        </div>

        {/* 3. Grille */}
        <div className="document-section-title" style={{ marginTop: '2rem' }}>
          Grille d’évaluation
        </div>

        <table className="document-table" style={{ marginBottom: '2rem' }}>
          <tbody>
            <tr>
              <td rowSpan={5} style={{ width: '15%', verticalAlign: 'top' }}>Légende :</td>
              <td style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>1 :</td>
              <td>Performance exceptionnelle</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>2 :</td>
              <td>Performance supérieure aux besoins du poste</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>3 :</td>
              <td>Performance correspondant aux besoins du poste</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>4 :</td>
              <td>Performance acceptable nécessitant une amélioration</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>5 :</td>
              <td>Performance insuffisante et inférieure aux besoins du poste</td>
            </tr>
          </tbody>
        </table>

        {/* Sous-tableau 1 */}
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', textAlign: 'center' }}>Compétences professionnelles & techniques</h3>
        <table className="document-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Critères</th>
              <th style={{ width: '25%', textAlign: 'center' }}>Évaluation (1 à 5)</th>
              <th style={{ width: '30%', textAlign: 'center' }}>Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {competencesPro.map(c => (
              <tr key={c.id}>
                <td>{c.libelle}</td>
                <td style={{ textAlign: 'center' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <label key={n} className="document-checkbox-container" style={{ marginRight: '4px' }}>
                      <input 
                        type="checkbox" 
                        className="document-checkbox" 
                        checked={getNote(c.id) === n}
                        onChange={() => handleNoteChange(c.id, n)}
                        disabled={isReadonly}
                      />
                      <span style={{ fontSize: '0.7rem' }}>{n}</span>
                    </label>
                  ))}
                </td>
                <td>
                  <input 
                    type="text" 
                    className="document-textarea" 
                    style={{ minHeight: 'auto' }}
                    value={getCommentaireCritere(c.id)}
                    onChange={(e) => handleCommentaireCritereChange(c.id, e.target.value)}
                    disabled={isReadonly}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sous-tableau 2 */}
        <h3 style={{ fontSize: '1.1rem', marginTop: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Aptitudes personnelles & comportement professionnel</h3>
        <table className="document-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Critères</th>
              <th style={{ width: '25%', textAlign: 'center' }}>Évaluation (1 à 5)</th>
              <th style={{ width: '30%', textAlign: 'center' }}>Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {aptitudesPerso.map(c => (
              <tr key={c.id}>
                <td>{c.libelle}</td>
                <td style={{ textAlign: 'center' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <label key={n} className="document-checkbox-container" style={{ marginRight: '4px' }}>
                      <input 
                        type="checkbox" 
                        className="document-checkbox" 
                        checked={getNote(c.id) === n}
                        onChange={() => handleNoteChange(c.id, n)}
                        disabled={isReadonly}
                      />
                      <span style={{ fontSize: '0.7rem' }}>{n}</span>
                    </label>
                  ))}
                </td>
                <td>
                  <input 
                    type="text" 
                    className="document-textarea" 
                    style={{ minHeight: 'auto' }}
                    value={getCommentaireCritere(c.id)}
                    onChange={(e) => handleCommentaireCritereChange(c.id, e.target.value)}
                    disabled={isReadonly}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sous-tableau 3 */}
        <h3 style={{ fontSize: '1.1rem', marginTop: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Bonnes pratiques QSE</h3>
        <table className="document-table" style={{ pageBreakAfter: 'always' }}>
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Critères</th>
              <th style={{ width: '25%', textAlign: 'center' }}>Évaluation (1 à 5)</th>
              <th style={{ width: '30%', textAlign: 'center' }}>Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {bonnesPratiques.map(c => (
              <tr key={c.id}>
                <td>{c.libelle}</td>
                <td style={{ textAlign: 'center' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <label key={n} className="document-checkbox-container" style={{ marginRight: '4px' }}>
                      <input 
                        type="checkbox" 
                        className="document-checkbox" 
                        checked={getNote(c.id) === n}
                        onChange={() => handleNoteChange(c.id, n)}
                        disabled={isReadonly}
                      />
                      <span style={{ fontSize: '0.7rem' }}>{n}</span>
                    </label>
                  ))}
                </td>
                <td>
                  <input 
                    type="text" 
                    className="document-textarea" 
                    style={{ minHeight: 'auto' }}
                    value={getCommentaireCritere(c.id)}
                    onChange={(e) => handleCommentaireCritereChange(c.id, e.target.value)}
                    disabled={isReadonly}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 4. Appréciations générales */}
        <div className="document-section-title">
          Appréciations générales des performances
        </div>
        <div className="document-box">
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '2rem' }}>Appréciation générale des performances :</div>
          <textarea 
            className="document-textarea" 
            style={{ minHeight: '60px', marginBottom: '1rem' }}
            value={appreciation}
            onChange={(e) => setAppreciation(e.target.value)}
            disabled={isReadonly}
          />

          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '2rem' }}>Principaux points forts observés :</div>
          <textarea 
            className="document-textarea" 
            style={{ minHeight: '60px', marginBottom: '1rem' }}
            value={pointsForts}
            onChange={(e) => setPointsForts(e.target.value)}
            disabled={isReadonly}
          />

          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '2rem' }}>Axes d’amélioration identifiés :</div>
          <textarea 
            className="document-textarea" 
            style={{ minHeight: '60px' }}
            value={axesAmelioration}
            onChange={(e) => setAxesAmelioration(e.target.value)}
            disabled={isReadonly}
          />
        </div>

        {/* 5. Recommandation */}
        <div className="document-section-title">
          Recommandation
        </div>
        
        <div className="document-box" style={{ minHeight: '100px' }}>
          <textarea 
            className="document-textarea" 
            style={{ minHeight: '90px' }}
            value={recommandationCommentaires}
            onChange={(e) => setRecommandationCommentaires(e.target.value)}
            disabled={isReadonly}
          />
        </div>

        <div className="document-box" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <label className="document-checkbox-container">
              Validation période d’essai :
              <input type="checkbox" className="document-checkbox" style={{ marginLeft: '1rem', width: '20px', height: '20px' }}
                checked={recommandationStatut === 'validation'}
                onChange={() => !isReadonly && setRecommandationStatut('validation')}
                disabled={isReadonly}
              />
            </label>
            
            <label className="document-checkbox-container">
              Rupture période d’essai :
              <input type="checkbox" className="document-checkbox" style={{ marginLeft: '1rem', width: '20px', height: '20px' }}
                checked={recommandationStatut === 'rupture'}
                onChange={() => !isReadonly && setRecommandationStatut('rupture')}
                disabled={isReadonly}
              />
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
            <span>Date d’effet :</span>
            <input 
              type="text" 
              className="document-textarea" 
              style={{ width: '150px', minHeight: 'auto' }}
              value={recommandationDateEffet}
              onChange={(e) => setRecommandationDateEffet(e.target.value)}
              disabled={isReadonly}
            />
          </div>
        </div>

        {/* Signatures */}
        <table className="document-table" style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th style={{ width: '25%', textAlign: 'center' }}>Validation DCH<br/><span style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>Mme Saida KARDOUSSI</span></th>
              <th style={{ width: '25%', textAlign: 'center' }}>Evalué<br/><span style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>Nom : {employe.nom_complet}</span></th>
              <th style={{ width: '25%', textAlign: 'center' }}>Evaluateur<br/><span style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>Nom : {manager?.nom_complet}</span></th>
              <th style={{ width: '25%', textAlign: 'center' }}>Supérieur hiérarchique<br/><span style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>Nom :</span></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: '80px' }}></td>
              <td style={{ height: '80px' }}></td>
              <td style={{ height: '80px' }}></td>
              <td style={{ height: '80px' }}></td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '0.85rem' }}>
          Date de réalisation du bilan : ..............................................
        </div>

        {/* Section réservée aux RH : Note Interne */}
        {currentUser?.role === 'RH' && (
          <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }} className="no-print">
            <h3 style={{ color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 Note Interne RH (Confidentiel)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#0284c7', marginBottom: '1rem' }}>
              Cette zone est visible uniquement par le département des Ressources Humaines. Le responsable hiérarchique n'y a pas accès.
            </p>
            <textarea
              className="document-textarea"
              style={{ minHeight: '100px', backgroundColor: 'white', borderColor: '#7dd3fc', marginBottom: '1rem' }}
              value={noteInterneRH}
              onChange={(e) => setNoteInterneRH(e.target.value)}
              placeholder="Saisissez ici vos notes, remarques ou éventuelles demandes de correction à adresser au manager..."
            />
            <button className="btn btn-primary" onClick={() => void handleSaveNoteRH()} disabled={saving || loading}>
              <Save size={16} /> Enregistrer la Note Interne
            </button>
          </div>
        )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
