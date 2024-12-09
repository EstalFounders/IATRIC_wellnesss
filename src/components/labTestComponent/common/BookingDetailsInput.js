import React, { useState } from "react";

const BookingDetailsInput = ({ onClose, bookTest }) => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");



  return (
    <div className="container">
      {/* First Row - Name Input */}
      <div className="text-right clickable-div" onClick={onClose}>
        X
      </div>
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
      </div>

      {/* Second Row - Mobile Number Input */}
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            className="form-control"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter your mobile number"
          />
        </div>
      </div>
      <div className="text-center bg-primary m-4 p-2 rounded clickable-div" onClick={() => bookTest({name,mobileNumber})}>Book Test</div>
    </div>
  );
};

export default BookingDetailsInput;
