package ma.premium.rh.responsable;

public class DuplicateResponsableEmailException extends RuntimeException {

    public DuplicateResponsableEmailException(String email) {
        super("Un responsable avec l'adresse e-mail " + email + " existe déjà.");
    }
}
