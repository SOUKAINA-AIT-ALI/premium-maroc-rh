package ma.premium.rh.responsable;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:responsable-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.seed.enabled=false"
})
@AutoConfigureMockMvc
class ResponsableControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ResponsableRepository responsableRepository;

    @BeforeEach
    void cleanDatabase() {
        responsableRepository.deleteAll();
    }

    @Test
    void creeListeEtRefuseUnEmailDuplique() throws Exception {
        String requestBody = """
                {
                  "nom_complet": "Youssef Bennani",
                  "email": "y.bennani@premium.ma"
                }
                """;

        mockMvc.perform(post("/api/responsables")
                        .with(user("rh@premium.ma").roles("RH"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nom_complet").value("Youssef Bennani"))
                .andExpect(jsonPath("$.email").value("y.bennani@premium.ma"));

        mockMvc.perform(get("/api/responsables")
                        .with(user("rh@premium.ma").roles("RH")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom_complet").value("Youssef Bennani"));

        mockMvc.perform(post("/api/responsables")
                        .with(user("rh@premium.ma").roles("RH"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }
}
