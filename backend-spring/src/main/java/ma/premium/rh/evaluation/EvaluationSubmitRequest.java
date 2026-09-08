package ma.premium.rh.evaluation;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EvaluationSubmitRequest(
        @NotNull List<@Valid NoteRequest> notes,
        @JsonProperty("objectifs_statut") String objectifsStatut,
        @JsonProperty("objectifs_commentaires") String objectifsCommentaires,
        @JsonProperty("appreciations_generales") String appreciationsGenerales,
        @JsonProperty("points_forts") String pointsForts,
        @JsonProperty("axes_amelioration") String axesAmelioration,
        @JsonProperty("recommandation_statut") String recommandationStatut,
        @JsonProperty("recommandation_date_effet") LocalDate recommandationDateEffet,
        @JsonProperty("recommandation_commentaires") String recommandationCommentaires
) {
    public record NoteRequest(
            @JsonProperty("critere_id") @NotBlank String critereId,
            @Min(1) @Max(5) int note,
            String commentaire
    ) {
        CritereNote toValue() {
            return new CritereNote(critereId, note, commentaire == null ? "" : commentaire);
        }
    }
}
