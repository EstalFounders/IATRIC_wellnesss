import React, { useState } from "react";
import styles from "../css/ConsultationBooked.module.css";
import AppointTable from "../common/AppointmentTable";
import { appointment_status, consultation } from "../../../constant";
import DoctorsTable from "../common/DoctorsTable";
import { useSelector } from "react-redux";

const ConsultationBookedComp = () => {
  const [selectedBookingType, setSelectedBookingType] = useState(
    appointment_status.total
  );

  // Complete array of all bookings
  const bookings = useSelector(
    (state) => state.superAdminHomePage.allAppointments
  );

  const doctors = useSelector((state) => state.superAdminHomePage.allDoctors);

  // Filtered bookings based on status
  const totalBookings = bookings;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === appointment_status.pending
  );
  const rescheduledBookings = bookings.filter(
    (booking) => booking.status === appointment_status.rescheduled
  );

  // Choose which booking list to display based on selectedBookingType
  const displayBookings =
    selectedBookingType === appointment_status.total
      ? totalBookings
      : selectedBookingType === appointment_status.pending
      ? pendingBookings
      : rescheduledBookings;

  const handleUpdateStatus = async ({ selectedStatus, appointmentId }) => {
    console.log(
      "Status updated to:",
      selectedStatus,
      "appointment id",
      appointmentId
    );
    try {
      const response = await fetch(`${api.bookConsultation}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, selectedStatus }),
      });

      if (response.ok) {
        handleOpenSnackBar();
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
          onClick={() => setSelectedBookingType(appointment_status.total)}
        >
          <span>Total</span>
          <span className={`text-secondary ${styles.circleText}`}>
            {totalBookings.length}
          </span>
        </div>

        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType(appointment_status.pending)}
        >
          <span>Pending</span>
          <span className={`text-secondary ${styles.circleText}`}>
            {pendingBookings.length}
          </span>
        </div>

        <div
          className={styles.circle}
          onClick={() => setSelectedBookingType(appointment_status.rescheduled)}
        >
          <span>Rescheduled</span>
          <span className={`text-danger ${styles.circleText}`}>
            {rescheduledBookings.length}
          </span>
        </div>
      </div>
      <div className="mt-5 h1 font-weight-bold">Consultation</div>
      {/* List of Bookings in Table Format */}
      <AppointTable
        heading={selectedBookingType}
        appointments={displayBookings}
        onUpdateStatus={handleUpdateStatus}
      />
      <div className="mt-5 h1 font-weight-bold">Doctors Booking List</div>
      <DoctorsTable
        source={consultation}
        doctors={doctors}
        appointments={bookings}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default ConsultationBookedComp;
