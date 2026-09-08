export type Screen = 'dashboard_rh' | 'dashboard_manager' | 'create_employe' | 'employe_detail' | 'evaluation_form' | 'decision_screen' | 'managers_list';

export type RhSidebarSection = 'dashboard' | 'responsables' | 'create';

export const shouldShowWorkspaceSidebar = (screen: Screen) => screen !== 'evaluation_form';

export const getRhSidebarSection = (screen: Screen): RhSidebarSection => {
  if (screen === 'managers_list') return 'responsables';
  if (screen === 'create_employe') return 'create';
  return 'dashboard';
};
