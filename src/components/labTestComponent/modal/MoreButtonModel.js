import React from "react";
import styles from "../css/MoreButtonModal.module.css";
import HealthCheckupCard from "../common/HealthCheckupCard";

const MoreModalComp = ({ onClose, healthCheckupData }) => {
  return (
    <div
      className={`${styles.modal} d-flex align-items-center justify-content-center`}
    >
      <div className={`${styles.modalcontent} p-4 rounded`}>
        <div className={styles.allTestText}>All Tests</div>
        <div className={`${styles.scrollableContent} d-flex flex-wrap`}>
          {healthCheckupData ? healthCheckupData.map((checkup) => (
            <div key={checkup.id} className="col-12 col-sm-6 col-md-4 p-2">
              <HealthCheckupCard healthCheckupData={checkup} />
            </div> 
          )): "No test found"}
        </div>
        <div className={`${styles.closeButton} mt-3`}>
          <div
            onClick={onClose}
            className="btn bg-secondary w-25 text-center text-white rounded p-2 font-weight-bold"
          >
            Close
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreModalComp;
