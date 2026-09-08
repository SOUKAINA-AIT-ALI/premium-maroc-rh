package ma.premium.rh.notification;

import java.time.LocalDate;

import ma.premium.rh.evaluation.Evaluation;

public interface EvaluationMailService {

    boolean sendEvaluationRequest(Evaluation evaluation, LocalDate sendDate);
}
