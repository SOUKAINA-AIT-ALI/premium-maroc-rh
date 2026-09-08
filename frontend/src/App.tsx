import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { DashboardManager } from './components/DashboardManager';
import { ManagerEvaluations } from './components/ManagerEvaluations';
import { ManagerProfile } from './components/ManagerProfile';
import { CreateEmploye } from './components/CreateEmploye';
import { EmployeDetail } from './components/EmployeDetail';
import { EvaluationForm } from './components/EvaluationForm';
import { DecisionScreen } from './components/DecisionScreen';
import { ResponsablesList } from './components/ResponsablesList';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { LoadingState } from './components/AsyncState';
import { api, errorMessage } from './api';
import type { Evaluation, Employe, Responsable } from './types';
import { getRhSidebarSection, shouldShowWorkspaceSidebar } from './navigation';
import type { Screen } from './navigation';
import { 
  Briefcase, 
  ClipboardCheck,
  LayoutDashboard,
  UserPlus,
  Users, 
  User, 
  LogOut
} from 'lucide-react';

type ManagerSection = 'team' | 'evaluations' | 'profile';

// -------------------------------------------------------
// Composant principal (intérieur du AuthProvider)
// -------------------------------------------------------
function AppContent() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  // Navigation — initialisé selon le rôle de l'utilisateur déjà connecté (session)
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    currentUser?.role === 'Manager' ? 'dashboard_manager' : 'dashboard_rh'
  );
  const [managerSection, setManagerSection] = useState<ManagerSection>('team');

  // Synchronisation : quand currentUser change (connexion réussie), rediriger vers le bon dashboard
  useEffect(() => {
    if (currentUser) {
      setCurrentScreen(currentUser.role === 'RH' ? 'dashboard_rh' : 'dashboard_manager');
      if (currentUser.role === 'Manager') setManagerSection('team');
    }
  }, [currentUser]);

  // Navigation Parameter Passers
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [selectedEmployeData, setSelectedEmployeData] = useState<Employe | null>(null);
  const [evalList, setEvalList] = useState<Evaluation[]>([]);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [currentManager, setCurrentManager] = useState<Responsable | null>(null);
  const [appError, setAppError] = useState('');
  const [managerLoading, setManagerLoading] = useState(false);
  const pendingEvaluationId = useRef<number | null>((() => {
    const value = Number(new URLSearchParams(window.location.search).get('evaluation_id'));
    return Number.isInteger(value) && value > 0 ? value : null;
  })());
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    if (currentUser?.role !== 'Manager' || !currentUser.responsable_id) {
      setCurrentManager(null);
      setManagerLoading(false);
      return;
    }
    setManagerLoading(true);
    api.getResponsable(currentUser.responsable_id)
      .then(setCurrentManager)
      .catch(error => setAppError(errorMessage(error)))
      .finally(() => setManagerLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || deepLinkHandled.current || pendingEvaluationId.current === null) return;
    deepLinkHandled.current = true;
    if (currentUser.role !== 'Manager') {
      setAppError("Ce lien d'évaluation doit être ouvert avec le compte Responsable concerné.");
      window.history.replaceState({}, '', '/');
      return;
    }

    const evaluationId = pendingEvaluationId.current;
    Promise.all([
      api.getEvaluation(evaluationId),
    ]).then(async ([evaluation]) => {
      const employe = await api.getEmploye(evaluation.employe_id);
      setSelectedEvaluation(evaluation);
      setSelectedEmployeData(employe);
      setManagerSection('evaluations');
      setCurrentScreen('evaluation_form');
      window.history.replaceState({}, '', '/');
    }).catch(error => {
      setAppError(errorMessage(error));
      window.history.replaceState({}, '', '/');
    });
  }, [currentUser]);

  // ---- Guard : écran de connexion ----
  if (!isAuthenticated || !currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          // Le AuthContext (via login()) a déjà mis à jour currentUser avec setCurrentUser.
          // React re-rend automatiquement — aucun reload nécessaire.
        }}
      />
    );
  }


  // ---- Handlers de navigation ----
  const navigateToDashboard = () => {
    if (currentUser.role === 'RH') {
      setCurrentScreen('dashboard_rh');
    } else {
      setCurrentScreen('dashboard_manager');
    }
    setSelectedEmployeId(null);
  };

  const handleSelectEmploye = (id: number) => {
    setSelectedEmployeId(id);
    setCurrentScreen('employe_detail');
  };

  const handleNavigateToEvaluation = async (ev: Evaluation, emp?: Employe) => {
    if (emp) {
      setSelectedEmployeData(emp);
      setSelectedEvaluation(ev);
      setCurrentScreen('evaluation_form');
    } else {
      try {
        const found = await api.getEmploye(ev.employe_id);
        setSelectedEmployeData(found);
        setSelectedEvaluation(ev);
        setCurrentScreen('evaluation_form');
      } catch (error) {
        setAppError(errorMessage(error));
      }
    }
  };

  const handleNavigateToDecision = (emp: Employe, evs: Evaluation[]) => {
    setSelectedEmployeData(emp);
    setEvalList(evs);
    setCurrentScreen('decision_screen');
  };

  const handleEmployeCreated = () => {
    setDashboardRefreshKey(key => key + 1);
    navigateToDashboard();
  };

  const handleLogout = () => {
    logout();
  };

  const navigateToManagerSection = (section: ManagerSection) => {
    setManagerSection(section);
    setCurrentScreen('dashboard_manager');
  };

  const showWorkspaceSidebar = shouldShowWorkspaceSidebar(currentScreen);
  const showManagerDocumentHeader = currentUser.role === 'Manager' && currentScreen === 'evaluation_form';
  const rhSidebarSection = getRhSidebarSection(currentScreen);

  const sidebarItems = currentUser.role === 'Manager'
    ? [
        { id: 'team', label: 'Mon équipe', icon: <Users size={17} />, active: managerSection === 'team', onClick: () => navigateToManagerSection('team') },
        { id: 'evaluations', label: 'Mes évaluations', icon: <ClipboardCheck size={17} />, active: managerSection === 'evaluations', onClick: () => navigateToManagerSection('evaluations') },
        { id: 'profile', label: 'Mon profil', icon: <User size={17} />, active: managerSection === 'profile', onClick: () => navigateToManagerSection('profile') }
      ]
    : [
        { id: 'dashboard', label: 'Tableau de bord RH', icon: <LayoutDashboard size={17} />, active: rhSidebarSection === 'dashboard', onClick: navigateToDashboard },
        { id: 'responsables', label: 'Répertoire responsables', icon: <Users size={17} />, active: rhSidebarSection === 'responsables', onClick: () => setCurrentScreen('managers_list') },
        { id: 'create', label: 'Nouveau collaborateur', icon: <UserPlus size={17} />, active: rhSidebarSection === 'create', onClick: () => setCurrentScreen('create_employe') }
      ];

  // ---- Rendu de l'application authentifiée ----
  return (
    <div className={`app-container ${showWorkspaceSidebar ? 'manager-dashboard-layout' : ''} ${showWorkspaceSidebar && currentUser.role === 'RH' ? 'rh-workspace-layout' : ''}`}>
      {showWorkspaceSidebar && (
        <WorkspaceSidebar
          spaceName={currentUser.role === 'RH' ? 'ESPACE ASSISTANTE RH' : 'ESPACE RESPONSABLE'}
          sectionLabel={currentUser.role === 'RH' ? 'Espace Assistante RH' : 'Espace Responsable'}
          userName={currentUser.display_name}
          userRole={currentUser.role === 'RH' ? 'Assistante RH' : 'Responsable hiérarchique'}
          items={sidebarItems}
          onLogout={handleLogout}
        />
      )}

      {/* En-tête principal */}
      <header className={`app-header ${showManagerDocumentHeader ? 'manager-document-header' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">P</div>
          <div className="logo-text">
            <h1>{showManagerDocumentHeader ? 'Premium Maroc' : 'Groupe Premium Maroc'}</h1>
            <p>{showManagerDocumentHeader ? 'Espace Responsable' : "Portail RH & Suivi des Périodes d'Essai"}</p>
          </div>
        </div>

        <nav className="app-nav">
          <button 
            className={`nav-link ${currentScreen.startsWith('dashboard') || currentScreen === 'employe_detail' ? 'active' : ''}`}
            onClick={navigateToDashboard}
          >
            <Briefcase size={16} /> {showManagerDocumentHeader ? "Fiche d'évaluation" : "Suivi des Périodes d'Essai"}
          </button>
          
          {currentUser.role === 'RH' && (
            <button 
              className={`nav-link ${currentScreen === 'managers_list' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('managers_list')}
            >
              <Users size={16} /> Répertoire Responsables
            </button>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {currentUser.display_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentUser.role === 'RH' ? 'Administrateur' : 'Responsable Hiérarchique'}
            </div>
          </div>
          
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="var(--primary)" />
          </div>

          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem',
              marginLeft: '0.25rem'
            }}
            title="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Routeur de vues */}
      <main className="app-main">
        {appError && <div className="employee-modal-error" role="alert">{appError}</div>}
        {managerLoading && <LoadingState label="Chargement de l'espace Manager..." />}
        {currentScreen === 'dashboard_rh' && currentUser.role === 'RH' && (
          <Dashboard 
            key={dashboardRefreshKey}
            onSelectEmploye={handleSelectEmploye}
            onNavigateToCreate={() => setCurrentScreen('create_employe')}
          />
        )}

        {currentScreen === 'dashboard_manager' && currentUser.role === 'Manager' && currentManager && managerSection === 'team' && (
          <DashboardManager 
            manager={currentManager}
            onNavigateToEvaluation={handleNavigateToEvaluation}
          />
        )}

        {currentScreen === 'dashboard_manager' && currentUser.role === 'Manager' && currentManager && managerSection === 'evaluations' && (
          <ManagerEvaluations
            manager={currentManager}
            onNavigateToEvaluation={handleNavigateToEvaluation}
          />
        )}

        {currentScreen === 'dashboard_manager' && currentUser.role === 'Manager' && currentManager && managerSection === 'profile' && (
          <ManagerProfile manager={currentManager} email={currentUser.email} />
        )}

        {currentScreen === 'create_employe' && currentUser.role === 'RH' && (
          <CreateEmploye 
            onBack={navigateToDashboard}
            onSuccess={handleEmployeCreated}
          />
        )}

        {currentScreen === 'employe_detail' && currentUser.role === 'RH' && selectedEmployeId !== null && (
          <EmployeDetail 
            employeId={selectedEmployeId}
            onBack={navigateToDashboard}
            onNavigateToEvaluation={handleNavigateToEvaluation}
            onNavigateToDecision={handleNavigateToDecision}
          />
        )}

        {currentScreen === 'evaluation_form' && selectedEvaluation && selectedEmployeData && (
          <EvaluationForm 
            evaluation={selectedEvaluation}
            employe={selectedEmployeData}
            onBack={navigateToDashboard}
            onSuccess={navigateToDashboard}
          />
        )}

        {currentScreen === 'decision_screen' && currentUser.role === 'RH' && selectedEmployeData && (
          <DecisionScreen 
            employe={selectedEmployeData}
            evaluations={evalList}
            onBack={() => handleSelectEmploye(selectedEmployeData.id)}
            onSuccess={() => handleSelectEmploye(selectedEmployeData.id)}
          />
        )}

        {currentScreen === 'managers_list' && currentUser.role === 'RH' && (
          <ResponsablesList 
            onBack={navigateToDashboard}
          />
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------
// Racine de l'application — wrap avec AuthProvider
// -------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
