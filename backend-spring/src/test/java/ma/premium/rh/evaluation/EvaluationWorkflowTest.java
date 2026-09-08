package ma.premium.rh.evaluation;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import ma.premium.rh.employe.Employe;
import ma.premium.rh.responsable.Responsable;

import org.junit.jupiter.api.Test;

class EvaluationWorkflowTest {

    @Test
    void uneSoumissionPasseLevaluationAEvalueeEtEnregistreSaDate() {
        LocalDate dateEnvoi = LocalDate.of(2026, 9, 8);
        LocalDate dateSoumission = LocalDate.of(2026, 9, 12);
        Responsable responsable = new Responsable("Adil SOUSSI", "a.soussi@premium.ma");
        Employe employe = new Employe(
                "M001", "Karime Test", "Chef de projet", "Premium", responsable,
                LocalDate.of(2026, 7, 8)
        );
        Evaluation evaluation = new Evaluation(employe, (short) 1, dateEnvoi);
        evaluation.marquerEnvoyee(dateEnvoi);

        evaluation.soumettre(
                List.of(new CritereNote("critere-1", 4, "Bon travail")),
                ObjectifsStatut.ATTEINTS,
                "Objectifs atteints",
                "Bonne performance",
                "Rigueur",
                "Communication",
                RecommandationStatut.VALIDATION,
                null,
                "Validation recommandée",
                dateSoumission
        );

        assertThat(evaluation.getStatut()).isEqualTo(EvaluationStatut.RECU);
        assertThat(evaluation.getDateEnvoiReelle()).isEqualTo(dateEnvoi);
        assertThat(evaluation.getDateReception()).isEqualTo(dateSoumission);
    }
}
