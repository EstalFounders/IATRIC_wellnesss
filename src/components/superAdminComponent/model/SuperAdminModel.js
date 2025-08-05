// components/SuperAdminModel.jsx
import React from "react";
import styles from "../css/SuperAdminModel.module.css";

const SuperAdminModel = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className={`d-flex align-items-center justify-content-center ${styles.modalBackdrop}`}
    >
      <div
        className={`d-flex flex-column bg-white rounded p-3 shadow-lg ${styles.modalContent} w-100`}
        style={{ maxWidth: "700px", width: "95%" }}
      >
        <div className="d-flex justify-content-end">
          <div
            onClick={onClose}
            className="clickable-div font-weight-bold"
            style={{ cursor: "pointer" }}
          >
            X
          </div>
        </div>

        <div className="py-2">{children}</div>
      </div>
    </div>
  );
};

export default SuperAdminModel;
