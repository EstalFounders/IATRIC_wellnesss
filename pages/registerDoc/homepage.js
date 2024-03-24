// pages/homepage.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Col, Row } from "react-bootstrap";

const Homepage = () => {
  const router = useRouter();
  const [previewVisible, setPreviewVisible] = useState(false);

  // Function to toggle preview visibility
  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  // Function to handle preview button click
  const handlePreview = () => {
    togglePreview();
    // Optionally, you can also perform any other actions here before showing the preview
  };

  useEffect(() => {
    // Set session start time in local storage when user logs in
    localStorage.setItem("sessionStartTime", new Date().getTime());

    // Start a timer for 30 minutes
    const sessionTimeout = setTimeout(() => {
      // Redirect to login page after 30 minutes
      router.push("/registereDoc/login");
    }, 30 * 60 * 1000); // 30 minutes in milliseconds

    // Clear the timer and remove session start time from local storage when component unmounts
    return () => clearTimeout(sessionTimeout);
  }, []);

  // Check session expiration before any action
  useEffect(() => {
    const checkSession = () => {
      const sessionStartTime = localStorage.getItem("sessionStartTime");
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
      const now = new Date().getTime();

      if (now - parseInt(sessionStartTime) >= sessionTimeout) {
        router.push("/registerDoc/login"); // Redirect to login if session has expired
      }
    };

    // Check session expiration on each interaction with the homepage
    document.addEventListener("click", checkSession);
    document.addEventListener("mousemove", checkSession);

    // Clean up event listeners when component unmounts
    return () => {
      document.removeEventListener("click", checkSession);
      document.removeEventListener("mousemove", checkSession);
    };
  }, []);

  // CSS for the modal
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const modalContentStyle = {
    backgroundColor: "#fefefe",
    padding: "20px",
    borderRadius: "5px",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{ marginBottom: "30px", color: "#3b5f1d" }}
        className="text-center"
      >
        <b>
          <u>Doctor Prescription</u>
        </b>
      </h1>
      <div style={{ width: "90%", maxWidth: "500px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "grid", gap: "10px" }}>
            <Row>
              <Col>
                <label>
                  Name:
                  <input
                    type="text"
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  />
                </label>
              </Col>
              <Col>
                <label>
                  Age:
                  <input
                    type="number"
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  />
                </label>
              </Col>
              <Col>
                <label>
                  Gender:
                  <select
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </Col>
            </Row>
          </div>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Drug Allergies</h2>
          <label>
            Any Drug Allergies:
            <select
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              <option value="none">No known allergy from medicine</option>
              <option value="dust">Dust allergy</option>
              <option value="food">Food allergy</option>
              <option value="other">Other allergies</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Last Doctor Visit</h2>
          <label>
            When was the last doctor visit:
            <select
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              <option value="within_1_month">Within 1 month</option>
              <option value="within_3_months">Within 3 months</option>
              <option value="within_6_months">Within 6 months</option>
              <option value="over_6_months_ago">Over 6 months ago</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Last Health Test</h2>
          <label>
            When was the last health test:
            <select
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              <option value="within_6_months">Within 6 months</option>
              <option value="over_6_months_ago">Over 6 months ago</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h2>Medicine Form</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            <label>
              Medicine Name:
              <input
                type="text"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              />
            </label>
            <Row>
              <Col sm={3}>
                <label>
                  Unit:
                  <select
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  >
                    <option value="tablet">UNIT</option>
                    <option value="capsule">TABLET</option>
                    <option value="tea_spoon">CAPSULE</option>
                    <option value="tea_spoon">TEA SPOON</option>
                    <option value="tea_spoon">DROP</option>
                    <option value="tea_spoon">APPLICATION</option>
                    <option value="tea_spoon">PUFF</option>
                    <option value="tea_spoon">PACKET</option>
                    <option value="tea_spoon">SACHET</option>
                    {/* Add more options as needed */}
                  </select>
                </label>
              </Col>
              <Col>
                <label>
                  No of unit:
                  <input
                    type="text"
                    style={{
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  />
                </label>
              </Col>
            </Row>
            <label>
              Days:
              <input
                type="text"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              />
            </label>
            <label>
              Frequency:
              <select
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              >
                <option value="daily">DAILY</option>
                <option value="weekly">WEEKLY</option>
                <option value="weekly">MONTHLY</option>
                <option value="weekly">SOS</option>
                <option value="weekly">AS REQUIRED</option>
                <option value="weekly">ALTERNATIVE DAYS</option>
                <option value="weekly">BI WEEKLY</option>
                <option value="weekly">BI MONTHLY</option>
                {/* Add more options as needed */}
              </select>
            </label>
            <label>
              Time:
              <select
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              >
                <option value="morning">MORNING</option>
                <option value="afternoon">AFTERNOON</option>
                <option value="afternoon">EVENING</option>
                <option value="afternoon">NIGHT</option>
                <option value="afternoon">SOS</option>
                {/* Add more options as needed */}
              </select>
            </label>
            <label>
              Medication Schedule:
              <select
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              >
                <option value="morning">As Required</option>
                <option value="afternoon">BEFORE MEAL</option>
                <option value="afternoon">AFTER MEAL</option>
                <option value="afternoon">SOS</option>
                {/* Add more options as needed */}
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <button
          // onClick={handleCreatePrescription}
          className="bg-success border rounded px-3 text-white py-1"
        >
          Create
        </button>
        <button
          onClick={handlePreview}
          className="bg-success border rounded px-3 text-white py-1"
        >
          Preview
        </button>
      </div>
      {/* Preview Modal */}
      {previewVisible && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#fefefe",
              padding: "20px",
              borderRadius: "5px",
              maxHeight: "90%",
              overflowY: "auto",
            }}
          >
            <span
              className="close"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
              }}
              onClick={togglePreview}
            >
              &times;
            </span>
            <h2 className="text-secondary">
              <b>Preview</b>
            </h2>
            <div style={{ width: "100%" }}>
              <div style={{ width: "90%", maxWidth: "500px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Row>
                      <Col>
                        <label>
                          Name:
                          <input
                            type="text"
                            style={{
                              padding: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              width: "100%",
                            }}
                            readOnly
                          />
                        </label>
                      </Col>
                      <Col>
                        <label>
                          Age:
                          <input
                            type="number"
                            style={{
                              padding: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              width: "100%",
                            }}
                            readOnly
                          />
                        </label>
                      </Col>
                      <Col>
                        <label>
                          Gender:
                          <select
                            style={{
                              padding: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              width: "100%",
                            }}
                            disabled
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <h2>Drug Allergies</h2>
                  <label>
                    Any Drug Allergies:
                    <select
                      style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
                      disabled
                    >
                      <option value="none">
                        No known allergy from medicine
                      </option>
                      <option value="dust">Dust allergy</option>
                      <option value="food">Food allergy</option>
                      <option value="other">Other allergies</option>
                    </select>
                  </label>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <h2>Last Doctor Visit</h2>
                  <label>
                    When was the last doctor visit:
                    <select
                      style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
                      disabled
                    >
                      <option value="within_1_month">Within 1 month</option>
                      <option value="within_3_months">Within 3 months</option>
                      <option value="within_6_months">Within 6 months</option>
                      <option value="over_6_months_ago">
                        Over 6 months ago
                      </option>
                    </select>
                  </label>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <h2>Last Health Test</h2>
                  <label>
                    When was the last health test:
                    <select
                      style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
                      disabled
                    >
                      <option value="within_6_months">Within 6 months</option>
                      <option value="over_6_months_ago">
                        Over 6 months ago
                      </option>
                    </select>
                  </label>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h2>Medicine Form</h2>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <label>
                      Medicine Name:
                      <input
                        type="text"
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                        }}
                        readOnly
                      />
                    </label>
                    <Row>
                      <Col sm={3}>
                        <label>
                          Unit:
                          <select
                            style={{
                              padding: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              width: "100%",
                            }}
                            disabled
                          >
                            <option value="tablet">UNIT</option>
                            <option value="capsule">TABLET</option>
                            <option value="tea_spoon">CAPSULE</option>
                            <option value="tea_spoon">TEA SPOON</option>
                            <option value="tea_spoon">DROP</option>
                            <option value="tea_spoon">APPLICATION</option>
                            <option value="tea_spoon">PUFF</option>
                            <option value="tea_spoon">PACKET</option>
                            <option value="tea_spoon">SACHET</option>
                            {/* Add more options as needed */}
                          </select>
                        </label>
                      </Col>
                      <Col>
                        <label>
                          No of unit:
                          <input
                            type="text"
                            style={{
                              padding: "8px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              width: "100%",
                            }}
                            readOnly
                          />
                        </label>
                      </Col>
                    </Row>
                    <label>
                      Days:
                      <input
                        type="text"
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                        }}
                        readOnly
                      />
                    </label>
                    <label>
                      Frequency:
                      <select
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                        }}
                        disabled
                      >
                        <option value="daily">DAILY</option>
                        <option value="weekly">WEEKLY</option>
                        <option value="weekly">MONTHLY</option>
                        <option value="weekly">SOS</option>
                        <option value="weekly">AS REQUIRED</option>
                        <option value="weekly">ALTERNATIVE DAYS</option>
                        <option value="weekly">BI WEEKLY</option>
                        <option value="weekly">BI MONTHLY</option>
                        {/* Add more options as needed */}
                      </select>
                    </label>
                    <label>
                      Time:
                      <select
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                        }}
                        disabled
                      >
                        <option value="morning">MORNING</option>
                        <option value="afternoon">AFTERNOON</option>
                        <option value="afternoon">EVENING</option>
                        <option value="afternoon">NIGHT</option>
                        <option value="afternoon">SOS</option>
                        {/* Add more options as needed */}
                      </select>
                    </label>
                    <label>
                      Medication Schedule:
                      <select
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                        }}
                        disabled
                      >
                        <option value="morning">As Required</option>
                        <option value="afternoon">BEFORE MEAL</option>
                        <option value="afternoon">AFTER MEAL</option>
                        <option value="afternoon">SOS</option>
                        {/* Add more options as needed */}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
