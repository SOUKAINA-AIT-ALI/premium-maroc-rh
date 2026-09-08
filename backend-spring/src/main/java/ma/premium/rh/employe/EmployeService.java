package ma.premium.rh.employe;

import java.util.List;
import java.util.Locale;

import ma.premium.rh.error.ApiException;
import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.evaluation.EvaluationRepository;
import ma.premium.rh.responsable.Responsable;
import ma.premium.rh.responsable.ResponsableRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeService {

    private final EmployeRepository employeRepository;
    private final ResponsableRepository responsableRepository;
    private final EvaluationRepository evaluationRepository;

    public EmployeService(
            EmployeRepository employeRepository,
            ResponsableRepository responsableRepository,
            EvaluationRepository evaluationRepository
    ) {
        this.employeRepository = employeRepository;
        this.responsableRepository = responsableRepository;
        this.evaluationRepository = evaluationRepository;
    }

    @Transactional(readOnly = true)
    public List<EmployeResponse> findAll(String search, Long responsableId) {
        String normalized = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        return employeRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(e -> responsableId == null || e.getResponsable().getId().equals(responsableId))
                .filter(e -> normalized.isBlank()
                        || e.getNomComplet().toLowerCase(Locale.ROOT).contains(normalized)
                        || e.getMatricule().toLowerCase(Locale.ROOT).contains(normalized))
                .map(EmployeResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeResponse findById(Long id) {
        return EmployeResponse.fromEntity(getEntity(id));
    }

    @Transactional
    public EmployeResponse create(EmployeRequest request) {
        String matricule = request.matricule().trim().toUpperCase(Locale.ROOT);
        if (employeRepository.existsByMatriculeIgnoreCase(matricule)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ce matricule existe déjà.");
        }
        Responsable responsable = responsableRepository.findById(request.responsableId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Responsable introuvable."));

        Employe employe = employeRepository.save(new Employe(
                matricule, request.nomComplet().trim(), request.poste().trim(),
                request.societe().trim(),
                responsable, request.dateEmbauche()
        ));

        evaluationRepository.saveAll(List.of(
                new Evaluation(employe, (short) 1, request.dateEmbauche().plusMonths(2)),
                new Evaluation(employe, (short) 2, request.dateEmbauche().plusMonths(5))
        ));
        return EmployeResponse.fromEntity(employe);
    }

    @Transactional(readOnly = true)
    public Employe getEntity(Long id) {
        return employeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employé introuvable."));
    }
}
