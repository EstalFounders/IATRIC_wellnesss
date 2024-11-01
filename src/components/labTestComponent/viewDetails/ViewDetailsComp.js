import { Container } from "react-bootstrap";
import LabTesLandingPageHeader from "../../../layout/Header/LabTestLandingPageHeader";
import styles from "../css/ViewDetails.module.css";
import { FaUserGroup } from "react-icons/fa6";
import Image from "next/image";
import {
  FaSyringe,
  FaClipboardList,
  FaUtensils,
  FaVenusMars,
  FaTint,
  FaChild,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  calculateParameters,
  formatPreparationRequired,
  getHealthCheckupData,
  MoreButton,
  useAddToCart,
} from "../common/CommonMethod";
import { Snackbar } from "@mui/material";
import HealthCheckupCard from "../common/HealthCheckupCard";

const ViewDetails = () => {
  const [healthCheckupData, setHealthCheckupData] = useState([]);
  const [storedData, setStoredData] = useState();
  const [expandedTestIndex, setExpandedTestIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedTestIndex(expandedTestIndex === index ? null : index);
  };

  const { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose } =
    useAddToCart();

  useEffect(() => {
    const storedData = getHealthCheckupData();
    setHealthCheckupData(storedData[0]);
    setStoredData(storedData);
  }, []);

  return (
    <div>
      {/* First Section */}
      <div className={`row ${styles.viewDetailsFirstSec}`}>
        <Container>
          <div className="row mt-4">
            <div className="col">
              <LabTesLandingPageHeader />
            </div>
          </div>
        </Container>
      </div>

      {/* Second Section */}
      <div className={`row mt-4 ${styles.viewDetailsSecondSec}`}>
        {/* Product Card */}
        <div className={`col-12 col-md-6 mb-3 ${styles.productCard}`}>
          {/* Title */}
          <div className={`mt-4 text-center ${styles.productTitle}`}>
            {healthCheckupData.title}
          </div>

          {/* Price Details */}
          <div
            className={`d-flex align-items-center justify-content-center mb-3 mt-4 ${styles.priceDetails}`}
          >
            {/* Discount */}
            <span className={`${styles.discount} me-2`}>
              -{healthCheckupData.discount}%
            </span>

            {/* Current Price */}
            <span className={`${styles.currentPrice} me-2`}>
              {healthCheckupData.price}
            </span>

            {/* Original Price */}
            <span className={`${styles.originalPrice} me-2`}>
              M.R.P: ₹{healthCheckupData.price}
            </span>

            {/* Divider */}
            <div
              className={`vr ${styles.divider} mx-2 d-none d-md-inline-block`}
            ></div>

            {/* Booking Info */}
            <span className={`${styles.bookingInfo} d-flex align-items-center`}>
              <FaUserGroup className="mr-2" />
              4K people booked this test
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`btn mt-3 ${styles.addToCartBtn}`}
            onClick={() => handleAddToCart({ healthCheckupData })}
          >
            Add to Cart
          </button>
        </div>

        {/* Image Section */}
        <div className="col-12 col-md-6 position-relative d-flex justify-content-center align-items-center">
          <Image
            width={200}
            height={200}
            src="/images/labtest/viewDetails/foreGroundImage.png"
            alt="Foreground Image"
            className={`img-fluid ${styles.foregroundImage}`}
          />
        </div>
      </div>

      {/* test details */}
      <div
        className={`d-flex flex-wrap justify-content-center mt-5 ${styles.testDetails}`}
      >
        {/* Includes */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div
            className={`d-flex align-items-center p-3 border rounded ${styles.prequisiteContainer}`}
          >
            <FaSyringe size={20} className="me-3" />
            <div className="ml-3">
              <div className={`${styles.detailsSmallText}`}>Includes</div>
              <div className={`mb-0 ${styles.detailsSmallTextValue}`}>
                {healthCheckupData.test_included
                  ? calculateParameters(healthCheckupData.test_included)
                  : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Reports in */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div
            className={`d-flex align-items-center p-3 border rounded ${styles.prequisiteContainer}`}
          >
            <FaClipboardList size={24} className="me-3" />
            <div className="ml-3">
              <div className={`${styles.detailsSmallText}`}>Reports in</div>
              <div className={`mb-0 ${styles.detailsSmallTextValue}`}>
                {healthCheckupData.report_within}
              </div>
            </div>
          </div>
        </div>

        {/* Sample Required */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div
            className={`d-flex align-items-center p-3 border rounded ${styles.prequisiteContainer}`}
          >
            <FaTint size={24} className="me-3" />
            <div className="ml-3">
              <div className={`${styles.detailsSmallText}`}>
                Sample Required
              </div>
              <div className={`mb-0 ${styles.detailsSmallTextValue}`}>
                {formatPreparationRequired(healthCheckupData.sample_required)}
              </div>
            </div>
          </div>
        </div>

        {/* Fasting */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div
            className={`d-flex align-items-center p-3 border rounded ${styles.prequisiteContainer}`}
          >
            <FaUtensils size={24} className="me-3" />
            <div className="ml-3">
              <div className={`${styles.detailsSmallText}`}>Fasting</div>
              <div className={`mb-0 ${styles.detailsSmallTextValue}`}>
                {formatPreparationRequired(
                  healthCheckupData.preparation_required
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div
            className={`d-flex align-items-center p-3 border rounded ${styles.prequisiteContainer}`}
          >
            <FaVenusMars size={24} className="me-3" />
            <div className="ml-3">
              <div className={`${styles.detailsSmallText}`}>Gender</div>
              <div className={`mb-0 ${styles.detailsSmallTextValue}`}>Both</div>
            </div>
          </div>
        </div>

        {/* Age */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div
            className={`d-flex align-items-center p-3 border rounded ${styles.prequisiteContainer}`}
          >
            <FaChild size={24} className="me-3" />
            <div className="ml-3">
              <div className={`${styles.detailsSmallText}`}>Age</div>
              <div className={`mb-0 ${styles.detailsSmallTextValue}`}>5+</div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.testDetails}`}>
        {healthCheckupData.test_included
          ? healthCheckupData.test_included.map((includedTest, index) => (
              <div key={includedTest._id} className={`mb-1`}>
                {/* Accordion Header */}
                <div
                  className={`p-3 d-flex justify-content-between align-items-center ${styles.testIncludedContainer}`}
                  onClick={() => handleToggle(index)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`mb-0 ${styles.testIncludedName}`}>
                    {includedTest.testName}
                  </div>
                  <span>{expandedTestIndex === index ? "-" : "+"}</span>
                </div>

                {/* Accordion Body */}
                {expandedTestIndex === index && (
                  <div className="p-3 border border-top-0 rounded-bottom">
                    <p className={styles.testIncludedDesc}>
                      {includedTest.description}
                    </p>

                    {/* Parameters */}
                    <ul className="list-unstyled">
                      {includedTest.parameters.map((parameter, j) => (
                        <li key={j} className={styles.testIncludedDesc}>
                          {parameter}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          : "No test found"}
        <div className={`ml-2 ${styles.relatedTestText}`}>Related Tests</div>
        <div className="d-flex flex-wrap mb-5">
          {console.log(storedData, "ehatl fadlaj")}
          {storedData
            ? storedData.map((checkup) => (
                <div key={checkup._id} className="col-12 col-sm-6 col-md-4 p-2">
                  <HealthCheckupCard healthCheckupData={checkup} />
                </div>
              ))
            : ""}
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <MoreButton />
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

export default ViewDetails;
