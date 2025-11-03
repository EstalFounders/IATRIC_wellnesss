import React from 'react';
import styles from '../css/SuperAdminModel.module.css';

const NotifcationPreviewModel = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={`d-flex align-items-center justify-content-center ${styles.modalBackdrop}`}>
      <div className={`d-flex flex-row ${styles.modalContent}`}>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default NotifcationPreviewModel;
