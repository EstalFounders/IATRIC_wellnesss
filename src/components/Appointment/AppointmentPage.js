import Link from "next/link";
import React, { useState } from "react";

const AppointmentPage = () => {
  const [doctorChoice, setDoctorChoice] = useState("any");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("rightNow");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [consultationType, setConsultationType] = useState("");

  const doctors = [
    { id: "dr1", name: "Dr. Jonathan Barnes" },
    { id: "dr2", name: "Dr. Hannah Harper" },
    { id: "dr3", name: "Dr. Matthew Anderson" },
  ];

  const handleDoctorChoiceChange = (event) => {
    const choice = event.target.value;
    setDoctorChoice(choice);
    setSelectedDoctor("");
    setAvailableSlots([]);
    setShowDatePicker(appointmentTime === "chooseTime" && choice === "any"); // Update to show/hide date picker based on choice
  };

  const handleDoctorSelection = (event) => {
    setSelectedDoctor(event.target.value);
    fetchAvailableSlots(event.target.value);
  };

  const handleTimeSelection = (event) => {
    const timeChoice = event.target.value;
    setAppointmentTime(timeChoice);
    setShowDatePicker(timeChoice === "chooseTime" && doctorChoice === "any");
  };

  const fetchAvailableSlots = (doctorId) => {
    // Fetch logic to get slots
    // This is a dummy implementation
    setAvailableSlots(["9:00 AM", "10:00 AM", "11:00 AM"]); // Example slots
  };

  const handleSlotSelection = (slot) => {
    console.log("Slot selected:", slot);
    // Handle slot booking logic here
  };

  // Handler to update the consultation type based on the selected radio button
  const handleConsultationChange = (event) => {
    setConsultationType(event.target.value);
  };

  return (
    <div
      id="appointment-page"
      className="wide-60 appointment-page-section division"
    >
      <div className="container">
        <div className="row">
          {/* SERVICE DETAILS */}
          <div className="col-lg-8">
            <div className="txt-block pr-30">
              {/* Title */}
              <h3 className="h3-md steelblue-color">Make Appointment</h3>
              {/* Text */}
              <p>
                Porta semper lacus cursus, feugiat primis ultrice in ligula
                risus auctor tempus feugiat dolor lacinia cubilia curae integer
                congue leo metus, primis in orci integer metus mollis faucibus
                enim. Nemo ipsam egestas volute turpis dolores ut aliquam
                quaerat sodales sapien undo pretium purus feugiat dolor impedit
                magna purus pretium gravida donec ligula massa gravida donec
                pretium
              </p>
              {/* APPOINTMENT FORM */}
              <div className="text-center">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="appointment-form"
                >
                  {/* Symptoms Input */}
                  <div className="col-lg-12">
                    <input
                      type="text"
                      name="symptoms"
                      className="form-control"
                      placeholder="Enter Your Symptoms*"
                      required
                    />
                  </div>

                  {/* Mobile Number Input */}
                  <div className="col-lg-12">
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="Enter Your Mobile Number*"
                      required
                    />
                  </div>

                  {/* consultation type */}
                  <div
                    className="col-lg-12"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      style={{
                        marginRight: "20px", // The last label will be corrected with a conditional style
                      }}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value="audio"
                        onChange={handleConsultationChange}
                        style={{ marginRight: "10px" }}
                      />
                      <strong>Audio</strong>
                    </label>
                    <label
                      style={{
                        marginRight: "20px",
                      }}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value="video"
                        onChange={handleConsultationChange}
                        style={{ marginRight: "10px" }}
                      />
                      Video
                    </label>
                    <label
                      style={{
                        marginRight: "20px",
                      }}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value="chat"
                        onChange={handleConsultationChange}
                        style={{ marginRight: "10px" }}
                      />
                      Chat
                    </label>
                    <label
                      style={{
                        marginRight: "0", // Last child with no right margin
                      }}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value="homeVisit"
                        onChange={handleConsultationChange}
                        style={{ marginRight: "10px" }}
                      />
                      Home Visit
                    </label>
                  </div>

                  {/* Doctor Choice */}
                  <div
                    className="col-lg-12"
                    style={{ textAlign: "center", marginBottom: "20px" }}
                  >
                    <label style={{ marginRight: "20px" }}>
                      <input
                        type="radio"
                        name="doctorChoice"
                        value="any"
                        checked={doctorChoice === "any"}
                        onChange={handleDoctorChoiceChange}
                        style={{ marginRight: "10px" }}
                      />
                      Any Doctor
                    </label>
                    <label style={{ marginLeft: "20px" }}>
                      <input
                        type="radio"
                        name="doctorChoice"
                        value="choose"
                        checked={doctorChoice === "choose"}
                        onChange={handleDoctorChoiceChange}
                        style={{ marginRight: "10px" }}
                      />
                      Choose a Doctor
                    </label>
                  </div>

                  {/* Conditional Doctor Selection Dropdown */}
                  {doctorChoice === "choose" && (
                    <div className="col-lg-12">
                      <select
                        name="doctor"
                        className="custom-select"
                        value={selectedDoctor}
                        onChange={handleDoctorSelection}
                        required={doctorChoice === "choose"}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.name}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Time Selection */}
                  <div
                    className="col-lg-12"
                    style={{ textAlign: "center", marginBottom: "20px" }}
                  >
                    <label style={{ marginRight: "30px" }} className="ml-2">
                      <input
                        type="radio"
                        name="appointmentTime"
                        value="rightNow"
                        checked={appointmentTime === "rightNow"}
                        onChange={handleTimeSelection}
                        style={{ marginRight: "10px" }}
                      />
                      Right Now
                    </label>
                    <label style={{ marginRight: "30px" }} className="ml-3">
                      <input
                        type="radio"
                        name="appointmentTime"
                        value="chooseTime"
                        checked={appointmentTime === "chooseTime"}
                        onChange={handleTimeSelection}
                        style={{ marginRight: "10px" }}
                      />
                      Choose Time
                    </label>
                  </div>

                  {/* Conditional Time Picker or Slots Display */}
                  {appointmentTime === "chooseTime" &&
                  doctorChoice === "choose" &&
                  selectedDoctor ? (
                    <div className="col-lg-12">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelection(slot)}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <p>No available slots for selected doctor.</p>
                      )}
                    </div>
                  ) : appointmentTime === "chooseTime" &&
                    doctorChoice === "any" ? (
                    <div className="col-lg-12">
                      <input
                        type="date"
                        name="datePicker"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  ) : null}

                  {/* Submit Button */}
                  <div className="col-lg-12">
                    <button type="submit" className="btn btn-blue blue-hover">
                      Consult
                    </button>
                  </div>
                </form>
              </div>

              {/* END APPOINTMENT FORM */}
              {/* Text */}
              <p className="p-sm grey-color mb-30">
                * Porta semper lacus cursus, feugiat primis ultrice in ligula
                risus auctor tempus feugiat dolor lacinia cubilia curae integer
                congue leo metus, primis in orci integer metus mollis faucibus
                enim. Nemo ipsam egestas volute turpis dolores ut aliquam
                quaerat sodales sapien undo pretium purus
              </p>
            </div>
          </div>
          {/* END SERVICE DETAILS */}
          {/* SIDEBAR */}
          <aside id="sidebar" className="col-lg-4">
            {/* TEXT WIDGET */}
            <div id="txt-widget" className="sidebar-div mb-50">
              {/* Title */}
              <h5 className="h5-sm steelblue-color">The Heart Of Clinic</h5>
              {/* Head of Clinic */}
              <div className="txt-widget-unit mb-15 clearfix d-flex align-items-center">
                {/* Avatar */}
                <div className="txt-widget-avatar">
                  <img
                    src="images/head-of-clinic.jpg"
                    alt="testimonial-avatar"
                  />
                </div>
                {/* Data */}
                <div className="txt-widget-data">
                  <h5 className="h5-md steelblue-color">Dr. Jonathan Barnes</h5>
                  <span>Chief Medical Officer, Founder</span>
                  <p className="blue-color">1-800-1234-567</p>
                </div>
              </div>
              {/* End Head of Clinic */}
              {/* Text */}
              <p className="p-sm">
                An enim nullam tempor sapien at gravida donec pretium ipsum
                porta justo integer at odiovelna vitae auctor integer congue
                magna purus
              </p>
              {/* Button */}
              <Link legacyBehavior href="/about">
                <a className="btn btn-blue blue-hover">Learn More</a>
              </Link>
            </div>
            {/* END TEXT WIDGET */}
            {/* SIDEBAR TABLE */}
            <div className="sidebar-table blue-table sidebar-div mb-50">
              {/* Title */}
              <h5 className="h5-md">Working Time</h5>
              {/* Text */}
              <p className="p-sm">
                Porta semper lacus cursus, feugiat primis ultrice ligula risus
                auctor at tempus feugiat dolor lacinia cursus nulla vitae massa
              </p>
              {/* Table */}
              <table className="table">
                <tbody>
                  <tr>
                    <td>Mon – Wed</td>
                    <td> - </td>
                    <td className="text-right">9:00 AM - 7:00 PM</td>
                  </tr>
                  <tr>
                    <td>Thursday</td>
                    <td> - </td>
                    <td className="text-right">9:00 AM - 6:30 PM</td>
                  </tr>
                  <tr>
                    <td>Friday</td>
                    <td> - </td>
                    <td className="text-right">9:00 AM - 6:00 PM</td>
                  </tr>
                  <tr className="last-tr">
                    <td>Sun - Sun</td>
                    <td>-</td>
                    <td className="text-right">CLOSED</td>
                  </tr>
                </tbody>
              </table>
              {/* Title */}
              <h5 className="h5-xs">Need a personal health plan?</h5>
              {/* Text */}
              <p className="p-sm">
                Porta semper lacus cursus, and feugiat primis ultrice ligula at
                risus auctor
              </p>
            </div>
            {/* END SIDEBAR TABLE */}
          </aside>
          {/* END SIDEBAR */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </div>
  );
};

export default AppointmentPage;
