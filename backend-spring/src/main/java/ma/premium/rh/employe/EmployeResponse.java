package ma.premium.rh.employe;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EmployeResponse(
        Long id,
        String matricule,
        @JsonProperty("nom_complet") String nomComplet,
        String poste,
        String societe,
        @JsonProperty("responsable_id") Long responsableId,
        @JsonProperty("date_embauche") LocalDate dateEmbauche
) {
    public static EmployeResponse fromEntity(Employe employe) {
        return new EmployeResponse(
                employe.getId(), employe.getMatricule(), employe.getNomComplet(),
                employe.getPoste(),
                employe.getSociete() == null || employe.getSociete().isBlank()
                        ? "Groupe Premium" : employe.getSociete(),
                employe.getResponsable().getId(), employe.getDateEmbauche()
        );
    }
}
