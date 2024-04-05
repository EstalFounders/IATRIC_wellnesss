import { useState, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import { api } from "../../../constant";

const MedicineForm = ({ onChange }) => {
  const [medicineName, setMedicineName] = useState("");
  const [medicineGeneric, setMedicineGeneric] = useState("");
  const [unit, setUnit] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const daysRef = useRef("");
  const [frequency, setFrequency] = useState("");
  const [frequencyValue, setFrequencyValue] = useState("");
  const [time, setTime] = useState("");
  const [medicationSchedule, setMedicationSchedule] = useState("As Required");
  const [loading, setLoading] = useState(false); // State to track loading status
  const [medicinesInfo, setMedicinesInfo] = useState([]); // State to store fetched medicines
  const [error, setError] = useState(null); // State to store error message

  // Function to handle changes in input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "medicineName":
        setMedicineName(value);
        break;
      case "unit":
        setUnit(value);
        break;
      case "numberOfUnits":
        setNumberOfUnits(value);
        break;
      case "days":
        daysRef.current = value; // Update the ref directly
        break;
      case "frequency":
        setFrequency(value);
        break;
      case "time":
        setTime(value);
        break;
      case "medicationSchedule":
        setMedicationSchedule(value);
        break;
      case "frequencyValue":
        setFrequencyValue(value);
        break;
      default:
        break;
    }
    // Call the parent onChange function to pass the updated values
    onChange({
      medicineName,
      medicineGeneric,
      unit,
      numberOfUnits,
      days: daysRef.current, // Access the value directly from the ref
      frequency,
      frequencyValue,
      time,
      medicationSchedule,
    });
  };

  const handleFindMedicine = async () => {
    setLoading(true); // Set loading to true before fetching data
    setError(null); // Clear previous error message

    // Call the function to find medicine
    try {
      // Fetch data from DailyMed API
      const response = await fetch(`${api.medicineInfoApiCall}${medicineName}`);
      const data = await response.json();
      setMedicinesInfo(data.data);
    } catch (error) {
      console.error("Error fetching medicine information:", error);
      setError("Error fetching medicine information:");
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  const handleMedicineSelect = (event) => {
    const medicine = event.target[event.target.selectedIndex].title;
    // Extracting medicine name
    const startIndex = medicine.indexOf("(");
    const endIndex = medicine.indexOf(")");
    const medicineName = medicine.substring(0, startIndex).trim();
    // Extracting salt
    const salt = medicine.substring(startIndex + 1, endIndex).trim();
    setMedicineName(medicineName);
    setMedicineGeneric(salt);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "grid", gap: "10px" }}>
        <div className="row">
          <div className="col" xs={12} md={8}>
            <label>
              Medicine Name:
              <input
                type="text"
                name="medicineName"
                value={medicineName}
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                  marginRight: "10px",
                }}
                onChange={handleInputChange}
              />
            </label>
            <div className="mb-2">
              <small>Click Find Medicine</small>
            </div>
          </div>
          <div className="col mt-3" xs={12} md={4}>
            <span
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                display: "block", // Ensure clickable text is displayed as block element
                textAlign: "center", // Center the text on mobile devices
              }}
              className="text-primary"
              onClick={handleFindMedicine}
            >
              Find Medicine
            </span>
          </div>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {medicinesInfo != "" && !error && (
          <select onChange={handleMedicineSelect} value={medicineName}>
            <option>Select a medicine</option>
            {medicinesInfo.map((medicine) => (
              <option
                key={medicine.setid}
                value={medicine.tittle}
                title={medicine.title} // Set full title as tooltip
              >
                {medicine.title.length > 20
                  ? `${medicine.title.slice(0, 33)}...`
                  : medicine.title}
              </option>
            ))}
          </select>
        )}
        <div className="row">
          <div className="col">
            <label>
              UNIT:
              <select
                name="unit"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
                value={unit}
              >
                <option value="select">select Unit</option>
                <option value="UNIT">UNIT</option>
                <option value="TABLET">TABLET</option>
                <option value="CAPSULE">CAPSULE</option>
                <option value="TEA SPOON">TEA SPOON</option>
                <option value="DROP">DROP</option>
                <option value="APPLICATION">APPLICATION</option>
                <option value="PUFF">PUFF</option>
                <option value="PACKET">PACKET</option>
                <option value="SACHET">SACHET</option>
                {/* Add more options as needed */}
              </select>
            </label>
          </div>
          <div className="col">
            <label>
              No of unit:
              <input
                type="text"
                name="numberOfUnits"
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>
              Days:
              <input
                type="text"
                name="days"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <label>
              Frequency:
              <select
                name="frequency"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
                value={frequency}
              >
                <option value="SELECT">Select Frequency</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="SOS">SOS</option>
                <option value="AS REQUIRED">AS REQUIRED</option>
                <option value="ALTERNATIVE DAYS">ALTERNATIVE DAYS</option>
                <option value="BI WEEKLY">BI WEEKLY</option>
                <option value="BI MONTHLY">BI MONTHLY</option>
                {/* Add more options as needed */}
              </select>
            </label>
          </div>
          <div className="col">
            <label>
              No of times:
              <input
                name="frequencyValue"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>

        <label>
          Time:
          <select
            name="time"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            onChange={handleInputChange}
            value={time}
          >
            <option value="select">Select Time</option>
            <option value="MORNING">MORNING</option>
            <option value="AFTERNOON">AFTERNOON</option>
            <option value="EVENING">EVENING</option>
            <option value="NIGHT">NIGHT</option>
            <option value="SOS">SOS</option>
            {/* Add more options as needed */}
          </select>
        </label>
        <label>
          Medication Schedule:
          <select
            name="medicationSchedule"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            onChange={handleInputChange}
            value={medicationSchedule}
          >
            <option value="select">Select Medication Schedule</option>
            <option value="BEFORE MEAL">As Required</option>
            <option value="BEFORE MEAL">BEFORE MEAL</option>
            <option value="AFTER MEAL">AFTER MEAL</option>
            <option value="SOS">SOS</option>
            {/* Add more options as needed */}
          </select>
        </label>
      </div>
    </div>
  );
};

export default MedicineForm;
