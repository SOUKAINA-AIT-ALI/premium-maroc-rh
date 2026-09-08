export interface Responsable {
  id: number;
  nom_complet: string;
  email: string;
}

export type AuthUser = {
  email: string;
  role: 'RH' | 'Manager';
  display_name: string;
  responsable_id?: number;
};

export type AuthSession = AuthUser & {
  access_token: string;
  expires_at: string;
};

export interface Critere {
  id: string;
  libelle: string;
  categorie: 'competences_professionnelles' | 'aptitudes_personnelles' | 'bonnes_pratiques_qse';
}

export interface CritereNote {
  critere_id: string;
  note: number;
  commentaire: string;
}

export interface Evaluation {
  id: number;
  employe_id: number;
  type: 1 | 2;
  date_prevue_envoi: string;
  date_envoi_reelle?: string;
  date_limite_reponse?: string;
  date_fin_periode?: string;
  date_reception?: string;
  statut: 'a_venir' | 'envoye' | 'en_retard' | 'recu';
  notes: CritereNote[];
  objectifs_statut?: 'depasses' | 'atteints' | 'partiellement_atteints' | '';
  objectifs_commentaires?: string;
  appreciations_generales?: string;
  points_forts?: string;
  axes_amelioration?: string;
  recommandation_statut?: 'validation' | 'rupture' | '';
  recommandation_date_effet?: string;
  recommandation_commentaires?: string;
  note_interne_rh?: string;
}

export interface Decision {
  id: number;
  employe_id: number;
  evaluation_id: number;
  statut: 'valide' | 'rompu';
  date_effet: string;
  axes_amelioration?: string;
  document_pdf_url?: string;
  document_signe_url?: string;
}

export interface Employe {
  id: number;
  matricule: string;
  nom_complet: string;
  poste: string;
  societe: string;
  responsable_id: number;
  date_embauche: string;
  evaluations?: Evaluation[];
  decision?: Decision;
}

export const CRITERES_EVALUATION: Critere[] = [
  { id: 'c1', libelle: 'Compréhension du poste, des missions et du périmètre', categorie: 'competences_professionnelles' },
  { id: 'c2', libelle: 'Qualité du travail rendu', categorie: 'competences_professionnelles' },
  { id: 'c3', libelle: 'Respect des délais et rythme d’exécution', categorie: 'competences_professionnelles' },
  { id: 'c4', libelle: 'Capacité d’analyse et de résolution des problèmes', categorie: 'competences_professionnelles' },
  { id: 'c5', libelle: 'Prise en main des outils et méthodes de travail', categorie: 'competences_professionnelles' },
  { id: 'c6', libelle: 'Application des procédures et consignes internes', categorie: 'competences_professionnelles' },
  { id: 'c7', libelle: 'Organisation et gestion des priorités', categorie: 'competences_professionnelles' },
  { id: 'c8', libelle: 'Fiabilité des informations transmises', categorie: 'competences_professionnelles' },
  { id: 'c9', libelle: 'Capacité à proposer des améliorations', categorie: 'competences_professionnelles' },
  { id: 'c10', libelle: 'Adaptation aux exigences du poste', categorie: 'competences_professionnelles' },
  { id: 'a1', libelle: 'Adaptation à l’environnement de travail', categorie: 'aptitudes_personnelles' },
  { id: 'a2', libelle: 'Implication et engagement dans le travail', categorie: 'aptitudes_personnelles' },
  { id: 'a3', libelle: 'Sens du service et orientation client', categorie: 'aptitudes_personnelles' },
  { id: 'a4', libelle: 'Réactivité et prise d’initiative', categorie: 'aptitudes_personnelles' },
  { id: 'a5', libelle: 'Autonomie progressive', categorie: 'aptitudes_personnelles' },
  { id: 'a6', libelle: 'Ponctualité et assiduité', categorie: 'aptitudes_personnelles' },
  { id: 'a7', libelle: 'Conscience professionnelle', categorie: 'aptitudes_personnelles' },
  { id: 'a8', libelle: 'Maîtrise de soi et posture professionnelle', categorie: 'aptitudes_personnelles' },
  { id: 'a9', libelle: 'Esprit d’équipe et collaboration', categorie: 'aptitudes_personnelles' },
  { id: 'a10', libelle: 'Qualité de la communication', categorie: 'aptitudes_personnelles' },
  { id: 'a11', libelle: 'Respect de la hiérarchie et du cadre', categorie: 'aptitudes_personnelles' },
  { id: 'q1', libelle: 'Connaissance des règles et procédures QSE', categorie: 'bonnes_pratiques_qse' },
  { id: 'q2', libelle: 'Respect des consignes de sécurité', categorie: 'bonnes_pratiques_qse' },
  { id: 'q3', libelle: 'Respect de l’environnement et du matériel', categorie: 'bonnes_pratiques_qse' },
];
