import React, { useState } from 'react';
import { AlertCircle, Briefcase, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'RH' | 'Manager'>('RH');

  const handleTabSwitch = (tab: 'RH' | 'Manager') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      onLoginSuccess();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'La connexion a échoué.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-institutional-panel" aria-labelledby="login-product-title">
        <div className="login-brand">
          <span className="login-brand-mark" aria-hidden="true">P</span>
          <span>GROUPE PREMIUM MAROC</span>
        </div>

        <div className="login-product-copy">
          <h1 id="login-product-title">Portail de gestion des périodes d’essai</h1>
          <p>
            Accès réservé au personnel des Ressources Humaines et aux responsables
            hiérarchiques du Groupe Premium Maroc.
          </p>
        </div>

        <div className="login-internal-notice">
          <ShieldCheck size={17} aria-hidden="true" />
          <span>Système interne sécurisé</span>
        </div>
      </section>

      <section className="login-access-panel" aria-label="Accès à l'application">
        <div className="login-form-container">
          <header className="login-form-heading">
            <h2>Connexion</h2>
            <p>Sélectionnez votre espace puis renseignez vos identifiants professionnels.</p>
          </header>

          <div className="login-role-selector" role="group" aria-label="Sélection de l'espace de connexion">
            {(['RH', 'Manager'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'active' : ''}
                onClick={() => handleTabSwitch(tab)}
                aria-pressed={activeTab === tab}
              >
                {tab === 'RH' ? <ShieldCheck size={17} /> : <Briefcase size={17} />}
                {tab === 'RH' ? 'Assistante RH' : 'Responsable'}
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-email">Adresse e-mail</label>
              <div className="login-input-wrapper">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={event => { setEmail(event.target.value); setError(''); }}
                  placeholder="Adresse e-mail professionnelle"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="login-input-wrapper">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => { setPassword(event.target.value); setError(''); }}
                  placeholder="Saisissez votre mot de passe"
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={17} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button id="login-submit-btn" className="login-submit" type="submit" disabled={isLoading}>
              {isLoading ? <span className="login-spinner" aria-hidden="true" /> : <LogIn size={18} />}
              {isLoading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <footer className="login-footer">
          © 2026 Groupe Premium Maroc · Usage interne uniquement
        </footer>
      </section>
    </main>
  );
};
