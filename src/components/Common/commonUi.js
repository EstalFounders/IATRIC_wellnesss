import { useRouter } from "next/router";
import React from "react";

export const ConsultationButton = ({ path, onClick, children }) => {
  const router = useRouter();
  const handleClick = (e) => {
    router.push(path || "/");
  };

  return (
    <div
      className="consultation-btn"
      onClick={handleClick}
      tabIndex={0}
      role="button"
    >
      {children}
    </div>
  );
};
