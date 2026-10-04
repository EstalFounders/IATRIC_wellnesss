import React, { useState } from "react";
import Link from "next/link";

/**
 * Shared FAQ accordion, used by /faqs (one block per topic) and by every
 * service/department page (only that topic's questions, via getFaqsForTopic()).
 *
 * Markup is the template's Bootstrap 4 card/collapse accordion, so the styling
 * scoped to `#faqs-page #accordion` in public/css/style.css applies. That is why
 * `wrapperId`/`accordionId` default to "faqs-page"/"accordion": a topic page
 * renders one self-contained block, while /faqs passes null for both and keeps
 * its own single wrappers around all 19 groups.
 *
 * The `data-toggle="collapse"` attribute is what draws the +/- indicator
 * (`[data-toggle="collapse"]:after` in style.css) - it does not attach any
 * Bootstrap JS behaviour, the open/closed state is React-driven below.
 */
const FaqSection = ({
  items,
  title,
  headingId,
  headingPrefix = "",
  wrapperId = "faqs-page",
  accordionId = "accordion",
  defaultOpenIndex = 0,
  seeAllHref,
  seeAllLabel = "See all FAQs",
}) => {
  // Card open inside this block: index of the item, "" when all are closed.
  const [openIndex, setOpenIndex] = useState(
    defaultOpenIndex === null ? "" : String(defaultOpenIndex)
  );

  const toggle = (index) =>
    setOpenIndex((current) => (current === String(index) ? "" : String(index)));

  if (!items?.length) return null;

  return (
    <div id={wrapperId || undefined}>
      {title ? (
        <h5 className="h5-xl blue-color" id={headingId}>
          {headingPrefix}
          {title}
        </h5>
      ) : null}

      <div id={accordionId || undefined}>
        {items.map(({ question, answer }, index) => {
          const id = `${headingId || "faq"}-${index}`;
          const isOpen = openIndex === String(index);

          return (
            <div className="card" key={question}>
              <div className="card-header" id={`heading-${id}`}>
                <h5 className="h5-xs">
                  <Link legacyBehavior href="#">
                    <a
                      data-toggle="collapse"
                      onClick={(e) => {
                        e.preventDefault();
                        toggle(index);
                      }}
                      aria-expanded={isOpen}
                      className={isOpen ? "" : "collapsed"}
                    >
                      {question}
                    </a>
                  </Link>
                </h5>
              </div>
              <div className={`collapse ${isOpen ? "show" : ""}`}>
                <div className="card-body">
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topics answer every question about that service - offer the full list. */}
      {seeAllHref ? (
        <p className="p-sm mb-0">
          <Link legacyBehavior href={seeAllHref}>
            <a>{seeAllLabel} &rarr;</a>
          </Link>
        </p>
      ) : null}
    </div>
  );
};

export default FaqSection;
