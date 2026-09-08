package ma.premium.rh.responsable;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResponsableRequest(
        @JsonProperty("nom_complet")
        @NotBlank(message = "Le nom complet est obligatoire.")
        @Size(max = 150, message = "Le nom complet ne doit pas dépasser 150 caractères.")
        String nomComplet,

        @NotBlank(message = "L'adresse e-mail est obligatoire.")
        @Email(message = "L'adresse e-mail n'est pas valide.")
        @Size(max = 180, message = "L'adresse e-mail ne doit pas dépasser 180 caractères.")
        String email
) {
}
