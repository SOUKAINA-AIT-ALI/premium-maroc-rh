package ma.premium.rh.decision;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/decisions")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @GetMapping
    @PreAuthorize("hasRole('RH')")
    public List<DecisionResponse> findAll(
            @RequestParam(name = "employe_id", required = false) Long employeId
    ) {
        return decisionService.findAll(employeId);
    }

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<DecisionResponse> create(@Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.status(201).body(decisionService.create(request));
    }

    @PostMapping(value = "/{id}/document-signe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('RH')")
    public DecisionResponse uploadSigned(
            @PathVariable Long id,
            @RequestPart("document_signe") MultipartFile file
    ) {
        return decisionService.uploadSigned(id, file);
    }

    @GetMapping(value = "/{id}/document", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasRole('RH')")
    public String printableDocument(@PathVariable Long id) {
        return decisionService.printableDocument(id);
    }

    @GetMapping(value = "/{id}/document-signe")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<Resource> downloadSigned(@PathVariable Long id) {
        Resource resource = decisionService.signedDocument(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
