import React from "react";

/**
 * Renders a translated string that may contain **bold** markers.
 * Example: richText(t("contacts1.p1")) turns
 *   "We are here to **help you** today."
 * into: ["We are here to ", <strong>help you</strong>, " today."]
 */
export function richText(text) {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`b-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default richText;
