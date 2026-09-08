import { CalendarDays, Check, CircleCheck, Clock3, TriangleAlert } from 'lucide-react';
import type { Evaluation } from '../types';
import { getDynamicEvaluationStatus } from '../api';
import { parseLocalDate } from './progressStatus';
import type { DossierStatus } from './progressStatus';

export type { DossierStatus } from './progressStatus';

export interface ProgressInfo {
  phase1?: Evaluation;
  phase2?: Evaluation;
  active?: Evaluation;
  status: DossierStatus;
}

export const getProgressInfo = (evaluations: Evaluation[]): ProgressInfo => {
  const phase1 = evaluations.find(evaluation => evaluation.type === 1);
  const phase2 = evaluations.find(evaluation => evaluation.type === 2);

  const completed = phase1?.statut === 'recu' && phase2?.statut === 'recu';
  if (completed) return { phase1, phase2, active: phase2, status: 'validee' };

  const active = phase1?.statut !== 'recu' ? phase1 : phase2;
  if (!active) return { phase1, phase2, status: 'non_echue' };

  const evaluationStatus = getDynamicEvaluationStatus(active);
  const status: DossierStatus = evaluationStatus === 'en_retard'
    ? 'en_retard'
    : evaluationStatus === 'envoye'
      ? 'en_cours'
      : 'non_echue';

  return { phase1, phase2, active, status };
};

const getCountdown = (date: string, completed: boolean) => {
  if (completed) return { text: 'terminée', color: 'var(--success)' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseLocalDate(date);
  const days = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);

  if (days > 0) return { text: `dans ${days} j`, color: 'var(--text-muted)' };
  if (days === 0) return { text: "aujourd'hui", color: 'var(--warning)' };
  return { text: `retard de ${Math.abs(days)} j`, color: 'var(--danger)' };
};

const phaseColor = (evaluation: Evaluation | undefined, active: Evaluation | undefined) => {
  if (evaluation?.statut === 'recu') return 'var(--success)';
  if (evaluation && evaluation.id === active?.id) return 'var(--warning)';
  return '#cbd5e1';
};

export const PhaseStepper = ({ info }: { info: ProgressInfo }) => (
  <div style={{ display: 'flex', alignItems: 'center', minWidth: '88px' }} aria-label="Progression des évaluations">
    {[info.phase1, info.phase2].map((evaluation, index) => {
      const color = phaseColor(evaluation, info.active);
      const completed = evaluation?.statut === 'recu';
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          {index > 0 && <span style={{ width: '22px', height: '2px', background: color }} />}
          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: color, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>
            {completed ? <Check size={14} /> : `P${index + 1}`}
          </span>
        </div>
      );
    })}
  </div>
);

export const ActiveDeadline = ({ info }: { info: ProgressInfo }) => {
  if (!info.active) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const completed = info.status === 'validee';
  const countdown = getCountdown(info.active.date_prevue_envoi, completed);
  return (
    <div>
      <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
        {parseLocalDate(info.active.date_prevue_envoi).toLocaleDateString('fr-FR')}
      </div>
      <div style={{ color: countdown.color, fontSize: '0.75rem', marginTop: '2px' }}>{countdown.text}</div>
    </div>
  );
};

const STATUS_CONFIG = {
  non_echue: { label: 'Non échue', css: 'badge-info', Icon: CalendarDays },
  en_cours: { label: 'En cours', css: 'badge-warning', Icon: Clock3 },
  en_retard: { label: 'En retard', css: 'badge-danger', Icon: TriangleAlert },
  validee: { label: 'Évaluée', css: 'badge-success', Icon: CircleCheck }
};

export const ProgressStatus = ({ status }: { status: DossierStatus }) => {
  const { label, css, Icon } = STATUS_CONFIG[status];
  return (
    <span className={`badge ${css}`} style={{ whiteSpace: 'nowrap' }}>
      <Icon size={13} style={{ marginRight: '4px' }} /> {label}
    </span>
  );
};
