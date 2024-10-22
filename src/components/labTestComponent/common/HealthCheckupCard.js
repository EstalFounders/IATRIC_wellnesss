import React from "react";
import styles from "../css/HealthCheckupCard.module.css";
import { TbKeyframes, TbReportSearch } from "react-icons/tb";


const HealthCheckupCard = ({
  discount,
  price,
  mrp,
  title,
  parameters,
  reportsTime,
}) => {
  return (
    <div className={styles.card}>
      {/* Header section with discount, price and MRP */}
      <div className={styles.upperSection}>
      <div className={`row ${styles.header}`}>
        <div className={`col col-md-7`}>
          {/* You can replace this with an actual icon */}
          <span role="img" aria-label="icon">
            🩺
          </span>
        </div>
        <div className={`col col-md-2 ${styles.discount}`}>{discount}</div>
        <div className={`col ${styles.price}`}>
          ₹{price} <span className={styles.mrp}>₹{mrp}</span>
        </div>
      </div>

      {/* Title Section */}
      <div className={styles.title}>
        <div className="mt-3">
           <strong>{title}</strong>         
        </div>
      </div>
      </div>
      {/* Details Section */}
      <div className={`row ${styles.details}`}>
        <div className="col">
            <div className={`text-center ${styles.icon}`}><TbKeyframes /></div>
          <strong className="font-weight-bold">{parameters} parameters</strong>  included
        </div>
        <div className="col">
            <div className={`text-center ${styles.icon}`}><TbReportSearch /></div>
          <strong className="font-weight-bold">Report in </strong>{reportsTime}
        </div>
      </div>

      {/* Buttons Section */}
      <div className={styles.buttons}>
        <button className={styles.addToCartbutton}>Add to Cart</button>
        <button className={styles.viewDetailsButton}>View Details</button>
      </div>
    </div>
  );
};

export default HealthCheckupCard;
