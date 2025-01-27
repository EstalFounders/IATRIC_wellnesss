// components/ItemList.js
import React, { useState } from "react";
import ItemCard from "./DoctorEarningItemCards";
import { Button, Col, Row } from "react-bootstrap";
import { CustomPagination } from "../../../../helper";

const DoctorEarningList = ({ source, doctors, appointments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Calculate the indices for slicing the data array
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = doctors.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Row>
      <Col>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          className="mt-4"
        >
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Name</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Consultation Type</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Joining Date</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Total Earning</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Mobile Number</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Bookings</b>
          </Col>
        </Row>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            maxHeight: "400px",
          }}
        >
          {currentItems.map((item) => {
            // Filter the appointments for the current item (e.g., doctor or specific category)
            const filteredAppointments = appointments.filter(
              (appointment) => appointment.doctorId === item._id // Assuming `item._id` is the doctorId or relevant identifier
            );

            // Calculate the total price for the current item's appointments
            const totalPrice = filteredAppointments.reduce(
              (sum, appointment) => sum + (appointment.consultationprice || 0),
              0
            );

            console.log(totalPrice, 'total prince in doctor earning list')

            return (
              <ItemCard
                key={item._id}
                data={item} // Pass the item data
                appointments={filteredAppointments} // Pass the filtered appointments
                totalPrice={totalPrice} // Pass the total price

              />
            );
          })}
        </div>
        <CustomPagination
          currentPage={currentPage}
          totalItems={doctors.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Col>
    </Row>
  );
};

export default DoctorEarningList;
