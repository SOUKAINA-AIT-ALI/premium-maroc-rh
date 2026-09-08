package ma.premium.rh.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import com.jayway.jsonpath.JsonPath;
import ma.premium.rh.decision.DecisionRepository;
import ma.premium.rh.employe.Employe;
import ma.premium.rh.employe.EmployeRepository;
import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.evaluation.EvaluationRepository;
import ma.premium.rh.responsable.Responsable;
import ma.premium.rh.responsable.ResponsableRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:authorization-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.seed.enabled=false",
        "app.security.jwt-secret=authorization-test-secret-at-least-32-bytes"
})
@AutoConfigureMockMvc
class AuthorizationIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ResponsableRepository responsableRepository;
    @Autowired EmployeRepository employeRepository;
    @Autowired EvaluationRepository evaluationRepository;
    @Autowired DecisionRepository decisionRepository;
    @Autowired UtilisateurRepository utilisateurRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private Employe ownEmployee;
    private Employe otherEmployee;

    @BeforeEach
    void setUp() {
        decisionRepository.deleteAll();
        evaluationRepository.deleteAll();
        employeRepository.deleteAll();
        utilisateurRepository.deleteAll();
        responsableRepository.deleteAll();

        Responsable managerOne = responsableRepository.save(
                new Responsable("Manager Un", "manager1@premium.ma"));
        Responsable managerTwo = responsableRepository.save(
                new Responsable("Manager Deux", "manager2@premium.ma"));
        utilisateurRepository.save(new Utilisateur(
                managerOne.getEmail(), passwordEncoder.encode("Manager@2026"),
                Role.MANAGER, managerOne.getNomComplet(), managerOne));
        utilisateurRepository.save(new Utilisateur(
                "rh@premium.ma", passwordEncoder.encode("Premium@2026"),
                Role.RH, "Assistante RH", null));

        ownEmployee = employeRepository.save(new Employe(
                "M001", "Collaborateur Un", "Poste", "Premium", managerOne,
                LocalDate.of(2026, 1, 1)));
        otherEmployee = employeRepository.save(new Employe(
                "M002", "Collaborateur Deux", "Poste", "Premium", managerTwo,
                LocalDate.of(2026, 1, 1)));
        evaluationRepository.save(new Evaluation(
                ownEmployee, (short) 1, LocalDate.of(2026, 3, 1)));
        evaluationRepository.save(new Evaluation(
                otherEmployee, (short) 1, LocalDate.of(2026, 3, 1)));
    }

    @Test
    void exigeUnTokenSurLesEndpointsMetier() throws Exception {
        mockMvc.perform(get("/api/employes"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    void jwtManagerLimiteLesAccesASaPropreEquipe() throws Exception {
        String token = login("manager1@premium.ma", "Manager@2026");

        mockMvc.perform(get("/api/employes/{id}", ownEmployee.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/employes/{id}", otherEmployee.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(get("/api/employes")
                        .param("responsable_id", otherEmployee.getResponsable().getId().toString())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/responsables")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom_complet\":\"Interdit\",\"email\":\"interdit@premium.ma\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void appliqueLesRolesRhEtManager() throws Exception {
        String managerToken = login("manager1@premium.ma", "Manager@2026");
        String rhToken = login("rh@premium.ma", "Premium@2026");

        mockMvc.perform(get("/api/responsables")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/responsables")
                        .header("Authorization", "Bearer " + rhToken))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/evaluations/{id}/note-rh",
                        evaluationRepository.findByEmployeIdOrderByTypeAsc(ownEmployee.getId()).getFirst().getId())
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note_interne_rh\":\"Interdit\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/decisions")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void changeUniquementLeMotDePasseDuCompteAuthentifie() throws Exception {
        String token = login("manager1@premium.ma", "Manager@2026");

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ancien_mot_de_passe": "Manager@2026",
                                  "nouveau_mot_de_passe": "Nouveau@2027",
                                  "confirmation_mot_de_passe": "Nouveau@2027"
                                }
                                """))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ancien_mot_de_passe": "incorrect",
                                  "nouveau_mot_de_passe": "Nouveau@2027",
                                  "confirmation_mot_de_passe": "Nouveau@2027"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("L'ancien mot de passe est incorrect."));

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ancien_mot_de_passe": "Manager@2026",
                                  "nouveau_mot_de_passe": "Nouveau@2027",
                                  "confirmation_mot_de_passe": "Autre@2027"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La confirmation ne correspond pas au nouveau mot de passe."));

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ancien_mot_de_passe": "Manager@2026",
                                  "nouveau_mot_de_passe": "faible",
                                  "confirmation_mot_de_passe": "faible"
                                }
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ancien_mot_de_passe": "Manager@2026",
                                  "nouveau_mot_de_passe": "Nouveau@2027",
                                  "confirmation_mot_de_passe": "Nouveau@2027"
                                }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"manager1@premium.ma\",\"password\":\"Manager@2026\"}"))
                .andExpect(status().isUnauthorized());
        login("manager1@premium.ma", "Nouveau@2027");
    }

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andExpect(jsonPath("$.expires_at").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.access_token");
    }
}
