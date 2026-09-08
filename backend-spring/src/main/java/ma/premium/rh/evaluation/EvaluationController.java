package ma.premium.rh.evaluation;

import java.util.List;

import jakarta.validation.Valid;
import ma.premium.rh.auth.AccessService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final AccessService accessService;

    public EvaluationController(EvaluationService evaluationService, AccessService accessService) {
        this.evaluationService = evaluationService;
        this.accessService = accessService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'MANAGER') and (#employeId == null or @access.canAccessEmploye(authentication, #employeId))")
    public List<EvaluationResponse> findAll(
            @RequestParam(name = "employe_id", required = false) Long employeId,
            Authentication authentication
    ) {
        Long responsableId = accessService.isRh(authentication) ? null : accessService.managerId(authentication);
        return evaluationService.findAll(employeId, responsableId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@access.canAccessEvaluation(authentication, #id)")
    public EvaluationResponse findById(@PathVariable Long id) {
        return evaluationService.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') and @access.canAccessEvaluation(authentication, #id)")
    public EvaluationResponse submit(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationSubmitRequest request
    ) {
        return evaluationService.submit(id, request);
    }

    @PatchMapping("/{id}/note-rh")
    @PreAuthorize("hasRole('RH')")
    public EvaluationResponse updateNoteRh(
            @PathVariable Long id,
            @RequestBody NoteRhRequest request
    ) {
        return evaluationService.updateNoteRh(id, request);
    }
}
