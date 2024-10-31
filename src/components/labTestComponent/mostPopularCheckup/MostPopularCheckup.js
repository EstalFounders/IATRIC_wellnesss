import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../css/MostPopularCheckup.module.css"; // Import the CSS module
import HealthCheckupCard from "../common/HealthCheckupCard";
import { HiArrowCircleRight } from "react-icons/hi";
import { MoreButton } from "../common/CommonMethod";

const healthCheckupData = [
  {
    _id: "66e57653b378ff8dfa602131",
    title: "Comprehensive Allergy Analysis Package",
    description:
      "Are you constantly suffering from sneezing, skin rashes, runny nose, ...",
    sample_required: ["Blood"],
    preparation_required: ["Fasting", "Avoid medication"],
    test_included: [
      {
        _id: "66e57653b378ff8dfa602130",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602131",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602132",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602133",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602134",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12","Vitamin B12"],
      },
     
      // Add more test objects here
    ],
    price: "320",
    discount: "30",
    report_within: "6 hours",
  },
  {
    _id: "66e57653b378ff8dfa602132",
    title: "Comprehensive Allergy Analysis Package",
    description:
      "Are you constantly suffering from sneezing, skin rashes, runny nose, ...",
    sample_required: ["Blood"],
    preparation_required: ["Fasting", "Avoid medication"],
    test_included: [
      {
        _id: "66e57653b378ff8dfa602130",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602131",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602132",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602133",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602134",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
     
      // Add more test objects here
    ],
    price: "320",
    discount: "30",
    report_within: "6 hours",
  },
  {
    _id: "66e57653b378ff8dfa602133",
    title: "Comprehensive Allergy Analysis Package",
    description:
      "Are you constantly suffering from sneezing, skin rashes, runny nose, ...",
    sample_required: ["Blood"],
    preparation_required: ["Fasting", "Avoid medication"],
    test_included: [
      {
        _id: "66e57653b378ff8dfa602130",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602131",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602132",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602133",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602134",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
     
      // Add more test objects here
    ],
    price: "320",
    discount: "30",
    report_within: "6 hours",
  },
  {
    _id: "66e57653b378ff8dfa602134",
    title: "Comprehensive Allergy Analysis Package",
    description:
      "Are you constantly suffering from sneezing, skin rashes, runny nose, ...",
    sample_required: ["Blood"],
    preparation_required: ["Fasting", "Avoid medication"],
    test_included: [
      {
        _id: "66e57653b378ff8dfa602130",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602131",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602132",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602133",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602134",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
     
      // Add more test objects here
    ],
    price: "320",
    discount: "30",
    report_within: "6 hours",
  },
  {
    _id: "66e57653b378ff8dfa602135",
    title: "Comprehensive Allergy Analysis Package",
    description:
      "Are you constantly suffering from sneezing, skin rashes, runny nose, ...",
    sample_required: ["Blood"],
    preparation_required: ["Fasting", "Avoid medication"],
    test_included: [
      {
        _id: "66e57653b378ff8dfa602130",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602131",
        testName: "MT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602132",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602133",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
      {
        _id: "66e57653b378ff8dfa602134",
        testName: "MEAT",
        description:
          "A variety of meats commonly consumed in diets, which can be tested for...",
        parameters: ["Protein", "Iron", "Vitamin B12"],
      },
     
      // Add more test objects here
    ],
    price: "320",
    discount: "30",
    report_within: "6 hours",
  },
  // ... other items
];

const MostPopularCheckup = () => {
  return (
    <>
    <Container>
      <div className="row mt-5">
        <div className="row ml-auto mr-auto mt-5">
          <div className="col" style={{ marginTop: "5%" }}>
            <div className={styles.mostPopularText}>Most Popular checkups</div>
            <div className={styles.mostPopularTextSubtext}>
              Lorem ipsum dolor sit amet consectetur.
            </div>
          </div>
        </div>
      </div>
      <div>
          <Row>
            {healthCheckupData.map((checkup) => (
              <Col
                key={checkup.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="m-4 ml-5"
              >
                {" "}
                {/* Key should be here */}
                <HealthCheckupCard
                  healthCheckupData = {checkup}
                />
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
