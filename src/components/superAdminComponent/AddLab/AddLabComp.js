import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { api, roles } from "../../../constant";
import styles from "../css/AddLabComp.module.css";
import Preloader from "../../Preloader";
import ConfirmModal from "../model/ConfirmModel";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";

const AddLabComponent = () => {
  const [availableTests, setAvailableTests] = useState([]); // Stores tests fetched from the API
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [searchQuery, setSearchQuery] = useState();
  const [labs, setLabs] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [labId, setLabId] = useState();
  const [currentLab, setCurrentLab] = useState({
    name: "",
    location: "",
    location_offered: [],
    mobile_number: "",
    email: "",
    tests_offered: [],
    isActive: true,
  });
  const userDetails = useSelector((state) => state.userDetails.userDetails);

  // Function to fetch tests from the API
  const fetchAvailableTests = async () => {
    try {
      setIsLoadingTests(true); // Show loader while fetching
      const response = await fetch(api.labTestDetails); // Replace with your API endpoint
      const data = await response.json();
      console.log(data, "data on 59");
      setAvailableTests(data || []); // Assuming the API returns { tests: [...] }
    } catch (error) {
      console.error("Error fetching available tests:", error);
    } finally {
      setIsLoadingTests(false); // Hide loader once done
    }
  };

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  useEffect(() => {
    // If no data in local storage, fetch from API
    fetch(api.addNewLab)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch consultations");
        }
        return response.json();
      })
      .then((data) => {
        setLabs(data);
        // Save fetched data to local storage for future use
      })
      .catch((error) => console.error("Error fetching consultations:", error));
  }, []);

  // When opening the modal, fetch available tests
  const handleAddLab = () => {
    setIsEditing(false);
    setCurrentLab({
      name: "",
      location: "",
      location_offered: [],
      mobile_number: "",
      email: "",
      tests_offered: [],
    });
    setShowModal(true);
  };

  const handleEditLab = (lab) => {
    console.log(lab, "lab");
    setLabId(lab._id);
    setIsEditing(true);
    setCurrentLab(lab);
    setShowModal(true);
  };

  const hanldeActiveToggle = (id) => {
    console.log(id, "id on 90");
    const labToEdit = labs.find((item) => item._id === id);
    setCurrentLab(labToEdit);
    if (labToEdit) {
      setCurrentLab({
        ...currentLab,
        isActive: !currentLab.isActive,
      });
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLab((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (isEditing) {
  //     // Update lab
  //     setLabs((prevLabs) =>
  //       prevLabs.map((lab) =>
  //         lab._id === currentLab._id ? { ...currentLab } : lab
  //       )
  //     );
  //   } else {
  //     // Add new lab
  //     setLabs((prevLabs) => [
  //       ...prevLabs,
  //       { ...currentLab, _id: labs.length + 1 },
  //     ]);
  //   }
  //   setShowModal(false);
  // };

  const handleRemoveTest = (testId) => {
    const updatedTests = currentLab.tests_offered.filter((id) => id !== testId);
    setCurrentLab({ ...currentLab, tests_offered: updatedTests });
  };

  const handleAddTest = (testId) => {
    if (!currentLab.tests_offered.includes(testId)) {
      const updatedTests = [...currentLab.tests_offered, testId];
      setCurrentLab({ ...currentLab, tests_offered: updatedTests });
    }
  };

  const handleNewAddLab = () => {
    console.log("Adding new lab...", currentLab);
    setLoading(true);
    fetch(api.addNewLab, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentLab),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add Lab");
        }
        return response.json();
      })
      .then((data) => {
        setShowModal(false);
        setLoading(false);
      })
      .catch((error) => console.error("Error adding Lab:", error));
  };

  const handleUpdate = (id) => {
    setLoading(true);
    fetch(`${api.addNewLab}?id=${labId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentLab),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update Lab");
        }
        setLoading(false);
        return response.json();
      })
      .then((data) => {
        console.log(data, "response 43");
      })
      .catch((error) => console.error("Error updating Lab:", error));
  };

  const handleDeleteRequest = (id) => {
    setLabId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = (id) => {
    setLoading(true);
    fetch(`${api.addNewLab}?id=${labId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete Lab");
        }
        setLoading(false);
        return response.text(); // You can use `.json()` if your backend returns a JSON response.
      })
      .then(() => {
        setLabs((prev) => prev.filter((item) => item._id !== id));
        setShowConfirmModal(false);
      })
      .catch((error) => console.error("Error deleting consultation:", error));
  };

  return (
    <Container>
      <h2 className="my-4 text-center">Manage Labs</h2>

      {/* Lab List */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>No.</th>
            <th>Lab Name</th>
            <th>Location Offered</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Tests</th>
            <th>Actions</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {labs.map((lab, index) => (
            <tr key={lab._id}>
              <td>{index + 1}</td>
              <td>{lab.name}</td>
              <td>{lab.location_offered.toString()}</td>
              <td>{lab.mobile_number}</td>
              <td>{lab.email}</td>
              <td>
                {lab.tests_offered
                  .map((testId) => {
                    const test = availableTests.find((t) => t._id === testId);
                    return test ? test.testName : ""; // Return empty string instead of null
                  })
                  .slice(0, 3)
                  .join(", ")}
              </td>

              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEditLab(lab)}
                >
                  Edit
                </Button>
              </td>
              <td>
                <div
                  className={styles.toggleSwitch}
                  style={{
                    backgroundColor: lab.isActive ? "green" : "gray",
                  }}
                >
                  <div
                    className={styles.toggleKnob}
                    style={{
                      left: lab.isActive ? "20px" : "2px",
                    }}
                  ></div>
                </div>
              </td>
              {/* New delete column */}
              <td>
                {/* <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "red",
                  }}
                  onClick={() => handleDeleteRequest(lab._id)} // Function to handle deletion
                  title="Delete Lab"
                >
                  🗑️
                </button> */}
                {userDetails.role.includes(roles.superAdmin) ? (
                  <MdDelete
                    style={{ cursor: "pointer" }}
                    className="ml-2"
                    onClick={() => handleDeleteRequest(lab._id)}
                  />
                ) : (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        You are not allowed to perform this action
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <MdDelete
                        style={{ cursor: "not-allowed", opacity: 0.5 }}
                        tabIndex={0} // Ensures it receives focus for tooltip
                      />
                    </span>
                  </OverlayTrigger>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Lab Button */}
      <Row className="mt-4">
        <Col className="text-center">
          <Button variant="primary" onClick={handleAddLab}>
            Add New Lab
          </Button>
        </Col>
      </Row>

      {/* Modal for Add/Edit Lab */}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Lab" : "Add New Lab"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <div className="row">
                <div className="col">
                  <Form.Label>Lab Name</Form.Label>
                </div>
                <div className="col text-right">
                  <div
                    className={styles.toggleSwitch}
                    onClick={() => hanldeActiveToggle(currentLab._id)}
                    style={{
                      backgroundColor: currentLab.isActive ? "green" : "gray",
                    }}
                  >
                    <div
                      className={styles.toggleKnob}
                      style={{
                        left: currentLab.isActive ? "20px" : "2px",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <Form.Control
                type="text"
                name="name"
                value={currentLab.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={currentLab.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location Offered</Form.Label>
              <Form.Control
                type="text"
                name="location_offered"
                value={currentLab.location_offered.toString()}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="mobile_number"
                maxLength={10}
                value={currentLab.mobile_number}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={currentLab.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Tests Offered
              </Form.Label>
              <div style={{ marginBottom: "10px" }}>
                {/* Search bar to filter tests */}
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="form-control"
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    width: "100%",
                  }}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                />
              </div>

              {isLoadingTests ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                  Loading tests...
                </p>
              ) : availableTests.length > 0 ? (
                <div
                  style={{
                    height: "200px", // Scrollable height
                    overflowY: "scroll", // Enable scrolling
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    padding: "10px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {/* Flex container for table-like layout */}
                  <div>
                    {/* Current Lab Tests with Remove Option */}
                    {
                      // isEditing && (
                      <div
                        style={{
                          marginBottom: "20px",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <h5>Current Lab Tests:</h5>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          {currentLab.tests_offered.map((testId, index) => {
                            // Find the test details by ID from availableTests
                            const test = availableTests.find(
                              (t) => t._id === testId
                            );
                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: "#fff",
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "5px",
                                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                <span style={{ marginRight: "10px" }}>
                                  {test?.testName || "Unknown Test"}
                                </span>
                                <div
                                  onClick={() => handleRemoveTest(testId)}
                                  style={{
                                    backgroundColor: "#ff4d4d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    padding: "1px 6px",
                                  }}
                                >
                                  X
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      // )
                    }

                    {/* Available Tests to Add */}
                    <div
                      style={{
                        height: "200px", // Scrollable height
                        overflowY: "scroll", // Enable scrolling
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        padding: "10px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <h5>Available Tests:</h5>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "15px",
                        }}
                      >
                        {availableTests
                          .filter(
                            (test) =>
                              test.testName
                                .toLowerCase()
                                .includes(searchQuery || "") &&
                              !currentLab.tests_offered.includes(test._id) // Exclude already added tests
                          )
                          .map((test) => (
                            <div
                              key={test._id}
                              className="form-check"
                              style={{
                                flex: "0 1 calc(33.333% - 15px)",
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#fff",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={test._id}
                                value={test.testName}
                                onChange={() => handleAddTest(test._id)}
                                style={{
                                  marginRight: "9px",
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={test._id}
                              >
                                {test.testName}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                  No tests available
                </p>
              )}
            </Form.Group>

            <div
              className="w-100 btn bg-primary"
              onClick={isEditing ? handleUpdate : handleNewAddLab}
            >
              {isEditing ? "Update Lab" : "Add Lab"}
            </div>
          </Form>
        </Modal.Body>
        {loading ? <Preloader /> : ""}
      </Modal>
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default AddLabComponent;
