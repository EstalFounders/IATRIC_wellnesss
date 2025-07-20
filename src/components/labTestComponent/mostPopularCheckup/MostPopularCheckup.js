import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../css/MostPopularCheckup.module.css"; // Import the CSS module
import HealthCheckupCard from "../common/HealthCheckupCard";
import { HiArrowCircleRight } from "react-icons/hi";
import {
  filterActiveHealthTest,
  getCategoryCheckup,
  getLabCategoryId,
  getLabTestCategory,
  MoreButton,
} from "../common/CommonMethod";
import { useDispatch, useSelector } from "react-redux";
import {
  allTestDetails,
  setAllTestDetails,
  setMostPopularCheckUp,
} from "../../../store/slices/labTest/labTestCategoryApiData";
import { labtestCateogory } from "../../../constant";
import {
  fetchLabCateogory,
  fetchLabTestsDetails,
} from "../apiService/HomePageService";
import { HorizontalScrollContainer } from "../common/HorizontalContainer";

const MostPopularCheckup = () => {
  const healthCheckupData = useSelector(
    (state) => state.labtestHomepage.allCheckUpDetails
  );
  const categoryDetails = useSelector(
    (state) => state.labtestHomepage.categoryDetails
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  // First: Fetch category list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await fetchLabCateogory(dispatch);
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [dispatch]);

  console.log(
    healthCheckupData,
    "health checkup data on 33 in most popular checkup"
  );

  const mostPopularCheckup = getCategoryCheckup(
    labtestCateogory.fullBodyCheckup,
    healthCheckupData,
    categoryDetails
  );

  // Second: Run this only when categoryDetails is ready
  useEffect(() => {
    const fetchTests = async () => {
      if (categoryDetails && categoryDetails.length > 0) {
        try {
          await fetchLabTestsDetails(
            labtestCateogory.fullBodyCheckup,
            dispatch,
            categoryDetails
          );
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch test details");
          setLoading(false);
        }
      }
    };

    fetchTests();
  }, [categoryDetails, dispatch]);

  return (
    <>
      <Container>
        <div className="row d-flex justify-content-center align-items-center">
          <div className="row">
            <div className="col" style={{ marginTop: "15%" }}>
              <div className={styles.mostPopularText}>Full Body checkups</div>
              <div className={styles.mostPopularTextSubtext}>
                Lorem ipsum dolor sit amet consectetur.
              </div>
            </div>
          </div>

          {/* Cards container with vertical scroll */}
          <HorizontalScrollContainer>
            {loading && mostPopularCheckup.length > 0
              ? "Please wait"
              : mostPopularCheckup.map((checkup) => (
                  <div key={checkup._id}>
                    <HealthCheckupCard healthCheckupData={checkup} />
                  </div>
                ))}
          </HorizontalScrollContainer>
        </div>

        {/* More Button */}
        <Row className="d-flex justify-content-center align-items-center mt-4 mb-3">
          <MoreButton
            viewCheckupData={mostPopularCheckup}
            category={labtestCateogory.fullBodyCheckup}
          />
        </Row>
      </Container>
    </>
  );
};

export default MostPopularCheckup;
