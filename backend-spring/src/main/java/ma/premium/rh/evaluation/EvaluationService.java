package ma.premium.rh.evaluation;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import ma.premium.rh.error.ApiException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;

    public EvaluationService(EvaluationRepository evaluationRepository) {
        this.evaluationRepository = evaluationRepository;
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> findAll(Long employeId, Long responsableId) {
        List<Evaluation> evaluations;
        if (employeId != null) {
            evaluations = evaluationRepository.findByEmployeIdOrderByTypeAsc(employeId);
        } else if (responsableId != null) {
            evaluations = evaluationRepository.findByEmployeResponsableId(responsableId);
        } else {
            evaluations = evaluationRepository.findAll();
        }
        return evaluations.stream().map(EvaluationResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public EvaluationResponse findById(Long id) {
        return EvaluationResponse.fromEntity(getEntity(id));
    }

    @Transactional
    public EvaluationResponse submit(Long id, EvaluationSubmitRequest request) {
        Evaluation evaluation = getEntity(id);
        if (evaluation.getStatut() == EvaluationStatut.RECU) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "L'évaluation a déjà été soumise.");
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(evaluation.getDatePrevueEnvoi())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "L'évaluation ne peut pas être soumise avant le " + evaluation.getDatePrevueEnvoi() + ".");
        }

        evaluation.soumettre(
                request.notes().stream().map(EvaluationSubmitRequest.NoteRequest::toValue).toList(),
                parse(ObjectifsStatut.class, request.objectifsStatut()), request.objectifsCommentaires(),
                request.appreciationsGenerales(), request.pointsForts(), request.axesAmelioration(),
                parse(RecommandationStatut.class, request.recommandationStatut()),
                request.recommandationDateEffet(), request.recommandationCommentaires(), today
        );
        return EvaluationResponse.fromEntity(evaluation);
    }

    @Transactional
    public EvaluationResponse updateNoteRh(Long id, NoteRhRequest request) {
        Evaluation evaluation = getEntity(id);
        evaluation.modifierNoteInterneRh(request.noteInterneRh());
        return EvaluationResponse.fromEntity(evaluation);
    }

    @Transactional(readOnly = true)
    public Evaluation getEntity(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Évaluation introuvable."));
    }

    private <E extends Enum<E>> E parse(Class<E> type, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Valeur invalide : " + value);
        }
    }
}
