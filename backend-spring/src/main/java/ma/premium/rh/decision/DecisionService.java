package ma.premium.rh.decision;

import java.util.List;
import java.util.Locale;

import ma.premium.rh.employe.Employe;
import ma.premium.rh.employe.EmployeService;
import ma.premium.rh.error.ApiException;
import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.evaluation.EvaluationService;
import ma.premium.rh.evaluation.EvaluationStatut;
import ma.premium.rh.storage.DocumentStorageService;

import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final EmployeService employeService;
    private final EvaluationService evaluationService;
    private final DocumentStorageService storageService;

    public DecisionService(DecisionRepository decisionRepository, EmployeService employeService,
                           EvaluationService evaluationService, DocumentStorageService storageService) {
        this.decisionRepository = decisionRepository;
        this.employeService = employeService;
        this.evaluationService = evaluationService;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<DecisionResponse> findAll(Long employeId) {
        if (employeId != null) {
            return decisionRepository.findByEmployeId(employeId)
                    .map(DecisionResponse::fromEntity).stream().toList();
        }
        return decisionRepository.findAll().stream().map(DecisionResponse::fromEntity).toList();
    }

    @Transactional
    public DecisionResponse create(DecisionRequest request) {
        if (decisionRepository.existsByEmployeId(request.employeId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Une décision existe déjà pour cet employé.");
        }
        Employe employe = employeService.getEntity(request.employeId());
        Evaluation evaluation = evaluationService.getEntity(request.evaluationId());
        if (!evaluation.getEmploye().getId().equals(employe.getId()) || evaluation.getType() != 2) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "La décision doit utiliser l'évaluation de type 2 du même employé.");
        }
        if (evaluation.getStatut() != EvaluationStatut.RECU) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "L'évaluation finale doit être reçue avant la décision.");
        }
        DecisionStatut statut;
        try {
            statut = DecisionStatut.valueOf(request.statut().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Le statut doit être valide ou rompu.");
        }
        Decision decision = decisionRepository.save(new Decision(
                employe, evaluation, statut, request.dateEffet(), request.axesAmelioration()
        ));
        decision.definirDocumentPdfUrl("/api/decisions/" + decision.getId() + "/document");
        return DecisionResponse.fromEntity(decision);
    }

    @Transactional
    public DecisionResponse uploadSigned(Long id, MultipartFile file) {
        Decision decision = getEntity(id);
        decision.definirDocumentSigneUrl(storageService.save(file));
        return DecisionResponse.fromEntity(decision);
    }

    @Transactional(readOnly = true)
    public Decision getEntity(Long id) {
        return decisionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Décision introuvable."));
    }

    @Transactional(readOnly = true)
    public String printableDocument(Long id) {
        Decision d = getEntity(id);
        return "Décision de période d'essai\nEmployé: " + d.getEmploye().getNomComplet()
                + "\nStatut: " + d.getStatut() + "\nDate d'effet: " + d.getDateEffet()
                + "\nAxes d'amélioration: " + (d.getAxesAmelioration() == null ? "" : d.getAxesAmelioration());
    }

    @Transactional(readOnly = true)
    public Resource signedDocument(Long id) {
        Decision decision = getEntity(id);
        if (decision.getDocumentSigneUrl() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Document signé introuvable.");
        }
        return storageService.load(decision.getDocumentSigneUrl());
    }
}
