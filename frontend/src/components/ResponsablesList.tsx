import { useState, useEffect } from 'react';
import { api, errorMessage } from '../api';
import type { Responsable } from '../types';
import { ArrowLeft, Mail, Plus, Search } from 'lucide-react';
import { LoadingState } from './AsyncState';

interface ResponsablesListProps {
  onBack: () => void;
}

export const ResponsablesList: React.FC<ResponsablesListProps> = ({ onBack }) => {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setResponsables(await api.getResponsables());
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAddResponsable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nomComplet.trim() || !email.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    const emailExists = responsables.some(
      r => r.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (emailExists) {
      setError('Un responsable avec cette adresse e-mail existe déjà.');
      return;
    }

    setSaving(true);
    try {
      const created = await api.createResponsable(nomComplet.trim(), email.trim());
      setResponsables(items => [...items, created]);
      setSuccess('Le responsable hiérarchique a été ajouté avec succès.');
      setNomComplet('');
      setEmail('');
      setTimeout(() => {
        setSuccess('');
        setShowAddForm(false);
      }, 1500);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const filteredResponsables = responsables.filter(r => 
    r.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="responsables-list-view">
      <div className="page-title-area">
        <div>
          <button className="nav-link" onClick={onBack} style={{ paddingLeft: 0, marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Retour au tableau de bord
          </button>
          <h2 className="page-title">Répertoire des Responsables Hiérarchiques</h2>
          <p className="page-subtitle">
            Gérer la liste des {responsables.length} managers habilités à remplir les fiches d'évaluation.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} /> {showAddForm ? 'Fermer le formulaire' : 'Ajouter un responsable'}
        </button>
      </div>

      {loading && <LoadingState label="Chargement des responsables..." />}

      {showAddForm && (
        <div className="card" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Nouveau Responsable Hiérarchique
          </h3>

          {error && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleAddResponsable}>
            <div className="form-group">
              <label className="form-label">Nom Complet du responsable *</label>
              <input 
                type="text" 
                placeholder="Ex: Youssef EL ALAMI" 
                className="form-input"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse E-mail Professionnelle *</label>
              <input 
                type="email" 
                placeholder="Ex: y.elalami@premium.ma" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou adresse e-mail..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom Complet</th>
              <th>Adresse E-mail Professionnelle</th>
            </tr>
          </thead>
          <tbody>
            {filteredResponsables.length > 0 ? (
              filteredResponsables.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.nom_complet}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      {r.email}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucun responsable trouvé pour votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
