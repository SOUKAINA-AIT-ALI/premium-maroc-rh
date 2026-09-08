package ma.premium.rh.notification;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.responsable.Responsable;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class SmtpEvaluationMailService implements EvaluationMailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;
    private final String sender;
    private final String frontendUrl;

    public SmtpEvaluationMailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:no-reply@premium.ma}") String sender,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendUrl
    ) {
        this.mailSender = mailSender;
        this.sender = sender;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    public boolean sendEvaluationRequest(Evaluation evaluation, LocalDate sendDate) {
        Responsable responsable = evaluation.getEmploye().getResponsable();
        LocalDate responseDeadline = sendDate.plusDays(7);
        String evaluationLink = frontendUrl + "/?evaluation_id=" + evaluation.getId();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(sender);
        message.setTo(responsable.getEmail());
        message.setSubject("Évaluation de période d'essai — " + evaluation.getEmploye().getNomComplet());
        message.setText("""
                Bonjour %s,

                La phase %d de l'évaluation de la période d'essai de %s est disponible.

                Date d'échéance : %s
                Date limite de réponse : %s

                Ouvrir la fiche d'évaluation :
                %s

                Une authentification avec votre compte Responsable est requise.

                Groupe Premium Maroc
                """.formatted(
                responsable.getNomComplet(), evaluation.getType(),
                evaluation.getEmploye().getNomComplet(),
                evaluation.getDatePrevueEnvoi().format(DATE_FORMAT),
                responseDeadline.format(DATE_FORMAT), evaluationLink
        ));
        mailSender.send(message);
        return true;
    }
}
