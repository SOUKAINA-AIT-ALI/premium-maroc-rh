package ma.premium.rh.decision;

import java.time.LocalDate;
import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DecisionResponse(
        Long id,
        @JsonProperty("employe_id") Long employeId,
        @JsonProperty("evaluation_id") Long evaluationId,
        String statut,
        @JsonProperty("date_effet") LocalDate dateEffet,
        @JsonProperty("axes_amelioration") String axesAmelioration,
        @JsonProperty("document_pdf_url") String documentPdfUrl,
        @JsonProperty("document_signe_url") String documentSigneUrl
) {
    public static DecisionResponse fromEntity(Decision d) {
        return new DecisionResponse(
                d.getId(), d.getEmploye().getId(), d.getEvaluation().getId(),
                d.getStatut().name().toLowerCase(Locale.ROOT), d.getDateEffet(),
                d.getAxesAmelioration(), d.getDocumentPdfUrl(),
                d.getDocumentSigneUrl() == null ? null : "/api/decisions/" + d.getId() + "/document-signe"
        );
    }
}
