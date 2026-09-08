import { describe, expect, it } from 'vitest';
import { getRhSidebarSection, shouldShowWorkspaceSidebar } from './navigation';

describe('layout de navigation Assistante RH', () => {
  it.each([
    'dashboard_rh',
    'managers_list',
    'create_employe',
    'employe_detail',
    'decision_screen'
  ] as const)('conserve la sidebar sur l’écran %s', screen => {
    expect(shouldShowWorkspaceSidebar(screen)).toBe(true);
  });

  it('retire uniquement la sidebar du formulaire officiel', () => {
    expect(shouldShowWorkspaceSidebar('evaluation_form')).toBe(false);
  });

  it('active le lien adapté à chaque écran RH', () => {
    expect(getRhSidebarSection('dashboard_rh')).toBe('dashboard');
    expect(getRhSidebarSection('employe_detail')).toBe('dashboard');
    expect(getRhSidebarSection('decision_screen')).toBe('dashboard');
    expect(getRhSidebarSection('managers_list')).toBe('responsables');
    expect(getRhSidebarSection('create_employe')).toBe('create');
  });
});
