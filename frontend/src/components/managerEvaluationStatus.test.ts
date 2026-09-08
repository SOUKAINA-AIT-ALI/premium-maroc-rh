import { describe, expect, it } from 'vitest';
import { getDynamicEvaluationStatus } from '../api';
import type { Evaluation } from '../types';
import { countManagerEvaluationGroups, getManagerEvaluationGroup } from './managerEvaluationStatus';

const referenceDate = new Date('2026-09-08T12:00:00');

const evaluation = (
  statut: Evaluation['statut'],
  datePrevueEnvoi: string,
  overrides: Partial<Evaluation> = {}
): Evaluation => ({
  id: 1,
  employe_id: 10,
  type: 1,
  date_prevue_envoi: datePrevueEnvoi,
  statut,
  notes: [],
  ...overrides,
});

describe('classement des évaluations Manager', () => {
  it('classe une évaluation envoyée dans À faire', () => {
    expect(getManagerEvaluationGroup(evaluation('envoye', '2026-09-08'), referenceDate)).toBe('todo');
  });

  it('classe une évaluation explicitement en retard dans À faire', () => {
    expect(getManagerEvaluationGroup(evaluation('en_retard', '2026-09-10'), referenceDate)).toBe('todo');
  });

  it('détecte comme retard une évaluation non complétée dont l’échéance est dépassée', () => {
    expect(getManagerEvaluationGroup(evaluation('a_venir', '2026-09-07'), referenceDate)).toBe('todo');
  });

  it('classe les échéances futures, proches ou lointaines, dans À venir', () => {
    expect(getManagerEvaluationGroup(evaluation('a_venir', '2026-09-12'), referenceDate)).toBe('upcoming');
    expect(getManagerEvaluationGroup(evaluation('a_venir', '2026-11-04'), referenceDate)).toBe('upcoming');
  });

  it('classe une évaluation reçue dans Terminées même si son échéance est passée', () => {
    expect(getManagerEvaluationGroup(evaluation('recu', '2026-08-01'), referenceDate)).toBe('completed');
  });

  it('reste En cours jusqu’à J+7 inclus puis passe En retard à J+8', () => {
    const sent = evaluation('envoye', '2026-09-01', { date_envoi_reelle: '2026-09-01' });
    expect(getDynamicEvaluationStatus(sent, new Date('2026-09-08T12:00:00'))).toBe('envoye');
    expect(getDynamicEvaluationStatus(sent, new Date('2026-09-09T12:00:00'))).toBe('en_retard');
  });

  it('applique aussi automatiquement la fenêtre J+7 à partir de l’échéance', () => {
    const due = evaluation('a_venir', '2026-09-08');
    expect(getDynamicEvaluationStatus(due, new Date('2026-09-08T12:00:00'))).toBe('envoye');
    expect(getDynamicEvaluationStatus(due, new Date('2026-09-15T12:00:00'))).toBe('envoye');
    expect(getDynamicEvaluationStatus(due, new Date('2026-09-16T12:00:00'))).toBe('en_retard');
  });

  it('laisse la phase 2 À venir tant que sa date n’est pas atteinte', () => {
    const phase2 = evaluation('a_venir', '2026-12-08', { type: 2 });
    expect(getDynamicEvaluationStatus(phase2, referenceDate)).toBe('a_venir');
    expect(getManagerEvaluationGroup(phase2, referenceDate)).toBe('upcoming');
  });

  it('compte correctement les phases P1 et P2 dans les trois groupes', () => {
    const counts = countManagerEvaluationGroups([
      evaluation('envoye', '2026-09-08', { id: 1, type: 1 }),
      evaluation('en_retard', '2026-09-01', { id: 2, type: 2 }),
      evaluation('a_venir', '2026-11-04', { id: 3, type: 1 }),
      evaluation('recu', '2026-08-01', { id: 4, type: 2 }),
    ], referenceDate);

    expect(counts).toEqual({ todo: 2, upcoming: 1, completed: 1 });
  });
});
