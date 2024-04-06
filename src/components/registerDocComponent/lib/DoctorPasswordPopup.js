import React, { useState } from "react";
import bcrypt from "bcryptjs"; // Import bcrypt for password comparison
import { Row } from "react-bootstrap";

const DoctorPasswordPopup = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = () => {
    // Check if password matches doctor's bcrypt password
    if (password) {
      // Call onCreate function if password is correct
      onSubmit(password);
    } else {
      // Display error message if password is incorrect
      setError("Incorrect password. Please try again.");
    }
  };

  const popupOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Ensure the popup is above other content
  };

  const popupStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)", // Drop shadow effect
    maxWidth: "400px",
    width: "100%",
    position: "relative",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "24px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
  };

  const errorMsgStyle = {
    color: "red",
  };

  const passwordInputStyle = {
    width: "calc(100% - 20px)", // Cover almost complete width
    padding: "10px",
    borderRadius: "5px", // Border radius
    border: "1px solid #ccc", // Border
    marginTop: "10px", // Add space between error message and password input
  };

  const submitButtonStyle = {
    backgroundColor: "#004080", // Dark blue color
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    // position: "absolute",
    bottom: "20px", // Position the button below the input
    left: "100%", // Center the button horizontally
    transform: "translateX(-50%)", // Adjust for center alignment
  };

  return (
    <div style={popupOverlayStyle}>
      <div style={popupStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          &times;
        </button>
        <h3>Enter Doctor Password</h3>
        <div className="row">
          <div className="col">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              style={passwordInputStyle}
            />
          </div>
        </div>
        {error && <p style={errorMsgStyle}>{error}</p>}
        <div className="row text-center mt-3 ml-5">
          <div className="col ml-2">
            <button style={submitButtonStyle} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPasswordPopup;
