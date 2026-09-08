package ma.premium.rh.bootstrap;

import java.util.List;

import ma.premium.rh.auth.Role;
import ma.premium.rh.auth.Utilisateur;
import ma.premium.rh.auth.UtilisateurRepository;
import ma.premium.rh.responsable.Responsable;
import ma.premium.rh.responsable.ResponsableRepository;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class InitialDataLoader implements ApplicationRunner {

    private final ResponsableRepository responsableRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public InitialDataLoader(ResponsableRepository responsableRepository,
                             UtilisateurRepository utilisateurRepository,
                             PasswordEncoder passwordEncoder) {
        this.responsableRepository = responsableRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (responsableRepository.count() == 0) {
            responsableRepository.saveAll(DATA.stream()
                    .map(d -> new Responsable(d.nom(), d.email()))
                    .toList());
        }

        if (!utilisateurRepository.existsByEmailIgnoreCase("rh@premium.ma")) {
            utilisateurRepository.save(new Utilisateur(
                    "rh@premium.ma", passwordEncoder.encode("Premium@2026"),
                    Role.RH, "Assistante RH", null
            ));
        }

        String managerPassword = passwordEncoder.encode("Manager@2026");
        for (Responsable responsable : responsableRepository.findAll()) {
            if (!utilisateurRepository.existsByEmailIgnoreCase(responsable.getEmail())) {
                utilisateurRepository.save(new Utilisateur(
                        responsable.getEmail(), managerPassword, Role.MANAGER,
                        responsable.getNomComplet(), responsable
                ));
            }
        }
    }

    private record ResponsableData(String nom, String email) {}

    private static final List<ResponsableData> DATA = List.of(
            new ResponsableData("Youssef BENNANI", "y.bennani@premium.ma"),
            new ResponsableData("Amine EL OUALI", "a.elouali@premium.ma"),
            new ResponsableData("Sanaa LAHLOU", "s.lahlou@premium.ma"),
            new ResponsableData("Mehdi CHERKAOUY", "m.cherkaouy@premium.ma"),
            new ResponsableData("Ghita TAJI", "g.taji@premium.ma"),
            new ResponsableData("Rachid ALAMI", "r.alami@premium.ma"),
            new ResponsableData("Othmane CHRAIBI", "o.chraibi@premium.ma"),
            new ResponsableData("Meriem BELKADY", "m.belkady@premium.ma"),
            new ResponsableData("Hamza TAZI", "h.tazi@premium.ma"),
            new ResponsableData("Saida EL FASSI", "s.elfassi@premium.ma"),
            new ResponsableData("Adil SOUSSI", "a.soussi@premium.ma"),
            new ResponsableData("Karim BOUSSAID", "k.boussaid@premium.ma"),
            new ResponsableData("Fatima Zohra TOUMI", "fz.toumi@premium.ma"),
            new ResponsableData("Brahim JABRI", "b.jabri@premium.ma"),
            new ResponsableData("Nadia BENJELLOUN", "n.benjelloun@premium.ma"),
            new ResponsableData("Tariq EL RHAZI", "t.elhrazi@premium.ma"),
            new ResponsableData("Salma SEKKAT", "s.sekkat@premium.ma"),
            new ResponsableData("Hicham KABBAGE", "h.kabbage@premium.ma"),
            new ResponsableData("Nabil ZOUHIR", "n.zouhir@premium.ma"),
            new ResponsableData("Khalid SEMLALI", "k.semlali@premium.ma"),
            new ResponsableData("Meryem GUEDIRA", "m.guedira@premium.ma"),
            new ResponsableData("Zakaria EL KADIRI", "z.elkadiri@premium.ma"),
            new ResponsableData("Hind BOUTALEB", "h.boutaleb@premium.ma"),
            new ResponsableData("Reda BENSLIMANE", "r.benslimane@premium.ma"),
            new ResponsableData("Mounir GUESSOUS", "m.guessous@premium.ma"),
            new ResponsableData("Wafaa EL AMRANI", "w.elamrani@premium.ma"),
            new ResponsableData("Anass TAZI", "a.tazi2@premium.ma"),
            new ResponsableData("Keltoum BENKIRANE", "k.benkirane@premium.ma"),
            new ResponsableData("Jalil FILALI", "j.filali@premium.ma"),
            new ResponsableData("Samira HAROUCHI", "s.harouchi@premium.ma"),
            new ResponsableData("Omar BENABDELLAH", "o.benabdellah@premium.ma"),
            new ResponsableData("Lamia EL HASSANI", "l.elhassani@premium.ma"),
            new ResponsableData("Yassine MOUTAWAKIL", "y.moutawakil@premium.ma"),
            new ResponsableData("Amina CHERIF", "a.cherif@premium.ma"),
            new ResponsableData("Taha MEZZOUR", "t.mezzour@premium.ma"),
            new ResponsableData("Farid SKALI", "f.skali@premium.ma"),
            new ResponsableData("Imane BELKHAYAT", "i.belkhayat@premium.ma"),
            new ResponsableData("Driss TAZI", "d.tazi@premium.ma"),
            new ResponsableData("Hassan EL MANSOUR", "h.elmansour@premium.ma")
    );
}
