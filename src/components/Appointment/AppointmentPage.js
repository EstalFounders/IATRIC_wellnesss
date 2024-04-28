import Link from "next/link";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "../../constant";

const AppointmentPage = () => {
  const [doctorChoice, setDoctorChoice] = useState("any");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("rightNow");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [consultationType, setConsultationType] = useState("");
  const [doctors, setDoctors] = useState([]); // Initially all doctors are shown
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchSlots = async () => {
    // const formattedDate = selectedDate.toISOString().split("T")[0]; // Format the date as YYYY-MM-DD
    const formattedDate = selectedDate.toISOString();
    const doctorId = selectedDoctor;
    const response = await fetch(
      `/api/slots/fetchSlot/?doctor=${doctorId}&date=${formattedDate}`
    );
    const data = await response.json();
    if (data.success) {
      setAvailableSlots(data.data);
    } else {
      console.error("Failed to fetch slots:", data.message);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]); // Add fetchSlots to the dependency array if it doesn't change or is wrapped in useCallback

  useEffect(() => {
    const fetchDoctors = async () => {
      // Check if data is stored in session storage
      const storedDoctors = sessionStorage.getItem("doctors");
      if (storedDoctors) {
        setDoctors(JSON.parse(storedDoctors)); // Parse and set to state
      } else {
        try {
          const response = await fetch(api.addDoctor);
          if (!response.ok) {
            throw new Error("Failed to fetch");
          }
          const data = await response.json();
          sessionStorage.setItem("doctors", JSON.stringify(data)); // Store fetched data in session storage
          setDoctors(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchDoctors(); // Call the fetchData function
  }, []); // Empty dependency array ensures the effect runs only once

  const handleDoctorChoiceChange = (event) => {
    const choice = event.target.value;
    setDoctorChoice(choice);
    setSelectedDoctor("");
    if (choice === "any") {
      setSelectedDoctor("");
    }
    setShowDatePicker(appointmentTime === "chooseTime" && choice === "any"); // Update to show/hide date picker based on choice
  };

  const handleDoctorSelection = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleTimeSelection = (event) => {
    const timeChoice = event.target.value;
    setAppointmentTime(timeChoice);
    if (timeChoice === "rightNow") {
      setSelectedDate("");
    }
    setShowDatePicker(timeChoice === "chooseTime" && doctorChoice === "any");
  };

  // const fetchAvailableSlots = (doctorId) => {
  //   // Fetch logic to get slots
  //   // This is a dummy implementation
  //   setAvailableSlots(["9:00 AM", "10:00 AM", "11:00 AM"]); // Example slots
  // };

  const handleSlotSelection = (slot) => {
    console.log("Slot selected:", slot);
    setSelectedSlot(slot);
    // Handle slot booking logic here
  };

  // Handler to update the consultation type based on the selected radio button
  const handleConsultationChange = (event) => {
    const selectedType = event.target.value;
    setConsultationType(selectedType);

    // Filter doctors based on the selected consultation type
    if (
      selectedType === "Online consultations" ||
      selectedType === "Home visit"
    ) {
      const filtered = doctors.filter((doctor) =>
        doctor.consultationType.includes(selectedType)
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
                        value="Online consultations"
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
                        value="Online consultations"
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
                        value="Online consultations"
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
                        value="Home visit"
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
                        <option value="">
                          {" "}
                          {consultationType
                            ? "-- Please select doctor -- "
                            : " -- Please select consultation type -- "}{" "}
                        </option>
                        {filteredDoctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
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
                    <div>
                      <h3>Select a Date to View Available Slots</h3>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        inline
                        highlightDates={availableSlots.map((slot) => ({
                          "react-datepicker__day--highlighted": new Date(
                            slot.startTime
                          ),
                        }))}
                      />
                      <ul>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                          }}
                        >
                          {availableSlots
                            .filter((slot) => !slot.isBooked)
                            .map((slot) => (
                              <li
                                key={slot._id}
                                style={{
                                  color: "black",
                                  backgroundColor:
                                    selectedSlot?._id === slot._id
                                      ? "#9f9856"
                                      : "white",
                                  border: "1px solid black",
                                  padding: "5px", // Reduced padding
                                  margin: "5px",
                                  borderRadius: "5px", // Reduced border-radius for a less rounded look
                                  width: "30%", // Adjust width to make boxes smaller
                                  maxWidth: "160px", // Maximum width to ensure they don't grow too large
                                  textAlign: "center",
                                  cursor: "pointer",
                                  transition: "background-color 0.3s",
                                  fontSize: "0.9rem", // Smaller font size for better readability in small boxes
                                  lineHeight: "1.4", // Adjust line height for better text spacing
                                }}
                                onClick={() => handleSlotSelection(slot)}
                              >
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </li>
                            ))}
                        </div>
                      </ul>
                    </div>
                  ) : appointmentTime === "chooseTime" &&
                    doctorChoice === "any" ? (
                    <div className="col-lg-12">
                      <input
                        type="datetime-local"
                        name="dateTimePicker"
                        className="form-control"
                        value={selectedDate} // Make sure this is in the right format: 'YYYY-MM-DDTHH:mm'
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
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
