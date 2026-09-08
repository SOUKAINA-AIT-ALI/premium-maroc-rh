package ma.premium.rh.evaluation;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CritereNote(
        @JsonProperty("critere_id") String critereId,
        int note,
        String commentaire
) {
}
