package ma.premium.rh.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record AuthResponse(
        String email,
        String role,
        @JsonProperty("display_name") String displayName,
        @JsonProperty("responsable_id") Long responsableId,
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_at") Instant expiresAt
) {
    public static AuthResponse fromEntity(Utilisateur u, String accessToken, Instant expiresAt) {
        return new AuthResponse(
                u.getEmail(), u.getRole() == Role.MANAGER ? "Manager" : "RH",
                u.getDisplayName(), u.getResponsable() == null ? null : u.getResponsable().getId(),
                accessToken, expiresAt
        );
    }
}
