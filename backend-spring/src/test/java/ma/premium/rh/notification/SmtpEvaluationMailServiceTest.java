package ma.premium.rh.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import java.time.LocalDate;

import ma.premium.rh.employe.Employe;
import ma.premium.rh.evaluation.Evaluation;
import ma.premium.rh.responsable.Responsable;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.mock;

class SmtpEvaluationMailServiceTest {

    @Test
    void adresseLeResponsableAvecLeLienEtLaLimiteJPlusSept() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        SmtpEvaluationMailService service = new SmtpEvaluationMailService(
                mailSender, "rh@premium.ma", "http://localhost:5173/"
        );
        Responsable responsable = new Responsable("Adil SOUSSI", "a.soussi@premium.ma");
        Employe employe = new Employe(
                "M001", "Karime Test", "Chef de projet", "Premium", responsable,
                LocalDate.of(2026, 7, 8)
        );
        Evaluation evaluation = new Evaluation(employe, (short) 1, LocalDate.of(2026, 9, 8));
        ReflectionTestUtils.setField(evaluation, "id", 42L);

        assertThat(service.sendEvaluationRequest(evaluation, LocalDate.of(2026, 9, 8))).isTrue();

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertThat(message.getTo()).containsExactly("a.soussi@premium.ma");
        assertThat(message.getText()).contains("15/09/2026");
        assertThat(message.getText()).contains("http://localhost:5173/?evaluation_id=42");
    }
}
