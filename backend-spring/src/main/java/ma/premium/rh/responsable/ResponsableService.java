package ma.premium.rh.responsable;

import java.util.List;
import java.util.Locale;

import ma.premium.rh.error.ApiException;
import org.springframework.http.HttpStatus;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResponsableService {

    private final ResponsableRepository responsableRepository;

    public ResponsableService(ResponsableRepository responsableRepository) {
        this.responsableRepository = responsableRepository;
    }

    @Transactional(readOnly = true)
    public List<ResponsableResponse> findAll() {
        return responsableRepository.findAllByOrderByNomCompletAsc()
                .stream()
                .map(ResponsableResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResponsableResponse findById(Long id) {
        return responsableRepository.findById(id)
                .map(ResponsableResponse::fromEntity)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Responsable introuvable."));
    }

    @Transactional
    public ResponsableResponse create(ResponsableRequest request) {
        String nomComplet = request.nomComplet().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (responsableRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResponsableEmailException(email);
        }

        Responsable responsable = responsableRepository.save(
                new Responsable(nomComplet, email)
        );

        return ResponsableResponse.fromEntity(responsable);
    }
}
