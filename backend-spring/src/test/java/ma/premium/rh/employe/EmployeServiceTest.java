package ma.premium.rh.employe;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.evaluation.EvaluationRepository;
import ma.premium.rh.evaluation.EvaluationResponse;
import ma.premium.rh.responsable.Responsable;
import ma.premium.rh.responsable.ResponsableRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmployeServiceTest {

    @Mock EmployeRepository employeRepository;
    @Mock ResponsableRepository responsableRepository;
    @Mock EvaluationRepository evaluationRepository;
    @InjectMocks EmployeService employeService;

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void creeLesDeuxEcheancesEtLesDeuxFinsDePeriode() {
        LocalDate dateEmbauche = LocalDate.of(2026, 7, 8);
        Responsable responsable = new Responsable("Adil SOUSSI", "a.soussi@premium.ma");
        when(responsableRepository.findById(1L)).thenReturn(Optional.of(responsable));
        when(employeRepository.save(any(Employe.class))).thenAnswer(invocation -> invocation.getArgument(0));

        employeService.create(new EmployeRequest(
                "M001", "Karime Test", "Chef de projet", "Premium", 1L, dateEmbauche
        ));

        ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);
        verify(evaluationRepository).saveAll(captor.capture());
        List<Evaluation> evaluations = (List<Evaluation>) captor.getValue();

        assertThat(evaluations).hasSize(2);
        assertThat(evaluations.get(0).getType()).isEqualTo((short) 1);
        assertThat(evaluations.get(0).getDatePrevueEnvoi()).isEqualTo(LocalDate.of(2026, 9, 8));
        assertThat(EvaluationResponse.fromEntity(evaluations.get(0)).dateFinPeriode())
                .isEqualTo(LocalDate.of(2026, 10, 8));
        assertThat(evaluations.get(1).getType()).isEqualTo((short) 2);
        assertThat(evaluations.get(1).getDatePrevueEnvoi()).isEqualTo(LocalDate.of(2026, 12, 8));
        assertThat(EvaluationResponse.fromEntity(evaluations.get(1)).dateFinPeriode())
                .isEqualTo(LocalDate.of(2027, 1, 8));
    }
}
