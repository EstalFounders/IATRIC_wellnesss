import React from "react";
import styles from "../css/AppointmentModel.module.css";

const WhatsappConfirmationModel = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`d-flex align-items-center justify-content-center ${styles.modalBackdrop}`}
    >
      <div className={`${styles.modalContent}`}>
        <div className="float-right mr-2 mt-1 clickable-div" onClick={onClose}>
          X
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default WhatsappConfirmationModel;
