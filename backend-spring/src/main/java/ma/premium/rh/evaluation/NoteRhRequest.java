package ma.premium.rh.evaluation;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NoteRhRequest(@JsonProperty("note_interne_rh") String noteInterneRh) {
}
