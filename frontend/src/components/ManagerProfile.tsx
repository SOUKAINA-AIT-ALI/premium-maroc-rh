import { useState } from 'react';
import { CheckCircle, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Responsable } from '../types';

interface ManagerProfileProps {
  manager: Responsable;
  email: string;
}

export const ManagerProfile = ({ manager, email }: ManagerProfileProps) => {
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (nouveauMotDePasse.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[a-z]/.test(nouveauMotDePasse) || !/[A-Z]/.test(nouveauMotDePasse) || !/\d/.test(nouveauMotDePasse)) {
      setError('Le nouveau mot de passe doit contenir une majuscule, une minuscule et un chiffre.');
      return;
    }
    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse);
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
      setSuccess('Votre mot de passe a été modifié avec succès.');
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-manager-view manager-profile-view">
      <div className="page-title-area manager-page-heading">
        <div>
          <div className="manager-eyebrow">Espace personnel · Responsable hiérarchique</div>
          <h2 className="page-title">Mon profil</h2>
          <p className="page-subtitle">Consultez vos informations et sécurisez l'accès à votre compte.</p>
        </div>
      </div>

      <div className="manager-profile-grid">
        <section className="card manager-profile-card">
          <div className="manager-card-heading">
            <span className="manager-heading-icon manager-heading-icon-gold"><UserRound size={19} /></span>
            <div><h3>Informations personnelles</h3><p>Informations associées à votre compte Responsable.</p></div>
          </div>
          <dl className="manager-profile-details">
            <div><dt><UserRound size={16} /> Nom complet</dt><dd>{manager.nom_complet}</dd></div>
            <div><dt><Mail size={16} /> Adresse e-mail</dt><dd>{email}</dd></div>
            <div><dt><ShieldCheck size={16} /> Fonction</dt><dd>Responsable hiérarchique</dd></div>
          </dl>
        </section>

        <section className="card manager-password-card">
          <div className="manager-card-heading">
            <span className="manager-heading-icon manager-heading-icon-blue"><KeyRound size={19} /></span>
            <div><h3>Changer le mot de passe</h3><p>Utilisez un mot de passe différent de votre mot de passe actuel.</p></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="manager-current-password">Ancien mot de passe</label>
              <input id="manager-current-password" className="form-input" type="password" autoComplete="current-password" value={ancienMotDePasse} onChange={event => setAncienMotDePasse(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="manager-new-password">Nouveau mot de passe</label>
              <input id="manager-new-password" className="form-input" type="password" autoComplete="new-password" value={nouveauMotDePasse} onChange={event => setNouveauMotDePasse(event.target.value)} required minLength={8} maxLength={72} />
              <p className="manager-password-hint">8 caractères minimum, avec une majuscule, une minuscule et un chiffre.</p>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="manager-confirm-password">Confirmer le nouveau mot de passe</label>
              <input id="manager-confirm-password" className="form-input" type="password" autoComplete="new-password" value={confirmationMotDePasse} onChange={event => setConfirmationMotDePasse(event.target.value)} required minLength={8} maxLength={72} />
            </div>

            {error && <div className="manager-profile-message is-error" role="alert">{error}</div>}
            {success && <div className="manager-profile-message is-success" role="status"><CheckCircle size={16} /> {success}</div>}

            <button className="btn btn-primary manager-password-submit" type="submit" disabled={saving}>
              <KeyRound size={16} /> {saving ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
