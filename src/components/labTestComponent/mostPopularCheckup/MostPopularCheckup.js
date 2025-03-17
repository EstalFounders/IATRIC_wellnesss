import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../css/MostPopularCheckup.module.css"; // Import the CSS module
import HealthCheckupCard from "../common/HealthCheckupCard";
import { HiArrowCircleRight } from "react-icons/hi";
import {
  filterActiveHealthTest,
  getLabCategoryId,
  getLabTestCategory,
  MoreButton,
} from "../common/CommonMethod";
import { useDispatch, useSelector } from "react-redux";
import { setMostPopularCheckUp } from "../../../store/slices/labTest/labTestCategoryApiData";

const MostPopularCheckup = () => {
  const healthCheckupData = useSelector(
    (state) => state.labtestHomepage.mostPopularCheckup
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLabCateogory = async () => {
      try {
        const response = await fetch("/api/labtest"); // Replace with your API endpoint
        const data = await response.json();
        const id = getLabCategoryId("FullBodyCheckup", data);
        await fetchLabTestsDetails(id);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchLabCateogory();
  }, []);

  const fetchLabTestsDetails = async (id) => {
    try {
      const response = await fetch(`/api/labtestcategorydetails/?id=${id}`); // Replace with your API endpoint
      const data = await response.json();
      console.log(data, "40");
      const activeData = filterActiveHealthTest(data);
      // setHealthCheckUpData(activeData);
      dispatch(setMostPopularCheckUp(activeData));
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  return (
    <>
      <Container>
        <div className="row d-flex justify-content-center align-items-center">
          <div className="row">
            <div className="col" style={{ marginTop: "15%" }}>
              <div className={styles.mostPopularText}>
                Most Popular checkups
              </div>
              <div className={styles.mostPopularTextSubtext}>
                Lorem ipsum dolor sit amet consectetur.
              </div>
            </div>
          </div>
          <Row>
            {loading && healthCheckupData > 0
              ? "Please wait"
              : healthCheckupData.map((checkup) => (
                  <Col
                    key={checkup._id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="m-5"
                  >
                    {" "}
                    {/* Key should be here */}
                    <HealthCheckupCard healthCheckupData={checkup} />
                  </Col>
                ))}
          </Row>
          <MoreButton healthCheckupData={healthCheckupData} />
        </div>
      </Container>
    </>
  );
};

export default MostPopularCheckup;
