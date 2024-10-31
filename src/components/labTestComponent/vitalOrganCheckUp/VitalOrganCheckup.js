import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "../css/VitalOrganCheckUp.module.css";
import { FaLongArrowAltRight } from "react-icons/fa";
import Image from "next/image";
import { HiArrowCircleRight } from "react-icons/hi";
import { MoreButton } from "../common/CommonMethod";

const VitalOrganCheckup = () => {
  const [selectedFilter, setSelectedFilter] = useState("heart");

  const tests = [
    {
      id: 1,
      name: "Full Body Check Up",
      category: "full-body",
      icon: "/images/labtest/test/test.jpg",
      discount: "20",
      testCount: "10",
      price: "300",
      discountPrice: "232",
      test_included: "",
    },
    {
      id: 2,
      name: "Diabetes Check",
      category: "diabetes",
      icon: "/images/labtest/test/test.jpg",
      discount: "",
      testCount: "12",
      price: "259",
      discountPrice: "232",
      test_included: "",
    },
    {
      id: 3,
      name: "Heart Check Up",
      category: "heart",
      icon: "/images/labtest/test/test.jpg",
      discount: "15",
      testCount: "14",
      price: "340",
      discountPrice: "232",
      test_included: "",
    },
    {
      id: 4,
      name: "Kidney Function Test",
      category: "kidney",
      icon: "/images/labtest/test/test.jpg",
      discount: "30",
      testCount: "11",
      price: "290",
      discountPrice: "232",
      test_included: "",
    },
    // Add more tests as needed
  ];

  // Adding image and text properties to filters
  const filters = [
    {
      label: "Heart",
      category: "heart",
      image: "/images/labtest/vitalOrganCheckup/heart.webp",
      description:
        "Heart checkup provides detailed insights into your cardiovascular health.",
    },
    {
      label: "Kidney",
      category: "kidney",
      image: "/images/labtest/vitalOrganCheckup/kidney.webp",
      description:
        "Kidney Function Test helps monitor the health of your kidneys.",
    },
    {
      label: "Thyroid",
      category: "thyroid",
      image: "/images/labtest/vitalOrganCheckup/thyroid.webp",
      description:
        "Thyroid tests assess your thyroid function and hormone levels.",
    },
    {
      label: "Sexual",
      category: "sexual",
      image: "/images/labtest/vitalOrganCheckup/sexual.jpeg",
      description:
        "Sexual health tests ensure your reproductive system is functioning properly.",
    },
    {
      label: "Vital",
      category: "vital",
      image: "/images/labtest/vitalOrganCheckup/vital.avif",
      description:
        "Vital organ tests are essential for your overall health and wellbeing.",
    },
    // Add more filters as needed
  ];

  const filteredTests =
    selectedFilter === "all"
      ? tests
      : tests.filter((test) => test.category === selectedFilter);

  // Finding the selected filter's details
  const selectedFilterDetails = filters.find(
    (filter) => filter.category === selectedFilter
  ) 

  return (
    <>
      <Container className="mb-5">
        <div className="row">
          <div className="row">
            <div className="col text-center" style={{ marginTop: "15%" }}>
              <div className={styles.vitalBodyCheckupText}>
                Checkups for Vital body organs
              </div>
              <div className={styles.vitalBodyCheckupSubText}>
                Lorem ipsum dolor sit amet consectetur. Mollis erat duis aliquam
                mauris est risus lectus. Phasellus consequat urna tellus.
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="row mr-auto ml-auto mt-5">
            {filters.map((filter) => (
              <Col xs="auto" key={filter.category}>
                <div
                  className={`rounded-pill  ${styles.filterButton} ${
                    selectedFilter === filter.category ? styles.active : ""
                  }`}
                  onClick={() => setSelectedFilter(filter.category)}
                >
                  {filter.label}
                </div>
              </Col>
            ))}
          </div>

          {/* New Row with Dynamic Image and Text */}
          <Row className="align-items-center mt-5 mx-4">
            <Col xs={12} md={6}>
              <Image
                src={selectedFilterDetails.image}
                alt={`${selectedFilterDetails.label} Image`}
                height={650}
                width={670}
                className="img-fluid rounded"
              />
            </Col>
            <Col xs={12} md={6}>
              <h3>{selectedFilterDetails.label}</h3>
              <p>{selectedFilterDetails.description}</p>
              <MoreButton />
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
};

export default VitalOrganCheckup;
