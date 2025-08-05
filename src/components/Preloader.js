import React from "react";
import styles from "./Common/css/Preloader.module.css";

const Preloader = () => {
  return (
    <div className={styles.heartbeatContainer}>
      <div className={styles.heart}></div>
    </div>
  );
};

export default Preloader;
