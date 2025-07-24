import React, { useRef } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export const HorizontalScrollContainer = ({ children, height = "auto" }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%"}}>
      {/* Scroll Buttons */}
      <button
        className="scroll-btn left"
        onClick={() => scroll("left")}
        aria-label="Scroll Left"
      >
        <BiChevronLeft size={24} />
      </button>
      <button
        className="scroll-btn right"
        onClick={() => scroll("right")}
        aria-label="Scroll Right"
      >
        <BiChevronRight size={24} />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          padding: "1rem 0",
          scrollBehavior: "smooth",
        }}
        className="scroll-container"
      >
        {children}
      </div>
    </div>
  );
};
