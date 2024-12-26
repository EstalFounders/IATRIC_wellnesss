import React, { useState } from "react";
import { Card, Badge, Row, Col, Button } from "react-bootstrap";
import Image from "next/image";
import { FaTrash } from "react-icons/fa"; // Import trash icon
import styles from "../css/TestDetailsCard.module.css";
import EditableTestDetails from "./EditableTestDetails";
import { price_symbol } from "../../../constant";

const TestDetailsCard = ({ test }) => {
  const [showEditableComponent, setShowEditableComponent] = useState(false);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);

  const handleOpenEditable = (testDetails) => {
    setSelectedTestDetails(testDetails); // Set the selected test details
    setShowEditableComponent(true); // Show the editable component
  };

  const handleCloseEditable = () => {
    setShowEditableComponent(false); // Hide the component
    setSelectedTestDetails(null); // Clear selected test details
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this test package?")) {
      try {
        const response = await fetch(
          `/api/labtestcategorydetails/?id=${test._id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete the test package");
        }

        alert("Test package deleted successfully!");
        // Optionally refresh the data or handle UI updates after deletion
      } catch (error) {
        alert(error.message);
      }
    }
  };

  

  return (
    <>
      <Card className={styles.testCard}>
        <Card.Body>
          <Row className="d-flex">
            <Col sm={10} md={8} lg={9}>
              <Image src={test.icon} alt={test.Title} width={40} height={40} />
            </Col>
            <Col sm={10} md={8} lg={3}>
              {test.discount && (
                <Badge variant="danger" className={styles.discountBadge}>
                  {test.discount}% Off
                </Badge>
              )}
            </Col>
          </Row>
          <Card.Title className={styles.testName}>{test.title}</Card.Title>
          <div className={styles.testIncluded}>
            Included {test.test_included.length} test
          </div>
          <Row className="mt-5">
            <Col sm={10} md={8} lg={3} className={styles.discountPrice}>
              {`${price_symbol}${test.discount}`}
            </Col>

            <Col sm={10} md={8} lg={5} className={`mt-1 ${styles.price}`}>
              {`${price_symbol}${test.price}`}
            </Col>

            <Col
              sm={10}
              md={8}
              lg={3}
              className={`border text-center pt-1 text-white ${styles.addButton}`}
              onClick={() => handleOpenEditable(test)}
            >
              Edit
            </Col>
            {/* Delete Button with Icon */}
            <Col
              sm={10}
              md={8}
              lg={3}
              className={`mt-2 text-center ${styles.deleteButton}`}
              onClick={handleDelete}
            >
              <FaTrash />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {showEditableComponent && selectedTestDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Test Details</h5>

             

              <Button variant="secondary" onClick={handleCloseEditable}>
                Close
              </Button>
            </div>
            <div className="modal-body">
              <EditableTestDetails data={selectedTestDetails} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        .deleteButton {
          background-color: red;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default TestDetailsCard;
