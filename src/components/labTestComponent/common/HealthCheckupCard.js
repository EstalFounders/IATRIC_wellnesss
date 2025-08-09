import React, { useContext, useState } from "react";
import { TbKeyframes, TbReportSearch } from "react-icons/tb";
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import styles from "../css/HealthCheckUpCard.module.css";
import {
  calculateDiscountedPrice,
  calculateParameters,
  storeHealthCheckupData,
  useAddToCart,
} from "./CommonMethod";
import { Snackbar } from "@mui/material";
import { useRouter } from "next/router";
import { eventEmitter, price_symbol } from "../../../constant";
import { useDispatch } from "react-redux";
import { setHealthDataDetails } from "../../../store/slices/labTest/labTestCategoryApiData";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const HealthCheckupCard = ({ healthCheckupData }) => {
  const { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose } =
    useAddToCart();
  const dispatch = useDispatch();
  const router = useRouter();
  const handleViewDetails = (healthCheckupData) => {
    dispatch(setHealthDataDetails(healthCheckupData));
    router.push("/labTest/viewDetails");
  };

  return (
    <div
      className={styles.card}
      onClick={() => handleViewDetails(healthCheckupData)}
    >
      {/* Header section with discount, price and MRP */}
      <div
        className={`p-3 text-white lab-test-bg-gradient ${styles.upperSection}`}
      >
        {/* Title Section */}
        <div className="mb-2">
          <strong
            className="d-block text-truncate h3"
            style={{ maxWidth: "100%" }}
            title={healthCheckupData.title}
          >
            {healthCheckupData.title}
          </strong>
        </div>

        {/* Price and Discount Section */}
        <div className="d-flex align-items-center justify-content-between mt-2">
          {/* Price block */}
          <div>
            <div className="d-flex align-items-center">
              <span className="h5 mb-0 font-weight-bold">
                ₹{" "}
                {calculateDiscountedPrice(
                  healthCheckupData.discount,
                  healthCheckupData.price
                )}
              </span>
              <span className="text-dark mr-2 ml-2 text-decoration-line-through">
                ₹{healthCheckupData.price}
              </span>
            </div>
          </div>

          {/* Discount badge */}
          {healthCheckupData.discount && (
            <span className="badge bg-success text-white py-1 px-2">
              {healthCheckupData.discount}% Off
            </span>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="px-5">
        <div
          className={`row justify-content-center align-items-center text-center ${styles.details}`}
        >
          <div className="col-auto d-flex flex-column align-items-center">
            <div className={`mb-2 ${styles.icon}`}>
              <TbKeyframes />
            </div>
            <div>
              <strong className="font-weight-bold">
                {calculateParameters(healthCheckupData.test_included)}{" "}
                parameters
              </strong>{" "}
              included
            </div>
          </div>

          <div className="col-auto d-flex flex-column align-items-center">
            <div className={`mb-2 ${styles.icon}`}>
              <TbReportSearch />
            </div>
            <div>
              <strong className="font-weight-bold">Report in </strong>
              {healthCheckupData.reports_within}
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div
          className={`d-flex justify-content-center mt-2 p-3 ${styles.buttons}`}
        >
          <div
            className={`clickable-div text-nowrap ${styles.addToCartbutton} ${
              isClicked ? styles.clicked : ""
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent onClick
              handleAddToCart({ healthCheckupData });
            }}
          >
            Add to Cart
          </div>

          {/* <div
            className={`clickable-div text-nowrap ${styles.viewDetailsButton}`}
          >
            View Details
          </div> */}
        </div>
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
