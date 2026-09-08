package ma.premium.rh.auth;

import java.time.Duration;
import java.time.Instant;

import ma.premium.rh.error.ApiException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final Duration jwtTtl;

    public AuthService(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder,
                       JwtEncoder jwtEncoder,
                       @Value("${app.security.jwt-ttl:PT8H}") Duration jwtTtl) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.jwtTtl = jwtTtl;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(Utilisateur::isActif)
                .orElseThrow(this::invalidCredentials);
        if (!passwordEncoder.matches(request.password(), utilisateur.getPasswordHash())) {
            throw invalidCredentials();
        }
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(jwtTtl);
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("premium-rh-api")
                .subject(utilisateur.getEmail())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("role", utilisateur.getRole().name());
        if (utilisateur.getResponsable() != null) {
            claims.claim("responsable_id", utilisateur.getResponsable().getId());
        }
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims.build()
        )).getTokenValue();
        return AuthResponse.fromEntity(utilisateur, token, expiresAt);
    }

    @Transactional
    public void changePassword(String authenticatedEmail, ChangePasswordRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(authenticatedEmail)
                .filter(Utilisateur::isActif)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(request.ancienMotDePasse(), utilisateur.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "L'ancien mot de passe est incorrect.");
        }
        if (!request.nouveauMotDePasse().equals(request.confirmationMotDePasse())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "La confirmation ne correspond pas au nouveau mot de passe.");
        }
        if (passwordEncoder.matches(request.nouveauMotDePasse(), utilisateur.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Le nouveau mot de passe doit être différent de l'ancien.");
        }

        utilisateur.changerMotDePasse(passwordEncoder.encode(request.nouveauMotDePasse()));
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects.");
    }
}
