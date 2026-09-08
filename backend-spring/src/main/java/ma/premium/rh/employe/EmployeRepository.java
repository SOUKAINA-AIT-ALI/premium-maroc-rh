package ma.premium.rh.employe;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeRepository extends JpaRepository<Employe, Long> {

    List<Employe> findAllByOrderByCreatedAtDesc();

    List<Employe> findByResponsableIdOrderByNomCompletAsc(Long responsableId);

    boolean existsByMatriculeIgnoreCase(String matricule);

    boolean existsByIdAndResponsableId(Long id, Long responsableId);
}
