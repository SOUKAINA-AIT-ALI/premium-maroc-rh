package ma.premium.rh.notification;

import java.time.LocalDate;

import ma.premium.rh.evaluation.Evaluation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "false", matchIfMissing = true)
public class DisabledEvaluationMailService implements EvaluationMailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DisabledEvaluationMailService.class);

    @Override
    public boolean sendEvaluationRequest(Evaluation evaluation, LocalDate sendDate) {
        LOGGER.warn(
                "Email non envoyé pour l'évaluation {} : configurez le SMTP et activez app.mail.enabled.",
                evaluation.getId()
        );
        return false;
    }
}
