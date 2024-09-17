import React, { useEffect, useState } from "react";
import { Row, Col, Table, Button, Form, Modal } from "react-bootstrap";
import { BiEdit } from "react-icons/bi";
import TestDetailsCard from "./TestDetailsCard";

const LabTestComponent = () => {
  // State to store fetched data
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [LoadingTest, setLoadingTest] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [testDetails, setTestDetails] = useState([]);

  // State for modal and editing
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null); // Selected test for editing

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch lab test details when component mounts
  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await fetch("/api/labtest"); // Replace with your API endpoint
        const data = await response.json();
        setLabTests(data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchLabTests();
  }, []);

  // Pagination calculation
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentLabTests = labTests.slice(indexOfFirstUser, indexOfLastUser);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter lab tests based on search
  const filteredLabTests = currentLabTests.filter((labTest) =>
    labTest.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open the modal and set the selected test
  const handleEditClick = (labTest) => {
    setSelectedTest(labTest);
    setShowModal(true);
  };

  // Handle saving edited details and hitting the update API
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/labtest/?id=${selectedTest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTest),
      });

      if (response.ok) {
        // Update the local state with the updated lab test
        const updatedLabTests = labTests.map((test) =>
          test._id === selectedTest._id ? selectedTest : test
        );
        setLabTests(updatedLabTests);
        setShowModal(false);
      } else {
        console.error("Failed to update the lab test");
      }
    } catch (error) {
      console.error("Error updating the lab test:", error);
    }
  };

  // Handle cancel button in modal
  const handleCancel = () => {
    setShowModal(false); // Just close the modal without saving
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleOpen = async (id) => {
    setLoadingTest(true); // Start loading state

    try {
      const response = await fetch(`/api/labtestdetails/?id=${id}`); // Replace with your API endpoint

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json(); // Assuming the API returns JSON
      setTestDetails(data); // Set the fetched data

      setShow(true); // Show modal only after data has been set
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingTest(false); // End loading state
    }
  };

  const handleClose = () => setShow(false);

  return (
    <div className="mx-5">
      <h2 className="mt-4">Lab Tests</h2>
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Control
            type="text"
            placeholder="Search Lab Tests"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col xs={12} md={2} className="mt-2 mt-md-0">
          <Button variant="primary" className="w-100">
            Go
          </Button>
        </Col>
        <Col xs={12} md={4} className="text-end mt-2 mt-md-0">
          <Button variant="success" className="w-100">
            New Test
          </Button>
        </Col>
      </Row>

      {/* Responsive Table */}
      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th></th>
            <th>Category Name</th>
            <th>Category description</th>
            {/* <th>Price</th>
            <th>Created Date</th>
            <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {filteredLabTests.map((labTest) => (
            <tr key={labTest._id}>
              <td>
                <BiEdit
                  onClick={() => handleEditClick(labTest)}
                  style={{ cursor: "pointer" }}
                />
              </td>
              <td className="font-weight-bold">{labTest.category_name}</td>
              <td>{labTest.category_description}</td>
              {/* <td>{labTest.price}</td>
              <td>{new Date(labTest.createdDate).toLocaleDateString()}</td> */}
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleOpen(labTest._id)}
                >
                  Details
                </Button>{" "}
                {/* Details button */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Row className="justify-content-between mt-3">
        <Col xs={12} md={6}>
          Showing results {indexOfFirstUser + 1} to{" "}
          {Math.min(indexOfLastUser, labTests.length)} of {labTests.length}
        </Col>
        <Col xs={12} md={6} className="text-end">
          <Button
            variant="outline-secondary"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastUser >= labTests.length}
          >
            &raquo;
          </Button>
        </Col>
      </Row>

      {/* Edit Modal */}
      {selectedTest && (
        <Modal show={showModal} onHide={handleCancel}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Lab Test</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="categoryName">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedTest.category_name}
                  onChange={(e) =>
                    setSelectedTest({
                      ...selectedTest,
                      category_name: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="categoryDescription" className="mt-3">
                <Form.Label>Category Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={selectedTest.category_description}
                  onChange={(e) =>
                    setSelectedTest({
                      ...selectedTest,
                      category_description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className="bg-secondary border" onClick={handleCancel}>
              Cancel
            </button>
            <button className="bg-primary border" onClick={handleSave}>
              Save
            </button>
          </Modal.Footer>
        </Modal>
      )}
      {show && (
        <div className="modal-overlay" style={{marginTop: '-500px'}}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Packages</h5>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
            <div className="modal-body">
              <Row className="d-flex flex-wrap">
                {testDetails.map((test) => (
                  <Col
                    key={test._id}
                    xs={12} // Adjust this based on the desired responsiveness
                    sm={6} // Adjust column sizes for different screen sizes
                    md={4}
                    lg={3}
                    className="mb-3"
                  >
                    <TestDetailsCard test={test} />
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestComponent;
