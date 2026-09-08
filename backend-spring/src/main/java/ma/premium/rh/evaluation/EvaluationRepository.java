package ma.premium.rh.evaluation;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByEmployeIdOrderByTypeAsc(Long employeId);

    List<Evaluation> findByEmployeResponsableId(Long responsableId);

    boolean existsByIdAndEmployeResponsableId(Long id, Long responsableId);

    List<Evaluation> findByStatutAndDatePrevueEnvoiLessThanEqual(
            EvaluationStatut statut,
            LocalDate date
    );

    List<Evaluation> findByStatutInAndDateEnvoiReelleBefore(
            Collection<EvaluationStatut> statuts,
            LocalDate date
    );
}
