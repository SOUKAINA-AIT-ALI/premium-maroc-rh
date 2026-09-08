import { getDynamicEvaluationStatus } from '../api';
import type { Evaluation } from '../types';

export type ManagerEvaluationGroup = 'todo' | 'upcoming' | 'completed';
export type ManagerEvaluationDynamicStatus = ReturnType<typeof getDynamicEvaluationStatus>;

export const getManagerEvaluationGroup = (
  evaluation: Evaluation,
  referenceDate: Date = new Date()
): ManagerEvaluationGroup => {
  const status = getDynamicEvaluationStatus(evaluation, referenceDate);
  if (status === 'recu') return 'completed';
  if (status === 'envoye' || status === 'en_retard') return 'todo';
  return 'upcoming';
};

export const countManagerEvaluationGroups = (
  evaluations: Evaluation[],
  referenceDate: Date = new Date()
): Record<ManagerEvaluationGroup, number> => evaluations.reduce((counts, evaluation) => {
  counts[getManagerEvaluationGroup(evaluation, referenceDate)] += 1;
  return counts;
}, { todo: 0, upcoming: 0, completed: 0 });
