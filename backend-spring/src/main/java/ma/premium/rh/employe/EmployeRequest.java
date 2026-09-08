package ma.premium.rh.employe;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EmployeRequest(
        @NotBlank @Size(max = 50) String matricule,
        @JsonProperty("nom_complet") @NotBlank @Size(max = 150) String nomComplet,
        @NotBlank @Size(max = 150) String poste,
        @NotBlank @Size(max = 100) String societe,
        @JsonProperty("responsable_id") @NotNull Long responsableId,
        @JsonProperty("date_embauche") @NotNull LocalDate dateEmbauche
) {
}
