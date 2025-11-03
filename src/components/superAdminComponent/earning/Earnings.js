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
import { useSelector } from "react-redux";

const EarningsComp = () => {
  const [selectedBookingType, setSelectedBookingType] =
    useState("consultation");

  // Consultation bookings
  const consultationBookings = useSelector(
    (state) => state.superAdminHomePage.allAppointments
  );

  // // Lab test data
  const labTests = useSelector((state) => state.superAdminHomePage.labTest);

  const doctors = useSelector((state) => state.superAdminHomePage.allDoctors);

  const ConsultationEarning =
    calculateConsultationEarning(consultationBookings);
    console.log(ConsultationEarning, "ConsultationEarning");

  const LabTestEarning = calculateLabTestEarning(labTests);

  const labs = useSelector((state) => state.superAdminHomePage.allLab);

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
            doctors={doctors}
            onUpdateStatus={() => {}}
          />
        </>
      );
    } else if (selectedBookingType === "labTest") {
      return (
        <>
          <div className="mt-5 h1 font-weight-bold">Lab Test Earning</div>
          <LabTestEarningTable labTests={labTests} />
          <div className="mt-5 h1 font-weight-bold">Labs Earning</div>
          <LabsEarningTable appointments={labs} />
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
