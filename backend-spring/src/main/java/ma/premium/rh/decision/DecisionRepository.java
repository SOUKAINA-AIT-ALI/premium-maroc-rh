package ma.premium.rh.decision;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionRepository extends JpaRepository<Decision, Long> {

    Optional<Decision> findByEmployeId(Long employeId);

    Optional<Decision> findByEvaluationId(Long evaluationId);

    boolean existsByEmployeId(Long employeId);

    boolean existsByIdAndEmployeResponsableId(Long id, Long responsableId);
}
