import { useRouter } from "next/router";
import React from "react";

export const ConsultationButton = ({ path, onClick, children, bgColor,color }) => {
  const router = useRouter();
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    router.push(path || "");
  };

  return (
    <div
      className="consultation-btn"
      style={bgColor ? { backgroundColor: bgColor,color: color } : undefined}
      onClick={handleClick}
      tabIndex={0}
    >
      {children}
    </div>
  );
};
