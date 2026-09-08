export type DossierStatus = 'non_echue' | 'en_cours' | 'en_retard' | 'validee';

export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calculateDossierStatus = (
  dueDateValue: string | undefined,
  completed: boolean,
  currentDate: Date = new Date(),
  sentDateValue?: string
): DossierStatus => {
  if (completed) return 'validee';
  if (!dueDateValue) return 'non_echue';

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  const dueDate = parseLocalDate(dueDateValue);

  if (today.getTime() < dueDate.getTime()) return 'non_echue';

  const sentDate = sentDateValue ? parseLocalDate(sentDateValue) : dueDate;
  const responseDeadline = new Date(sentDate);
  responseDeadline.setDate(responseDeadline.getDate() + 7);
  return today.getTime() <= responseDeadline.getTime() ? 'en_cours' : 'en_retard';
};
