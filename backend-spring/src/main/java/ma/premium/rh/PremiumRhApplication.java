package ma.premium.rh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PremiumRhApplication {

    public static void main(String[] args) {
        SpringApplication.run(PremiumRhApplication.class, args);
    }
}
