import React, { useContext, useState } from "react";
import styles from "../css/HealthCheckUpCard.module.css";
import { TbKeyframes, TbReportSearch } from "react-icons/tb";
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import { calculateParameters, storeHealthCheckupData, useAddToCart } from "./CommonMethod";
import { Snackbar } from "@mui/material";
import { useRouter } from "next/router";


const HealthCheckupCard = ({healthCheckupData}) => {
    const { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose } = useAddToCart();
    const router = useRouter()
    const handleViewDetails = (healthCheckupData) => {
        storeHealthCheckupData(healthCheckupData)
      router.push({pathname:'/labTest/viewDetails'})
    }
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
          <div className={`col col-md-2 ${styles.discount}`}>{healthCheckupData.discount}</div>
          <div className={`col ${styles.price}`}>
            ₹{healthCheckupData.price} <span className={styles.mrp}>₹{healthCheckupData.mrp}</span>
          </div>    
        </div>

        {/* Title Section */}
        <div className={styles.title}>
          <div className="mt-3">
            <strong>{healthCheckupData.title}</strong>
          </div>
        </div>
      </div>
      {/* Details Section */}
      <div className={`row ${styles.details}`}>
        <div className="col">
          <div className={`text-center ${styles.icon}`}>
            <TbKeyframes />
          </div>
          <strong className="font-weight-bold">{calculateParameters(healthCheckupData.test_included)} parameters</strong>{" "}
          included
        </div>
        <div className="col">
          <div className={`text-center ${styles.icon}`}>
            <TbReportSearch />
          </div>
          <strong className="font-weight-bold">Report in </strong>
          {healthCheckupData.report_within}
        </div>
      </div>

      {/* Buttons Section */}
      <div className={`d-flex justify-content-center mt-3 ${styles.buttons}`}>
        <div
          className={`${styles.addToCartbutton} ${isClicked ? styles.clicked : ""}`}
          onClick={() =>
            handleAddToCart({healthCheckupData})
          }
        >
          Add to Cart
        </div>
        <div className={styles.viewDetailsButton} onClick={() => handleViewDetails(healthCheckupData)}>View Details</div>
      </div>
      {snackbarOpen && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message="Item added to cart"
        />
      )}
    </div>
  );
};

export default HealthCheckupCard;
