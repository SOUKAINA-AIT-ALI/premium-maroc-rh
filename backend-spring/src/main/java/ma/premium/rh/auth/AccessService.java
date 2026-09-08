package ma.premium.rh.auth;

import ma.premium.rh.decision.DecisionRepository;
import ma.premium.rh.employe.EmployeRepository;
import ma.premium.rh.error.ApiException;
import ma.premium.rh.evaluation.EvaluationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component("access")
public class AccessService {

    private final EmployeRepository employeRepository;
    private final EvaluationRepository evaluationRepository;
    private final DecisionRepository decisionRepository;

    public AccessService(EmployeRepository employeRepository,
                         EvaluationRepository evaluationRepository,
                         DecisionRepository decisionRepository) {
        this.employeRepository = employeRepository;
        this.evaluationRepository = evaluationRepository;
        this.decisionRepository = decisionRepository;
    }

    public boolean isRh(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_RH"));
    }

    public Long managerId(Authentication authentication) {
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            throw forbidden();
        }
        Number id = jwtAuthentication.getToken().getClaim("responsable_id");
        if (id == null) throw forbidden();
        return id.longValue();
    }

    public boolean canAccessResponsable(Authentication authentication, Long responsableId) {
        return isRh(authentication) || managerId(authentication).equals(responsableId);
    }

    public boolean canAccessEmploye(Authentication authentication, Long employeId) {
        return isRh(authentication)
                || employeRepository.existsByIdAndResponsableId(employeId, managerId(authentication));
    }

    public boolean canAccessEvaluation(Authentication authentication, Long evaluationId) {
        return isRh(authentication)
                || evaluationRepository.existsByIdAndEmployeResponsableId(evaluationId, managerId(authentication));
    }

    public boolean canAccessDecision(Authentication authentication, Long decisionId) {
        return isRh(authentication)
                || decisionRepository.existsByIdAndEmployeResponsableId(decisionId, managerId(authentication));
    }

    public ApiException forbidden() {
        return new ApiException(HttpStatus.FORBIDDEN,
                "Vous n'êtes pas autorisé à accéder à cette ressource.");
    }
}
