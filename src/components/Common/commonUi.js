import { useRouter } from "next/router";
import React from "react";

/**
 * Shared call-to-action button.
 *
 * Props are unchanged (`path`, `onClick`, `children`, `bgColor`, `color`), so every
 * existing instance keeps its exact behaviour and styling.
 *
 * Optional attention variant:
 *   variant="book-now"  (or the `isBlinking` alias) adds the subtle glow pulse for
 *   the primary "Book Now" CTA. The animation lives in public/css/customStyle.css
 *   (`.consultation-btn--book-now`) and is disabled under
 *   `prefers-reduced-motion: reduce`.
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

  return (
    <div
      className={
        isBookNow ? "consultation-btn consultation-btn--book-now" : "consultation-btn"
      }
      style={bgColor ? { backgroundColor: bgColor,color: color } : undefined}
      onClick={handleClick}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

