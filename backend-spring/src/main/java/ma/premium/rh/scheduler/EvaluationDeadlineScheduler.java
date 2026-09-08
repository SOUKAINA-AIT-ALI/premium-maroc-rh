package ma.premium.rh.scheduler;

import java.time.LocalDate;
import java.util.List;

import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.evaluation.EvaluationRepository;
import ma.premium.rh.evaluation.EvaluationStatut;
import ma.premium.rh.notification.EvaluationMailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EvaluationDeadlineScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(EvaluationDeadlineScheduler.class);

    private final EvaluationRepository evaluationRepository;
    private final EvaluationMailService evaluationMailService;

    public EvaluationDeadlineScheduler(
            EvaluationRepository evaluationRepository,
            EvaluationMailService evaluationMailService
    ) {
        this.evaluationRepository = evaluationRepository;
        this.evaluationMailService = evaluationMailService;
    }

    @Scheduled(cron = "${app.evaluations.deadline-cron:0 0 8 * * *}")
    @Transactional
    public void updateDeadlines() {
        updateDeadlines(LocalDate.now());
    }

    void updateDeadlines(LocalDate today) {

        List<Evaluation> due = evaluationRepository
                .findByStatutAndDatePrevueEnvoiLessThanEqual(EvaluationStatut.A_VENIR, today);
        due.forEach(evaluation -> sendAndMarkEvaluation(evaluation, today));

        List<Evaluation> overdue = evaluationRepository
                .findByStatutInAndDateEnvoiReelleBefore(
                        List.of(EvaluationStatut.ENVOYE), today.minusDays(7)
                );
        overdue.forEach(Evaluation::marquerEnRetard);
    }

    private void sendAndMarkEvaluation(Evaluation evaluation, LocalDate today) {
        try {
            if (evaluationMailService.sendEvaluationRequest(evaluation, today)) {
                evaluation.marquerEnvoyee(today);
            }
        } catch (RuntimeException exception) {
            LOGGER.error(
                    "Échec de l'envoi automatique de l'évaluation {} au responsable {}.",
                    evaluation.getId(), evaluation.getEmploye().getResponsable().getEmail(), exception
            );
        }
    }
}
