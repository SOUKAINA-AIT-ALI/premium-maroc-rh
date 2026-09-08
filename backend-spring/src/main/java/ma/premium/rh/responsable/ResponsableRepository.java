package ma.premium.rh.responsable;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponsableRepository extends JpaRepository<Responsable, Long> {

    List<Responsable> findAllByOrderByNomCompletAsc();

    boolean existsByEmailIgnoreCase(String email);
}
