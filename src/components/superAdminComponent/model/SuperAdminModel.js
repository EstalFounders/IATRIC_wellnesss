import React from 'react';
import styles from '../css/SuperAdminModel.module.css';

const SuperAdminModel = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={`d-flex align-items-center justify-content-center ${styles.modalBackdrop}`}>
      <div className={`d-flex flex-row ${styles.modalContent}`}>
        <div>
          {children}
        </div>
        <div onClick={onClose} className='clickable-div mr-2 mt-2 font-weight-bold'>
          X
        </div>
      </div>
    </div>
  );
};

export default SuperAdminModel;
