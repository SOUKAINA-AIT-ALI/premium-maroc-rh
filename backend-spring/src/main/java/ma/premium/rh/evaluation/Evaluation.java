package ma.premium.rh.evaluation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import ma.premium.rh.employe.Employe;

@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @Column(nullable = false)
    private short type;

    @Column(name = "date_prevue_envoi", nullable = false)
    private LocalDate datePrevueEnvoi;

    @Column(name = "date_envoi_reelle")
    private LocalDate dateEnvoiReelle;

    @Column(name = "date_reception")
    private LocalDate dateReception;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationStatut statut = EvaluationStatut.A_VENIR;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<CritereNote> notes = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "objectifs_statut", length = 30)
    private ObjectifsStatut objectifsStatut;

    @Column(name = "objectifs_commentaires", columnDefinition = "text")
    private String objectifsCommentaires;

    @Column(name = "appreciations_generales", columnDefinition = "text")
    private String appreciationsGenerales;

    @Column(name = "points_forts", columnDefinition = "text")
    private String pointsForts;

    @Column(name = "axes_amelioration", columnDefinition = "text")
    private String axesAmelioration;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommandation_statut", length = 20)
    private RecommandationStatut recommandationStatut;

    @Column(name = "recommandation_date_effet")
    private LocalDate recommandationDateEffet;

    @Column(name = "recommandation_commentaires", columnDefinition = "text")
    private String recommandationCommentaires;

    @Column(name = "note_interne_rh", columnDefinition = "text")
    private String noteInterneRh;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Evaluation() {
    }

    public Evaluation(Employe employe, short type, LocalDate datePrevueEnvoi) {
        if (type != 1 && type != 2) {
            throw new IllegalArgumentException("Le type d'évaluation doit être 1 ou 2.");
        }
        this.employe = employe;
        this.type = type;
        this.datePrevueEnvoi = datePrevueEnvoi;
    }

    public Long getId() { return id; }
    public Employe getEmploye() { return employe; }
    public short getType() { return type; }
    public LocalDate getDatePrevueEnvoi() { return datePrevueEnvoi; }
    public LocalDate getDateEnvoiReelle() { return dateEnvoiReelle; }
    public LocalDate getDateReception() { return dateReception; }
    public EvaluationStatut getStatut() { return statut; }
    public List<CritereNote> getNotes() { return notes; }
    public ObjectifsStatut getObjectifsStatut() { return objectifsStatut; }
    public String getObjectifsCommentaires() { return objectifsCommentaires; }
    public String getAppreciationsGenerales() { return appreciationsGenerales; }
    public String getPointsForts() { return pointsForts; }
    public String getAxesAmelioration() { return axesAmelioration; }
    public RecommandationStatut getRecommandationStatut() { return recommandationStatut; }
    public LocalDate getRecommandationDateEffet() { return recommandationDateEffet; }
    public String getRecommandationCommentaires() { return recommandationCommentaires; }
    public String getNoteInterneRh() { return noteInterneRh; }

    public void soumettre(
            List<CritereNote> notes,
            ObjectifsStatut objectifsStatut,
            String objectifsCommentaires,
            String appreciationsGenerales,
            String pointsForts,
            String axesAmelioration,
            RecommandationStatut recommandationStatut,
            LocalDate recommandationDateEffet,
            String recommandationCommentaires,
            LocalDate dateReception
    ) {
        this.notes = new ArrayList<>(notes);
        this.objectifsStatut = objectifsStatut;
        this.objectifsCommentaires = objectifsCommentaires;
        this.appreciationsGenerales = appreciationsGenerales;
        this.pointsForts = pointsForts;
        this.axesAmelioration = axesAmelioration;
        this.recommandationStatut = recommandationStatut;
        this.recommandationDateEffet = recommandationDateEffet;
        this.recommandationCommentaires = recommandationCommentaires;
        this.dateEnvoiReelle = this.dateEnvoiReelle == null ? dateReception : this.dateEnvoiReelle;
        this.dateReception = dateReception;
        this.statut = EvaluationStatut.RECU;
    }

    public void modifierNoteInterneRh(String noteInterneRh) {
        this.noteInterneRh = noteInterneRh;
    }

    public void marquerEnvoyee(LocalDate dateEnvoi) {
        this.dateEnvoiReelle = dateEnvoi;
        this.statut = EvaluationStatut.ENVOYE;
    }

    public void marquerEnRetard() {
        if (this.statut != EvaluationStatut.RECU) {
            this.statut = EvaluationStatut.EN_RETARD;
        }
    }
}
