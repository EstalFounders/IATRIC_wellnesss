import React from "react";
import styles from "./css/ViewDoctorListModel.module.css";

const ViewDoctorListModel = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`d-flex align-items-center justify-content-center ${styles.modalBackdrop}`}
      onClick={onClose} // Close the modal when clicking outside the content
    >
      <div
        className={`d-flex flex-row ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="ml-auto mr-auto">{children}</div>
      </div>
    </div>
  );
};

export default ViewDoctorListModel;
