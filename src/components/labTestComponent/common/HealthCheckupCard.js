import React, { useContext, useState } from "react";
import { TbKeyframes, TbReportSearch } from "react-icons/tb";
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import styles from "../css/HealthCheckUpCard.module.css";
import {
  calculateParameters,
  storeHealthCheckupData,
  useAddToCart,
} from "./CommonMethod";
import { Snackbar } from "@mui/material";
import { useRouter } from "next/router";
import { eventEmitter, price_symbol } from "../../../constant";
import { useDispatch } from "react-redux";
import { setHealthTestData } from "../../../store/slices/labTest/labTestCategoryApiData";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const HealthCheckupCard = ({ healthCheckupData }) => {
  const { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose } =
    useAddToCart();
  const dispatch = useDispatch();
  const router = useRouter();
  const handleViewDetails = (healthCheckupData) => {
    dispatch(setHealthTestData(healthCheckupData));
    router.push("/labTest/viewDetails");
  };
  return (
    <div className={styles.card}>
      {console.log(healthCheckupData, "healthcheckup data")}
      {/* Header section with discount, price and MRP */}
      <div className={styles.upperSection}>
        <div className={`row ${styles.header}`}>
          <div className={`col col-md-7`}>
            {/* You can replace this with an actual icon */}
            <span role="img" aria-label="icon">
              🩺
            </span>
          </div>
          <div
            className={`mr-1 ${styles.discount} d-flex align-items-center justify-content-center px-2 py-0`}
          >
            {healthCheckupData.discount}%off
          </div>
          <div className={`col ${styles.price}`}>
            {price_symbol}
            {healthCheckupData.price}{" "}
            <span className={styles.mrp}>
              {price_symbol}
              {healthCheckupData.price}
            </span>
          </div>
        </div>

        {/* Title Section */}
        <div className={styles.title}>
          <div className="mt-3">
            {/*
          OverlayTrigger wraps the element that will trigger the tooltip.
          placement="top" means the tooltip will appear above the element.
          overlay prop takes a function that returns the Tooltip component.
          The Tooltip needs a unique 'id' prop.
        */}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-${healthCheckupData.id}`}>
                  {healthCheckupData.title}
                </Tooltip>
              }
            >
              {/*
            The strong tag now has inline styles for truncation.
            - whiteSpace: 'nowrap' prevents text from wrapping to the next line.
            - overflow: 'hidden' hides any content that overflows the element's box.
            - textOverflow: 'ellipsis' displays an ellipsis (...) for clipped text.
            - display: 'block' is crucial for text-overflow to work correctly on inline elements like <strong>.
            - maxWidth: '100%' ensures it respects its parent's width.
          */}
              <strong
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                  maxWidth: "100%", // Adjust this or its parent's width to control truncation point
                }}
              >
                {healthCheckupData.title}
              </strong>
            </OverlayTrigger>
          </div>
        </div>
      </div>
      {/* Details Section */}
      <div className={`row ${styles.details}`}>
        {console.log(healthCheckupData.test_included, "test incldued")}
        <div className="col">
          <div className={`text-center ${styles.icon}`}>
            <TbKeyframes />
          </div>
          <strong className="font-weight-bold">
            {calculateParameters(healthCheckupData.test_included)} parameters
          </strong>{" "}
          included
        </div>
        <div className="col">
          <div className={`text-center ${styles.icon}`}>
            <TbReportSearch />
          </div>
          <strong className="font-weight-bold">Report in </strong>
          {healthCheckupData.reports_within}
        </div>
      </div>

      {/* Buttons Section */}
      <div className={`d-flex justify-content-center mt-3 ${styles.buttons}`}>
        <div
          className={`clickable-div ${styles.addToCartbutton} ${
            isClicked ? styles.clicked : ""
          }`}
          onClick={() => handleAddToCart({ healthCheckupData })}
        >
          Add to Cart
        </div>
        <div
          className={`clickable-div ${styles.viewDetailsButton}`}
          onClick={() => handleViewDetails(healthCheckupData)}
        >
          View Details
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
