package ma.premium.rh.employe;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import ma.premium.rh.responsable.Responsable;

@Entity
@Table(name = "employes")
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String matricule;

    @Column(name = "nom_complet", nullable = false, length = 150)
    private String nomComplet;

    @Column(nullable = false, length = 150)
    private String poste;

    @Column(length = 100)
    private String societe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Responsable responsable;

    @Column(name = "date_embauche", nullable = false)
    private LocalDate dateEmbauche;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Employe() {
    }

    public Employe(
            String matricule,
            String nomComplet,
            String poste,
            String societe,
            Responsable responsable,
            LocalDate dateEmbauche
    ) {
        this.matricule = matricule;
        this.nomComplet = nomComplet;
        this.poste = poste;
        this.societe = societe;
        this.responsable = responsable;
        this.dateEmbauche = dateEmbauche;
    }

    public Long getId() { return id; }
    public String getMatricule() { return matricule; }
    public String getNomComplet() { return nomComplet; }
    public String getPoste() { return poste; }
    public String getSociete() { return societe; }
    public Responsable getResponsable() { return responsable; }
    public LocalDate getDateEmbauche() { return dateEmbauche; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
