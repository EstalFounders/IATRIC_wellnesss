import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../css/MostPopularCheckup.module.css"; // Import the CSS module
import HealthCheckupCard from "../common/HealthCheckupCard";
import { HiArrowCircleRight } from "react-icons/hi";
import {
  getLabCategoryId,
  getLabTestCategory,
  MoreButton,
} from "../common/CommonMethod";

const MostPopularCheckup = () => {
  const [healthCheckupData, setHealthCheckUpData] = useState();
  const [loading, setLoading] = useState(true);
  const labTestCat = getLabTestCategory();

  useEffect(() => {
    const id = getLabCategoryId("FullBodyCheckup", labTestCat);
    const fetchLabTestsDetails = async () => {
      try {
        const response = await fetch(`/api/labtestcategorydetails/?id=${id}`); // Replace with your API endpoint
        const data = await response.json();
        setHealthCheckUpData(data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchLabTestsDetails();
  }, []);

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
            {loading
              ? "Please wait"
              : healthCheckupData.map((checkup) => (
                  <Col
                    key={checkup._id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="m-4 ml-5"
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
