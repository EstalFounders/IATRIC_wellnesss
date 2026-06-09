import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "../css/AppointmentModel.module.css";

const WhatsappConfirmationModel = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="float-right mr-2 mt-1 clickable-div" onClick={onClose}>
          X
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsappConfirmationModel;
