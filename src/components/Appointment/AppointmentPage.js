import Link from "next/link";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api, consultationTypeMapping, sessionStorageName } from "../../constant";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CustomDialog from "../CustomPopup";
import { generateSlotsForChooseTime, isWithinBusinessHours } from "../helper";
import { useRouter } from "next/router";
import styles from "./css/appointmentPage.module.css";
import { style } from "@mui/system";
import Preloader from "../Preloader";
import AppointmentBookingModal from "./modal/AppointmentBookingModal";
import Image from "next/image";
import { isMobileValid } from "../../helper";

const AppointmentPage = () => {
  const router = useRouter();
  const [doctorChoice, setDoctorChoice] = useState("any");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [locallyCreatedSlots, setLocallyCreatedSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]); // Initially all doctors are shown
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobNo, setMobNo] = useState("");
  const [consultationType, setConsultationType] = useState("Call");
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [severity, setSeverity] = useState("info");
  const [isLoading, setIsLoading] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [consultationprice, setConsultationPrice] = useState("");
  const [bookingResponse, setBookingResponse] = useState();
  const withinBusinessHours = isWithinBusinessHours();

  const fetchSlots = async () => {
    const formattedDate = selectedDate
      ? selectedDate.toISOString()
      : new Date().toISOString;
    const doctorId = selectedDoctorId;
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
    const fetchConsultationFees = async () => {
      const storedConsultations = sessionStorage.getItem(sessionStorageName.ConsultationFee);
      console.log(storedConsultations, "stored consultation");

      let consultationFees;

      // Only fetch from API if localStorage is invalid or empty
      if (storedConsultations && storedConsultations !== "null") {
        consultationFees = JSON.parse(storedConsultations);

        if (Array.isArray(consultationFees) && consultationFees.length > 0) {
          console.log("Using stored consultations from localStorage.");
          setConsultationTypes(consultationFees);
          setConsultationPrice(consultationFees[0].fee)
        } else {
          consultationFees = null;
        }
      }

      if (!consultationFees) {
        console.log("Fetching consultation fees from API...");
        const response = await fetch(api.consiltationFee, {
          method: "GET",
          cache: "no-cache", // Avoids browser caching for debugging
        });
        consultationFees = await response.json();
        setConsultationTypes(consultationFees);
        setConsultationPrice(consultationFees[0].fee)
        sessionStorage.setItem(
          sessionStorageName.ConsultationFee,
          JSON.stringify(consultationFees)
        );
      }

      // Process the saved label in both cases
      processSavedLabel(consultationFees);
    };

    const processSavedLabel = (consultationFees) => {
      const savedLabel = sessionStorage.getItem("selectedLabel");
      console.log("Saved Label from sessionStorage:", savedLabel);

      if (
        savedLabel &&
        Array.isArray(consultationFees) &&
        consultationFees.length > 0
      ) {
        const matchingConsultation = consultationFees.find(
          (consultation) =>
            consultation.name === savedLabel // Case insensitive
        );

        if (matchingConsultation) {
          setConsultationType(matchingConsultation.name);
          setConsultationPrice(matchingConsultation.fee);
          console.log(
            "Matched Consultation Type:",
            matchingConsultation.name,
            "Price:",
            matchingConsultation.fee
          );
        } else {
          console.log("No matching consultation type found.");
        }
      }
    };

    fetchConsultationFees();
  }, []);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSlots();
    }
  }, [selectedDoctorId, selectedDate]); // Add fetchSlots to the dependency array if it doesn't change or is wrapped in useCallback

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
    if (choice === "any") {
      setSelectedDoctorId("");
    }
    setShowDatePicker(appointmentTime === "chooseTime" && choice === "any"); // Update to show/hide date picker based on choice
  };

  const handleDoctorSelection = (event) => {
    setSelectedDoctorId(event.target.value);
  };

  const handleTimeSelection = (event) => {
    const timeChoice = event.target.value;
    setAppointmentTime(timeChoice);
    if (timeChoice == "chooseTime") {
    }
    setShowDatePicker(timeChoice === "chooseTime" && doctorChoice === "any");
  };

  const handleSlotSelection = (slot) => {
    console.log("Slot selected:", slot);
    setSelectedSlot(slot);
    // Handle slot booking logic here
  };

  const handleConsultationChange = (event) => {
    console.log(event.target.value, "event");
    const selectedType = event.target.value;
    const matchingConsultation = consultationTypes.find(
      (consultation) => consultation.name === selectedType
    );
    if (matchingConsultation) {
      setConsultationType(matchingConsultation.name);
      setConsultationPrice(matchingConsultation.fee);
    }

    filterDoctors(selectedType);
  };

  const filterDoctors = (selectedOption) => {
    const type = consultationTypeMapping[selectedOption]; // Get the corresponding consultation type from the map

    console.log(selectedDate, type, "type and selected option", doctors);

    const filtered = doctors.filter((doctor) => {
      // If the type is "Online consultations" or "Offline consultations", check if the doctor's type includes it
      if (type === "Online consultations" || type === "Offline consultations") {
        return doctor.consultationType.includes(type);
      }
      // Special handling for "Home visit" to match exactly
      return doctor.consultationType === "Home visit";
    });

    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    if (doctors) {
      filterDoctors(consultationType);
    }
  }, [doctors]);

  useEffect(() => {
    if (appointmentTime === "chooseTime") {
      const slots = generateSlotsForChooseTime(selectedDate, 9, 21, 15); // Generate slots from 9 AM to 9 PM with 15-minute intervals
      setLocallyCreatedSlots(slots);
    }
  }, [selectedDate, appointmentTime]);

  useEffect(() => {
    if (doctorChoice === "choose" && appointmentTime === "Now") {
      try {
        if (!selectedSlot) {
          checkAvailableSlot(); // Wait for the available slot to be set
        }
      } catch (error) {
        console.error("Slot check failed:", error);
        return; // Stop execution if no slot is available
      }
    }
  }, [availableSlots]);

  const handleOpenSnackBar = () => {
    setOpenSnackBar(true);
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  const handleShowDialog = (msg) => {
    setMessage(msg);
    setBookingResponse(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMessage("");
  };

  const bookConsultation = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !mobNo.trim() ||
      !symptoms.trim() ||
      !consultationType.trim() ||
      appointmentTime === ""
    ) {
      setSnackBarMessage("All fields are required.");
      handleOpenSnackBar();
      return;
    }
    if (!isMobileValid(mobNo)) {
      setSnackBarMessage("Please enter 10 digit in mobile number");
      handleOpenSnackBar();
      return;
    }
    try {
      setIsLoading(true);
      const consultationData = {
        selectedDoctorId,
        appointmentTime,
        selectedDate,
        selectedSlot,
        symptoms,
        name,
        email,
        patientMobNo: mobNo,
        consultationprice,
        consultationType,
      };
      const response = await fetch(api.bookConsultation, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Booking successful:", data.message);
        handleShowDialog(data.message);
      } else {
        const errorData = await response.json();
        console.error("Failed to book consultation:", errorData.message);
        setSnackBarMessage(errorData.message || "Failed to book consultation.");
        handleOpenSnackBar();
      }
    } catch (err) {
      console.log(err);
      setSnackBarMessage("An error occurred. Please try again.");
      handleOpenSnackBar();
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailableSlot = () => {
    return new Promise((resolve, reject) => {
      const now = new Date();
      now.setMinutes(0);
      now.setSeconds(0);
      now.setMilliseconds(0);

      const availableSlot = availableSlots.find((slot) => {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);
        return now >= startTime && now < endTime && !slot.isBooked;
      });

      if (availableSlot) {
        console.log(availableSlot._id, "when now selected slot id");
        setSelectedSlot(availableSlot);
        resolve(availableSlot); // Resolve the promise with the available slot
      } else {
        setSeverity("warning");
        setSnackBarMessage(
          "Currently, no slots are available. Please choose another time or try again later."
        );
        handleOpenSnackBar();
      }
    });
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
              <h3 className={`${styles.makeAppointmentText}`}>
                Make Appointment
              </h3>
              {/* Text */}
              <p className={styles.makeAppointmentSubText}>
                Porta semper lacus cursus, feugiat primis ultrice in ligula
                risus auctor tempus feugiat dolor lacinia cubilia curae integer
                congue leo metus, primis in orci integer metus mollis faucibus
              </p>
              {/* APPOINTMENT FORM */}
              <div className="text-center">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="appointment-form"
                >
                  {/* Symptoms Input */}
                  <textarea
                    name="symptoms"
                    className={styles.textarea}
                    placeholder="Describe your symptoms..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                  <input
                    type="text"
                    name="name"
                    className={styles.input}
                    placeholder="Name*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="email"
                    name="email"
                    className={styles.input}
                    placeholder="Email*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="tel"
                    name="mobile"
                    className={styles.input}
                    placeholder="Mobile Number*"
                    min={10}
                    max={10}
                    value={mobNo}
                    onChange={(e) => setMobNo(e.target.value)}
                  />

                  <div className={styles.priceText}>
                    Price: {consultationprice} /-
                  </div>

                  {/* consultation type */}
                  <div
                    className="col-lg-12 mt-3"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    {consultationTypes
                      .filter((item) => item.isActive) // Only include items with isActive: true
                      .map((option, index) => (
                        <label
                          key={option._id}
                          style={{
                            marginRight:
                              index === consultationTypes.length - 1
                                ? "0"
                                : "20px",
                          }}
                        >
                          <input
                            type="radio"
                            name="consultationType"
                            value={option.name}
                            checked={consultationType === option.name} // Compare with option.name
                            onChange={(e) => handleConsultationChange(e)}
                            style={{ marginRight: "10px" }}
                          />
                          <strong className={styles.radioText}>
                            {option.name}
                          </strong>{" "}
                          {/* Show name */}
                        </label>
                      ))}
                  </div>

                  {/* Doctor Choice */}
                  <div
                    className={`col-lg-12 ${styles.radioText}`}
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
                    {consultationType != "Home Visit" && (
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
                    )}
                  </div>

                  {/* Conditional Doctor Selection Dropdown */}
                  {doctorChoice === "choose" && (
                    <div className={`col-lg-12 ${styles.radioText}`}>
                      <select
                        name="doctor"
                        className="custom-select"
                        value={selectedDoctorId}
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
                    className={`col-lg-12 ${styles.radioText}`}
                    style={{ textAlign: "center", marginBottom: "20px" }}
                  >
                    {withinBusinessHours && (
                      <label style={{ marginRight: "30px" }} className="ml-2">
                        <input
                          type="radio"
                          name="appointmentTime"
                          value="Now"
                          checked={appointmentTime === "Now"}
                          onChange={handleTimeSelection}
                          style={{ marginRight: "10px" }}
                        />
                        Now
                      </label>
                    )}
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
                  selectedDoctorId ? (
                    <div>
                      <h3>Select a Date to View Available Slots</h3>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        inline
                        minDate={new Date()}
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
                            .filter((slot) => {
                              const slotDate = new Date(slot.startTime);
                              return (
                                !slot.isBooked &&
                                slotDate.getTime() > new Date().getTime()
                              );
                            })
                            .map((slot) => (
                              <li
                                key={slot._id}
                                style={{
                                  color: "black",
                                  backgroundColor:
                                    selectedSlot._id === slot._id
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
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        inline
                        minDate={new Date()}
                        highlightDates={locallyCreatedSlots.map((slot) => ({
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
                          {locallyCreatedSlots
                            .filter((slot) => {
                              const currentDate = new Date();
                              return (
                                selectedDate.toDateString() ===
                                  slot.startTime.toDateString() &&
                                slot.startTime > currentDate
                              );
                            })
                            .map((slot) => (
                              <li
                                key={slot._id}
                                style={{
                                  color: "black",
                                  backgroundColor:
                                    selectedSlot &&
                                    selectedSlot._id === slot._id
                                      ? "#9f9856"
                                      : "white",
                                  border: "1px solid black",
                                  padding: "5px",
                                  margin: "5px",
                                  borderRadius: "5px",
                                  width: "30%",
                                  maxWidth: "160px",
                                  textAlign: "center",
                                  cursor: "pointer",
                                  transition: "background-color 0.3s",
                                  fontSize: "0.9rem",
                                  lineHeight: "1.4",
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
                  ) : null}

                  {/* Submit Button */}
                  <div className="col-lg-12">
                    <button
                      type="submit"
                      className="btn btn-blue blue-hover"
                      onClick={bookConsultation}
                    >
                      {isLoading ? "......" : "Consult"}
                    </button>
                  </div>
                  <Snackbar
                    open={openSnackBar}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackBar}
                  >
                    <Alert
                      onClose={handleCloseSnackBar}
                      severity={severity}
                      sx={{ width: "100%" }}
                    >
                      {snackBarMessage}
                    </Alert>
                  </Snackbar>
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
          {/* <CustomDialog
            show={showDialog}
            handleClose={handleCloseDialog}
            message={message}
          /> */}
          <AppointmentBookingModal
            isOpen={bookingResponse}
            onClose={() => setBookingResponse(false)}
          >
            <div className={styles.successMessage}>
              <Image src={"/images/success.png"} width={100} height={100} />
              <div className={`${styles.successText} mt-3`}>Thank you!</div>
              <div className={styles.successText}>{message}</div>
            </div>
          </AppointmentBookingModal>
        </div>
        {/* End row */}
      </div>
      {isLoading ? <Preloader /> : ""}
      {/* End container */}
    </div>
  );
};

export default AppointmentPage;
