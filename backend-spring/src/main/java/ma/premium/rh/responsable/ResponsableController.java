package ma.premium.rh.responsable;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/responsables")
public class ResponsableController {

    private final ResponsableService responsableService;

    public ResponsableController(ResponsableService responsableService) {
        this.responsableService = responsableService;
    }

    @GetMapping
    @PreAuthorize("hasRole('RH')")
    public List<ResponsableResponse> findAll() {
        return responsableService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@access.canAccessResponsable(authentication, #id)")
    public ResponsableResponse findById(@PathVariable Long id) {
        return responsableService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ResponsableResponse> create(
            @Valid @RequestBody ResponsableRequest request
    ) {
        ResponsableResponse created = responsableService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }
}
