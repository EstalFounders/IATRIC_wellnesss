import React, { useState } from "react";
import styles from "../css/ConsultationBooked.module.css";
import AppointTable from "../common/AppointmentTable";
import { appointment_status, consultation } from "../../../constant";
import DoctorsTable from "../common/DoctorsTable";

const ConsultationBookedComp = () => {
  const [selectedBookingType, setSelectedBookingType] = useState(
    appointment_status.total
  );

  // Complete array of all bookings
  const bookings = [
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
    // Add more booking items as needed
  ];

  const doctors = [
    {
      _id: 123,
      name: "Ashima narula",
      expertise: "surgery",
      doctorType: "company",
      price: 500,
    },
    {
      _id: 125,
      name: "vishal tomar",
      expertise: "md",
      doctorType: "company",
      price: 500,
    },
    {
      _id: 124,
      name: "neha tomar",
      expertise: "medicine",
      doctorType: "company",
      price: 500,
    },
    {
        _id: 126,
        name: "neha tomar",
        expertise: "medicine",
        doctorType: "company",
        price: 500,
      },
      {
        _id: 127,
        name: "neha tomar",
        expertise: "medicine",
        doctorType: "company",
        price: 500,
      },
  ];

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

  const handleUpdateStatus = () => {};

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
