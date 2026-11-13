import { useRouter } from "next/router";
import React from "react";
import { scrollToAnchor } from "../../utils";

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
  className: extraClassName,
}) => {
  const router = useRouter();
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    const target = path || "";
    // Deep link to a section of the *current* page (e.g. "/appointment#appointment-form"
    // tapped from the health-concern cards while already on /appointment): pushing
    // the same route does nothing, and Next's scroll-to-top cannot reset the
    // <body> scroller on phones, so the tap used to look completely dead. Scroll
    // the anchor ourselves and keep the URL in sync without a history entry.
    const [targetPath, hash] = target.split("#");
    if (hash && targetPath.split("?")[0] === router.pathname) {
      scrollToAnchor(hash);
      router.replace(target, undefined, { shallow: true });
      return;
    }
    router.push(target);
  };

  const isBookNow = isBlinking || variant === "book-now" || variant === "blink";
  // Secondary/ghost style. Only the class changes - an explicit `bgColor`/`color`
  // still wins, because those are inline styles.
  const isOutline =
    variant === "outline" || variant === "secondary" || variant === "ghost";

  // Base class + optional modifiers. For every existing instance the join still
  // produces exactly the original "consultation-btn", so nothing else changes.
  // `className` lets a caller restyle a single instance (e.g. the phone-only
  // health-concern tiles) without touching the shared button CSS.
  const className = [
    "consultation-btn",
    isBookNow && "consultation-btn--book-now",
    isOutline && "consultation-btn--outline",
    extraClassName,
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

