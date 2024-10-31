import React from 'react';
import styles from '../css/LabTestLogin.module.css';

const LabTestLogin = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={`d-flex align-items-center justify-content-center ${styles.modalBackdrop}`}>
      <div className={`${styles.modalContent}`}>
        {/* <div className="text-right">
          <div onClick={onClose} className='clickable-div'>x</div>
        </div> */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default LabTestLogin;
