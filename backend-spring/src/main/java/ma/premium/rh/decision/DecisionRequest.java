package ma.premium.rh.decision;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DecisionRequest(
        @JsonProperty("employe_id") @NotNull Long employeId,
        @JsonProperty("evaluation_id") @NotNull Long evaluationId,
        @NotBlank String statut,
        @JsonProperty("date_effet") @NotNull LocalDate dateEffet,
        @JsonProperty("axes_amelioration") String axesAmelioration
) {
}
