package ma.premium.rh.scheduler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import ma.premium.rh.employe.Employe;
import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.evaluation.EvaluationRepository;
import ma.premium.rh.evaluation.EvaluationStatut;
import ma.premium.rh.notification.EvaluationMailService;
import ma.premium.rh.responsable.Responsable;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EvaluationDeadlineSchedulerTest {

    @Mock EvaluationRepository evaluationRepository;
    @Mock EvaluationMailService mailService;

    private EvaluationDeadlineScheduler scheduler;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        scheduler = new EvaluationDeadlineScheduler(evaluationRepository, mailService);
        today = LocalDate.of(2026, 9, 8);
    }

    @Test
    void envoieLaFichePuisPasseEnCoursLeJourDeLecheance() {
        Evaluation due = evaluation((short) 1, today);
        when(evaluationRepository.findByStatutAndDatePrevueEnvoiLessThanEqual(EvaluationStatut.A_VENIR, today))
                .thenReturn(List.of(due));
        when(evaluationRepository.findByStatutInAndDateEnvoiReelleBefore(
                List.of(EvaluationStatut.ENVOYE), today.minusDays(7))).thenReturn(List.of());
        when(mailService.sendEvaluationRequest(due, today)).thenReturn(true);

        scheduler.updateDeadlines(today);

        assertThat(due.getStatut()).isEqualTo(EvaluationStatut.ENVOYE);
        assertThat(due.getDateEnvoiReelle()).isEqualTo(today);
        verify(mailService).sendEvaluationRequest(due, today);
    }

    @Test
    void neMarquePasLevaluationEnvoyeeSiLemailEchoue() {
        Evaluation due = evaluation((short) 1, today);
        when(evaluationRepository.findByStatutAndDatePrevueEnvoiLessThanEqual(EvaluationStatut.A_VENIR, today))
                .thenReturn(List.of(due));
        when(evaluationRepository.findByStatutInAndDateEnvoiReelleBefore(
                List.of(EvaluationStatut.ENVOYE), today.minusDays(7))).thenReturn(List.of());
        when(mailService.sendEvaluationRequest(due, today)).thenReturn(false);

        scheduler.updateDeadlines(today);

        assertThat(due.getStatut()).isEqualTo(EvaluationStatut.A_VENIR);
        assertThat(due.getDateEnvoiReelle()).isNull();
    }

    @Test
    void passeEnRetardUniquementApresSeptJoursDepuisLenvoi() {
        Evaluation overdue = evaluation((short) 1, today.minusMonths(2));
        overdue.marquerEnvoyee(today.minusDays(8));
        when(evaluationRepository.findByStatutAndDatePrevueEnvoiLessThanEqual(EvaluationStatut.A_VENIR, today))
                .thenReturn(List.of());
        when(evaluationRepository.findByStatutInAndDateEnvoiReelleBefore(
                List.of(EvaluationStatut.ENVOYE), today.minusDays(7))).thenReturn(List.of(overdue));

        scheduler.updateDeadlines(today);

        assertThat(overdue.getStatut()).isEqualTo(EvaluationStatut.EN_RETARD);
        verify(evaluationRepository).findByStatutInAndDateEnvoiReelleBefore(
                List.of(EvaluationStatut.ENVOYE), LocalDate.of(2026, 9, 1));
    }

    private Evaluation evaluation(short phase, LocalDate dueDate) {
        Responsable responsable = new Responsable("Adil SOUSSI", "a.soussi@premium.ma");
        Employe employe = new Employe(
                "M001", "Karime Test", "Chef de projet", "Premium", responsable,
                LocalDate.of(2026, 7, 8)
        );
        return new Evaluation(employe, phase, dueDate);
    }
}
