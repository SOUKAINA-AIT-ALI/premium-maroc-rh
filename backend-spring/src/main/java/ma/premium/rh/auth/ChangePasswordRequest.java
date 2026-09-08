package ma.premium.rh.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @JsonProperty("ancien_mot_de_passe")
        @NotBlank(message = "L'ancien mot de passe est obligatoire.")
        String ancienMotDePasse,

        @JsonProperty("nouveau_mot_de_passe")
        @NotBlank(message = "Le nouveau mot de passe est obligatoire.")
        @Size(min = 8, max = 72, message = "Le nouveau mot de passe doit contenir entre 8 et 72 caractères.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Le nouveau mot de passe doit contenir une majuscule, une minuscule et un chiffre."
        )
        String nouveauMotDePasse,

        @JsonProperty("confirmation_mot_de_passe")
        @NotBlank(message = "La confirmation du nouveau mot de passe est obligatoire.")
        String confirmationMotDePasse
) {
}
