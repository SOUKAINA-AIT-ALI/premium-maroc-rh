package ma.premium.rh.responsable;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ResponsableResponse(
        Long id,
        @JsonProperty("nom_complet") String nomComplet,
        String email
) {
    public static ResponsableResponse fromEntity(Responsable responsable) {
        return new ResponsableResponse(
                responsable.getId(),
                responsable.getNomComplet(),
                responsable.getEmail()
        );
    }
}
