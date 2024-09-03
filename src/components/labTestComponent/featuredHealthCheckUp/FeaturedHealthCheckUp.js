import React, { useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import styles from "../css/FeaturedHealthCheckUp.module.css";
import TestDetailsCard from "./TestDetailsCard";
import { FaLongArrowAltRight } from "react-icons/fa";

const FeaturedHealthCheckUp = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");

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
    },
    // Add more tests as needed
  ];

  const filters = [
    { label: "All Tests", category: "all" },
    { label: "Full Body Check Up", category: "full-body" },
    { label: "Diabetes", category: "diabetes" },
    { label: "Heart", category: "heart" },
    { label: "Cancer", category: "cancer" },
    { label: "Vitamin", category: "vitamin" },
    { label: "Women Health", category: "women_health" },
    { label: "Skin care", category: "skin_care" },
    { label: "Liver", category: "liver" },
    { label: "Stress", category: "stress" },
    { label: "Kidney", category: "kidney" },
    // Add more filters as needed
  ];

  const filteredTests =
    selectedFilter === "all"
      ? tests
      : tests.filter((test) => test.category === selectedFilter);

  return (
    <>
      <Row
        className={`align-items-center border-top border-bottom py-5 ${styles.container}`}
      >
        <Col>
          <Row>
            <Col
              sm={8}
              md={6}
              lg={11}
              className={`text-left mb-4 ${styles.featuredHealthCheckUpText}`}
            >
              Featured Health Check Up
            </Col>
            <Row>
              <Col className="mt-4 h6">
                <Row>
                  <Col style={{whiteSpace: "nowrap"}}>SEE ALL</Col>
                    <FaLongArrowAltRight />
                </Row>
              </Col>
            </Row>
          </Row>
          <Row className="justify-content-center mb-3">
            {filters.map((filter) => (
              <Col xs="auto" key={filter.category}>
                <div
                  className={`rounded-pill ${styles.filterButton} border ${
                    selectedFilter === filter.category ? styles.active : ""
                  }`}
                  onClick={() => setSelectedFilter(filter.category)}
                >
                  {filter.label}
                </div>
              </Col>
            ))}
          </Row>

          <Row className="d-flex overflow-auto flex-row">
            {filteredTests.map((test) => (
              <Col xs={12} sm={6} md={4} lg={3} key={test.id} className="mb-3">
                <TestDetailsCard test={test} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default FeaturedHealthCheckUp;
