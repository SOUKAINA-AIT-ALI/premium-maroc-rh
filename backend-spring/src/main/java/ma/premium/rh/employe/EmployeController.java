package ma.premium.rh.employe;

import java.util.List;

import jakarta.validation.Valid;
import ma.premium.rh.auth.AccessService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employes")
public class EmployeController {

    private final EmployeService employeService;
    private final AccessService accessService;

    public EmployeController(EmployeService employeService, AccessService accessService) {
        this.employeService = employeService;
        this.accessService = accessService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'MANAGER')")
    public List<EmployeResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(name = "responsable_id", required = false) Long responsableId,
            Authentication authentication
    ) {
        if (!accessService.isRh(authentication)) {
            Long authenticatedManagerId = accessService.managerId(authentication);
            if (responsableId != null && !responsableId.equals(authenticatedManagerId)) {
                throw accessService.forbidden();
            }
            responsableId = authenticatedManagerId;
        }
        return employeService.findAll(search, responsableId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@access.canAccessEmploye(authentication, #id)")
    public EmployeResponse findById(@PathVariable Long id) {
        return employeService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<EmployeResponse> create(@Valid @RequestBody EmployeRequest request) {
        return ResponseEntity.status(201).body(employeService.create(request));
    }
}
