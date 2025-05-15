import React, { useState, useEffect } from "react";
import { Button, Col, Row, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import LabTestList from "../LabTest/LabTestsList";
import LabTestEarningList from "../earning/LabTestEarning/LabTestEarningList";

const LabTestEarningTable = ({
  heading,
  isLoading,
  labTests,
  onStatusChanged,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLabTests, setFilteredLabTests] = useState(labTests);

  useEffect(() => {
    // Filter labTests based on search term
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = labTests.filter((labTest) => {
      // Check if labTest, labTest.name, or labTest.paymentStatus are undefined
      const name = labTest?.name?.toLowerCase() || "";
      const paymentStatus = labTest?.paymentStatus?.toLowerCase() || "";

      return (
        name.includes(lowerCaseSearchTerm) ||
        paymentStatus.includes(lowerCaseSearchTerm)
      );
    });
    setFilteredLabTests(results);
  }, [searchTerm, labTests]);

  return (
    <Row
      className="w-75 ml-auto mr-auto border p-4 mb-4"
      style={{ borderRadius: 20 }}
    >
      <Row className="w-100 mx-2 border-bottom pb-1">
        <Col className="mt-3 text-left">
          <h4>
            <b>{heading}</b>
          </h4>
        </Col>
        <Col className="text-right mt-2">
          <Button className="bg-secondary" href="/superAdmin/addDoctor">
            Book Lab Test
          </Button>
        </Col>
      </Row>

      {/* Search bar */}
      {labTests.length === 0 ? (
        ""
      ) : (
        <Row className="w-100 mt-3">
          <Col>
            <InputGroup className="mb-3 ml-2">
              <InputGroup.Text className="mr-2">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name or status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      )}

      <Row className="ml-4 w-100 mt-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredLabTests.length === 0 ? (
          <p>No Lab Test found.</p>
        ) : (
          <Col>
            <LabTestEarningList
              data={filteredLabTests}
              onStatusChanged={onStatusChanged}
              onUpdateStatus={onUpdateStatus}
              className="text-center"
            />
          </Col>
        )}
      </Row>
    </Row>
  );
};

export default LabTestEarningTable;
