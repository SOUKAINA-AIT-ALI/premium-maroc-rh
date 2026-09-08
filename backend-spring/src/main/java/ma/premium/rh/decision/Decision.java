package ma.premium.rh.decision;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import ma.premium.rh.employe.Employe;
import ma.premium.rh.evaluation.Evaluation;

@Entity
@Table(name = "decisions")
public class Decision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employe_id", nullable = false, unique = true)
    private Employe employe;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false, unique = true)
    private Evaluation evaluation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DecisionStatut statut;

    @Column(name = "date_effet", nullable = false)
    private LocalDate dateEffet;

    @Column(name = "axes_amelioration", columnDefinition = "text")
    private String axesAmelioration;

    @Column(name = "document_pdf_url", length = 500)
    private String documentPdfUrl;

    @Column(name = "document_signe_url", length = 500)
    private String documentSigneUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Decision() {
    }

    public Decision(
            Employe employe,
            Evaluation evaluation,
            DecisionStatut statut,
            LocalDate dateEffet,
            String axesAmelioration
    ) {
        this.employe = employe;
        this.evaluation = evaluation;
        this.statut = statut;
        this.dateEffet = dateEffet;
        this.axesAmelioration = axesAmelioration;
    }

    public Long getId() { return id; }
    public Employe getEmploye() { return employe; }
    public Evaluation getEvaluation() { return evaluation; }
    public DecisionStatut getStatut() { return statut; }
    public LocalDate getDateEffet() { return dateEffet; }
    public String getAxesAmelioration() { return axesAmelioration; }
    public String getDocumentPdfUrl() { return documentPdfUrl; }
    public String getDocumentSigneUrl() { return documentSigneUrl; }

    public void definirDocumentPdfUrl(String documentPdfUrl) {
        this.documentPdfUrl = documentPdfUrl;
    }

    public void definirDocumentSigneUrl(String documentSigneUrl) {
        this.documentSigneUrl = documentSigneUrl;
    }
}
