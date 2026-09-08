package ma.premium.rh.evaluation;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EvaluationResponse(
        Long id,
        @JsonProperty("employe_id") Long employeId,
        short type,
        @JsonProperty("date_prevue_envoi") LocalDate datePrevueEnvoi,
        @JsonProperty("date_envoi_reelle") LocalDate dateEnvoiReelle,
        @JsonProperty("date_limite_reponse") LocalDate dateLimiteReponse,
        @JsonProperty("date_fin_periode") LocalDate dateFinPeriode,
        @JsonProperty("date_reception") LocalDate dateReception,
        String statut,
        List<CritereNote> notes,
        @JsonProperty("objectifs_statut") String objectifsStatut,
        @JsonProperty("objectifs_commentaires") String objectifsCommentaires,
        @JsonProperty("appreciations_generales") String appreciationsGenerales,
        @JsonProperty("points_forts") String pointsForts,
        @JsonProperty("axes_amelioration") String axesAmelioration,
        @JsonProperty("recommandation_statut") String recommandationStatut,
        @JsonProperty("recommandation_date_effet") LocalDate recommandationDateEffet,
        @JsonProperty("recommandation_commentaires") String recommandationCommentaires,
        @JsonProperty("note_interne_rh") String noteInterneRh
) {
    public static EvaluationResponse fromEntity(Evaluation e) {
        return new EvaluationResponse(
                e.getId(), e.getEmploye().getId(), e.getType(), e.getDatePrevueEnvoi(),
                e.getDateEnvoiReelle(),
                e.getDateEnvoiReelle() == null ? null : e.getDateEnvoiReelle().plusDays(7),
                e.getEmploye().getDateEmbauche().plusMonths(e.getType() == 1 ? 3 : 6),
                e.getDateReception(), lower(e.getStatut()), e.getNotes(),
                lower(e.getObjectifsStatut()), e.getObjectifsCommentaires(), e.getAppreciationsGenerales(),
                e.getPointsForts(), e.getAxesAmelioration(), lower(e.getRecommandationStatut()),
                e.getRecommandationDateEffet(), e.getRecommandationCommentaires(), e.getNoteInterneRh()
        );
    }

    private static String lower(Enum<?> value) {
        return value == null ? null : value.name().toLowerCase(Locale.ROOT);
    }
}
