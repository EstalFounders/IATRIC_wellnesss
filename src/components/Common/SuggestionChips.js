// SuggestionChips.js
// One-tap fills for the repeatable doctor fields ("MBBS", "MD" / "Hindi",
// "English"). Shared by <EducationTrainingInput /> and <LanguageInput /> so the
// two look and behave identically. Inline styles, the convention for every
// panel/tag UI (see WorkDaysPicker).
import React from "react";
import { color_schema } from "../../constant";

const containerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  margin: "0 0 10px",
};

// Same look as the "+ Add Education / Training" / "+ Add Language" buttons
// (white fill, green border, green bold text, 5px radius) so the suggestions
// read as part of that control rather than as a separate chip widget.
const chipStyle = (selected) => ({
  padding: "6px 12px",
  borderRadius: 5,
  border: `1px solid ${color_schema.green}`,
  background: selected ? "#e8f5e9" : "#fff",
  color: color_schema.green,
  fontWeight: 600,
  fontSize: "0.9rem",
  lineHeight: 1.4,
  cursor: selected ? "default" : "pointer",
});

/**
 * Clicking a chip appends it to the field's rows (in click order); an already
 * selected chip is not clickable again - remove the row instead, so a typo is
 * still fixable.
 */
const SuggestionChips = ({
  suggestions = [],
  isSelected = () => false,
  onPick,
  label = "Suggestions",
}) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;

  return (
    <div style={containerStyle} role="group" aria-label={label}>
      {suggestions.map((suggestion) => {
        const selected = isSelected(suggestion);

        return (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick?.(suggestion)}
            disabled={selected}
            aria-pressed={selected}
            aria-label={`Add ${suggestion}`}
            title={selected ? `${suggestion} is already added` : `Add ${suggestion}`}
            style={chipStyle(selected)}
          >
            {selected ? `✓ ${suggestion}` : suggestion}
          </button>
        );
      })}
    </div>
  );
};

export default SuggestionChips;
