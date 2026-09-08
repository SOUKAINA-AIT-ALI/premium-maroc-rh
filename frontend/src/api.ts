import type { AuthSession, CritereNote, Decision, Employe, Evaluation, Responsable } from './types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

const authorizationHeaders = (): HeadersInit => accessToken
  ? { Authorization: `Bearer ${accessToken}` }
  : {};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: init?.body instanceof FormData
        ? { ...authorizationHeaders(), ...init.headers }
        : { 'Content-Type': 'application/json', ...authorizationHeaders(), ...init?.headers },
    });
  } catch {
    throw new ApiError('Impossible de joindre le serveur. Vérifiez que le backend est démarré.', 0);
  }

  if (!response.ok) {
    let message = `Erreur serveur (${response.status}).`;
    try {
      const body = await response.json() as { message?: string; error?: string };
      message = body.message || body.error || message;
    } catch {
      // La réponse d'erreur ne contient pas de JSON exploitable.
    }
    if (response.status === 401) unauthorizedHandler?.();
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const api = {
  setAccessToken: (token: string | null) => { accessToken = token; },
  setUnauthorizedHandler: (handler: (() => void) | null) => { unauthorizedHandler = handler; },

  login: (email: string, password: string) =>
    request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  changePassword: (ancienMotDePasse: string, nouveauMotDePasse: string, confirmationMotDePasse: string) =>
    request<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        ancien_mot_de_passe: ancienMotDePasse,
        nouveau_mot_de_passe: nouveauMotDePasse,
        confirmation_mot_de_passe: confirmationMotDePasse,
      }),
    }),

  getResponsables: () => request<Responsable[]>('/api/responsables'),
  getResponsable: (id: number) => request<Responsable>(`/api/responsables/${id}`),
  createResponsable: (nom_complet: string, email: string) =>
    request<Responsable>('/api/responsables', {
      method: 'POST',
      body: JSON.stringify({ nom_complet, email }),
    }),

  getEmployes: (responsableId?: number) =>
    request<Employe[]>(`/api/employes${responsableId ? `?responsable_id=${responsableId}` : ''}`),
  getEmploye: (id: number) => request<Employe>(`/api/employes/${id}`),
  createEmploye: (employe: Omit<Employe, 'id' | 'evaluations' | 'decision'>) =>
    request<Employe>('/api/employes', { method: 'POST', body: JSON.stringify(employe) }),

  getEvaluations: (employeId?: number) =>
    request<Evaluation[]>(`/api/evaluations${employeId ? `?employe_id=${employeId}` : ''}`),
  getEvaluation: (id: number) => request<Evaluation>(`/api/evaluations/${id}`),
  submitEvaluation: (id: number, data: {
    notes: CritereNote[];
    objectifs_statut: string;
    objectifs_commentaires: string;
    appreciations_generales: string;
    points_forts: string;
    axes_amelioration: string;
    recommandation_statut: string;
    recommandation_date_effet: string | null;
    recommandation_commentaires: string;
  }) => request<Evaluation>(`/api/evaluations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateNoteRh: (id: number, note_interne_rh: string) =>
    request<Evaluation>(`/api/evaluations/${id}/note-rh`, {
      method: 'PATCH',
      body: JSON.stringify({ note_interne_rh }),
    }),

  getDecisions: (employeId?: number) =>
    request<Decision[]>(`/api/decisions${employeId ? `?employe_id=${employeId}` : ''}`),
  createDecision: (decision: Omit<Decision, 'id' | 'document_pdf_url' | 'document_signe_url'>) =>
    request<Decision>('/api/decisions', { method: 'POST', body: JSON.stringify(decision) }),
  uploadSignedDecision: (id: number, file: File) => {
    const data = new FormData();
    data.append('document_signe', file);
    return request<Decision>(`/api/decisions/${id}/document-signe`, { method: 'POST', body: data });
  },
  openProtectedDocument: async (path: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: authorizationHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) unauthorizedHandler?.();
      throw new ApiError(response.status === 403
        ? "Vous n'êtes pas autorisé à consulter ce document."
        : 'Impossible de télécharger le document.', response.status);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};

export const getDynamicEvaluationStatus = (evaluation: Evaluation, referenceDate: Date = new Date()): 'a_venir' | 'proche' | 'envoye' | 'en_retard' | 'recu' => {
  if (evaluation.statut === 'recu') return 'recu';
  if (evaluation.statut === 'en_retard') return 'en_retard';
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${evaluation.date_prevue_envoi}T00:00:00`);
  if (evaluation.date_envoi_reelle || evaluation.statut === 'envoye') {
    const sent = new Date(`${evaluation.date_envoi_reelle || evaluation.date_prevue_envoi}T00:00:00`);
    const responseDeadline = new Date(sent);
    responseDeadline.setDate(responseDeadline.getDate() + 7);
    return today > responseDeadline ? 'en_retard' : 'envoye';
  }
  if (due <= today) {
    const expectedResponseDeadline = new Date(due);
    expectedResponseDeadline.setDate(expectedResponseDeadline.getDate() + 7);
    return today > expectedResponseDeadline ? 'en_retard' : 'envoye';
  }
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000) <= 7 ? 'proche' : 'a_venir';
};

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
