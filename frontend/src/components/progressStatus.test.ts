import { describe, expect, it } from 'vitest';
import { calculateDossierStatus } from './progressStatus';

describe('calculateDossierStatus', () => {
  const today = new Date(2026, 7, 11, 15, 30);

  it('garde une évaluation à +10 jours en statut Non échue', () => {
    expect(calculateDossierStatus('2026-08-21', false, today)).toBe('non_echue');
  });

  it('garde toute échéance future en Non échue, même si elle est très proche', () => {
    expect(calculateDossierStatus('2026-08-12', false, today)).toBe('non_echue');
  });

  it('passe En cours le jour de l’échéance', () => {
    expect(calculateDossierStatus('2026-08-11', false, today)).toBe('en_cours');
  });

  it('reste En cours pendant les 7 jours suivant l’envoi', () => {
    expect(calculateDossierStatus('2026-08-01', false, today, '2026-08-04')).toBe('en_cours');
  });

  it('passe En retard seulement après les 7 jours de réponse', () => {
    expect(calculateDossierStatus('2026-08-01', false, today, '2026-08-03')).toBe('en_retard');
  });

  it('conserve Validée lorsque les deux phases sont terminées', () => {
    expect(calculateDossierStatus('2026-08-01', true, today)).toBe('validee');
  });

  it('classe correctement tous les dossiers de démonstration au 11 août 2026', () => {
    expect(calculateDossierStatus('2026-07-20', true, today)).toBe('validee'); // Simohamed
    expect(calculateDossierStatus('2026-09-01', false, today)).toBe('non_echue'); // Nezha
    expect(calculateDossierStatus('2026-09-22', false, today)).toBe('non_echue'); // Tariq
  });
});
