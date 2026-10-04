import { useRouter } from "next/router";
import React from "react";

/**
 * Shared call-to-action button.
 *
 * Props are unchanged (`path`, `onClick`, `children`, `bgColor`, `color`), so every
 * existing instance keeps its exact behaviour and styling.
 *
 * Optional variants:
 *   variant="book-now"  (or the `isBlinking` alias) adds the subtle glow pulse for
 *   the primary "Book Now" CTA. The animation lives in public/css/customStyle.css
 *   (`.consultation-btn--book-now`) and is disabled under
 *   `prefers-reduced-motion: reduce`.
 *   variant="outline"   (aliases: "secondary", "ghost") is the quiet secondary CTA:
 *   transparent surface with a brand-green keyline that fills in on hover/focus
 *   (`.consultation-btn--outline`). Use it next to a solid primary so the pair
 *   reads as primary + secondary.
 *   No variant = the original solid green button, unchanged.
 */
export const ConsultationButton = ({
  path,
  onClick,
  children,
  bgColor,
  color,
  variant,
  isBlinking = false,
}) => {
  const router = useRouter();
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    router.push(path || "");
  };

  const isBookNow = isBlinking || variant === "book-now" || variant === "blink";
  // Secondary/ghost style. Only the class changes - an explicit `bgColor`/`color`
  // still wins, because those are inline styles.
  const isOutline =
    variant === "outline" || variant === "secondary" || variant === "ghost";

  // Base class + optional modifiers. For every existing instance the join still
  // produces exactly the original "consultation-btn", so nothing else changes.
  const className = [
    "consultation-btn",
    isBookNow && "consultation-btn--book-now",
    isOutline && "consultation-btn--outline",
  ]
    .filter(Boolean)
    .join(" ");

  // The CTA is a div, so give it real button semantics: Enter/Space activate it
  // exactly like a click, which is what makes the `:focus-visible` ring useful.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      role="button"
      className={className}
      style={bgColor ? { backgroundColor: bgColor,color: color } : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

