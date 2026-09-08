package ma.premium.rh.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import ma.premium.rh.error.ApiException;

import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentStorageService {

    private static final long MAX_SIZE = 4L * 1024L * 1024L;
    private static final Set<String> ALLOWED = Set.of("application/pdf", "image/jpeg", "image/png");
    private final Path root = Path.of("uploads", "decisions-signees").toAbsolutePath().normalize();

    public String save(MultipartFile file) {
        if (file.isEmpty() || file.getSize() > MAX_SIZE || !ALLOWED.contains(file.getContentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Le fichier doit être un PDF, JPG ou PNG de 4 Mo maximum.");
        }
        String original = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')).toLowerCase() : "";
        String filename = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(root);
            Files.copy(file.getInputStream(), root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/decisions-signees/" + filename;
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible d'enregistrer le document.");
        }
    }

    public Resource load(String storedUrl) {
        try {
            Path filename = Path.of(storedUrl).getFileName();
            Path target = root.resolve(filename).normalize();
            if (!target.startsWith(root) || !Files.isRegularFile(target)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Document signé introuvable.");
            }
            return new UrlResource(target.toUri());
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Document signé introuvable.");
        }
    }
}
