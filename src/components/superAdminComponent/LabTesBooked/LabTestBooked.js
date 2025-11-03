import React, { useState } from "react";
import styles from "../css/ConsultationBooked.module.css";
import AppointTable from "../common/AppointmentTable";
import { api, labTest_status } from "../../../constant";
import LabBookedListTable from "../common/LabBookedListTable";
import LabListTable from "../common/LabListTable";
import { useSelector } from "react-redux";

const LabTestBookedComp = () => {
  const [selectedBookingType, setSelectedBookingType] = useState(
    labTest_status.total
  );

  // Complete array of all bookings
  const bookings = useSelector((state) => state.superAdminHomePage.labTest);

  const listOflab = useSelector((state) => state.superAdminHomePage.allLab);;

  // Filtered bookings based on status
  const totalBookings = bookings;
  const pendingBookings = bookings.filter(
    (booking) => booking.paymentStatus === labTest_status.pending
  );
  const unpaidBookings = bookings.filter(
    (booking) => booking.paymentStatus === labTest_status.unpaid
  );

  // Choose which booking list to display based on selectedBookingType
  const displayBookings =
    selectedBookingType === labTest_status.total
      ? totalBookings
      : selectedBookingType === labTest_status.pending
      ? pendingBookings
      : unpaidBookings;

  const handleUpdateStatus = async ({ selectedStatus, labTestId }) => {
     console.log(selectedStatus,labTestId, 'event value')
     console.log(
      "Status updated to:",
      selectedStatus,
      "appointment id",
      labTestId
    );
    try {
      const response = await fetch(`${api.bookLabTest}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ labTestId, selectedStatus }),
      });

      if (response.ok) {
        // handleOpenSnackBar();
        const data = await response.json();
        console.log("Status updated:", data);
        // Handle success, maybe show a notification or refresh the data
      } else {
        const errorData = await response.json();
        console.error("Error updating status:", errorData.message);
      }
    } catch (error) {
      console.error("An error occurred while updating status:", error);
    }
  };

  return (
    <div className={styles.bookingContainer}>
      {/* Circle Buttons */}
      <div className={styles.circleContainer}>
        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType(labTest_status.total)}
        >
          <span>Total</span>
          <span className={`text-secondary ${styles.circleText}`}>
            {totalBookings.length}
          </span>
        </div>

        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType(labTest_status.pending)}
        >
          <span>Pending</span>
          <span className={`text-secondary ${styles.circleText}`}>
            {pendingBookings.length}
          </span>
        </div>

        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType(labTest_status.unpaid)}
        >
          <span>Unpaid</span>
          <span className={`text-danger ${styles.circleText}`}>
            {unpaidBookings.length}
          </span>
        </div>
      </div>
      <div className="mt-5 h1 font-weight-bold">LabTest booked</div>
      {/* List of Bookings in Table Format */}
      <LabBookedListTable
        heading={selectedBookingType}
        appointments={displayBookings}
        onUpdateStatus={handleUpdateStatus}
      />

      <div className="mt-5 h1 font-weight-bold">LabTest booked</div>
      <LabListTable
        //  doctors={doctors}
        appointments={listOflab}
        //  onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default LabTestBookedComp;
