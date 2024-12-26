import React, { useState } from "react";
import styles from "../css/ConsultationBooked.module.css";
import { labTest_status, price_symbol } from "../../../constant";
import ConsultationEarningTable from "../common/ConsultationEarningTable";
import LabTestEarningTable from "../common/LabTestEarningTable";
import {
  calculateConsultationEarning,
  calculateLabTestEarning,
  calculateTotalEarning,
} from "../common/CommonMethod";
import DoctorsEarningTable from "../common/DoctorsEarningTable";
import LabsEarningTable from "../common/LabsEarningTable";

const EarningsComp = () => {
  const [selectedBookingType, setSelectedBookingType] =
    useState("consultation");

  // Consultation bookings
  const consultationBookings = [
    {
      _id: 1,
      name: "John Doe",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "123",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 199,
      status: "COMPLETED",
    },
    {
      _id: 2,
      name: "John Doe",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "123",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 299,
      status: "COMPLETED",
    },
    {
      _id: 3,
      name: "John Doe",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      doctorId: "123",
      symptoms: "Cough and cold",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 199,
      status: "COMPLETED",
    },
    {
      _id: 4,
      name: "Jane Smith",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "124",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 399,
      status: "PENDING",
    },
    {
      _id: 5,
      name: "Jane Smith",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "124",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 159,
      status: "PENDING",
    },
    {
      _id: 6,
      name: "Jane Smith",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "124",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 159,
      status: "PENDING",
    },
    {
      _id: 7,
      name: "Tom Johnson",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "125",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 179,
      status: "RESCHEDULED",
    },
    {
      _id: 8,
      name: "Tom Johnson",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "125",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 159,
      status: "RESCHEDULED",
    },
    {
      _id: 9,
      name: "John Doe",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "123",
      userRemarks: ["None"],
      adminRemarks: ["None"],
      price: 179,
      status: "COMPLETED",
    },
    {
      _id: 10,
      name: "John Doe",
      consultationType: "Online",
      appointmentTime: "12:30 am",
      patientMobNo: "9922443355",
      symptoms: "Cough and cold",
      doctorId: "123",
      userRemarks: ["None"],
      adminRemarks: ["Noe"],
      price: 199,
      status: "COMPLETED",
    },
    // Add more consultation bookings as needed
  ];

  // Lab test data
  const labTests = [
    {
      _id: 1,
      name: "Vinay tomar",
      mobileNumber: "9999999999",
      totalPrice: "570",
      paymentStatus: "paid",
    },
    {
      _id: 2,
      name: "varu dev",
      mobileNumber: "9999999999",
      totalPrice: "450",
      paymentStatus: "paid",
    },
    {
      _id: 3,
      name: "santosh isngh",
      mobileNumber: "9999999999",
      totalPrice: "1570",
      paymentStatus: "paid",
    },
    {
      _id: 4,
      name: "shivam singh",
      mobileNumber: "9999999999",
      totalPrice: "260",
      paymentStatus: "paid",
    },
  ];

  const ConsultationEarning =
    calculateConsultationEarning(consultationBookings);

  const LabTestEarning = calculateLabTestEarning(labTests);

  // Render based on selected booking type
  const renderContent = () => {
    if (selectedBookingType === "consultation") {
      return (
        <>
          <div className="mt-5 h1 font-weight-bold">Consultation Earning</div>
          <ConsultationEarningTable
            heading="Consultation Earnings"
            appointments={consultationBookings}
            onUpdateStatus={() => {}}
          />
          <div className="mt-5 h1 font-weight-bold">Doctors Earning</div>
          <DoctorsEarningTable
            heading="Doctors Earning"
            appointments={consultationBookings}
            onUpdateStatus={() => {}}
          />
        </>
      );
    } else if (selectedBookingType === "labTest") {
      return (
        <>
          <div className="mt-5 h1 font-weight-bold">Lab Test Earning</div>
          <LabTestEarningTable appointments={labTests} />
          <div className="mt-5 h1 font-weight-bold">Labs Earning</div>
          <LabsEarningTable appointments={labTests} />
        </>
      );
    }
  };

  return (
    <div className={styles.bookingContainer}>
      {/* Circle Buttons */}
      <div className={styles.circleContainer}>
        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType("consultation")}
        >
          <span>Consultation Earning</span>
          <span className={`text-secondary ${styles.circleText}`}>
            {`${price_symbol}${ConsultationEarning}`}
          </span>
        </div>

        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType("labTest")}
        >
          <span>Lab Test Earning</span>
          <span className={`text-secondary ${styles.circleText}`}>
            {`${price_symbol}${LabTestEarning}`}
          </span>
        </div>
      </div>

      {/* Render the content based on selection */}
      {renderContent()}
    </div>
  );
};

export default EarningsComp;
