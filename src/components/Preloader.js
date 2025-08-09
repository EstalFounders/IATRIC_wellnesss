import React from "react";
import styles from "./Common/css/Preloader.module.css";

const Preloader = () => {
  return (
    <div className={styles.pulseContainer}>
      <div className={styles.pulse} style={{ animationDelay: '0s' }}></div>
      <div className={styles.pulse} style={{ animationDelay: '0.5s' }}></div>
      <div className={styles.pulse} style={{ animationDelay: '1s' }}></div>
    </div>
  );
};

export default Preloader;
