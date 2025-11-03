import React, { useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap"; // Ensure proper imports
import { formatData } from "../../registerDocComponent/utils/helper";
import { labTest_status } from "../../../constant";
import { useRouter } from "next/router";

const ItemCards = ({ data, onStatusChanged, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(data.bookingStatus);
  const [labTestId, setLabTestId] = useState(data._id);
  const router = useRouter();

  const handleStatusChange = (e) => {
    console.log(e.target.value, "event");
    setSelectedStatus(e.target.value);
    setLabTestId(data._id);
  };

  const handleUpdateClick = () => {
    if (onUpdateStatus) {
      onUpdateStatus({ selectedStatus, labTestId });
    }
  };

  const handleViewLabTest = async () => {
    router.push({
      pathname: "/superAdmin/viewLabTest",
      query: { data: JSON.stringify(data) }, // Pass the appointment data as a string
    });
  };

  return (
    <Row
      style={{
        borderBottom: "1px solid #ccc",
        borderBottomWidth: 3,
        display: "flex",
        flexDirection: "row",
      }}
      className="mt-4"
    >
      <Col className="text-primary clickable-div" onClick={handleViewLabTest}>
        <u>{data.name}</u>
      </Col>
      <Col>{`${data.paymentMethod}-${data.paymentStatus}`}</Col>
      <Col>{formatData(data.createdAt)}</Col>
      <Col>{data.totalPrice}</Col>
      <Col>{data.mobileNumber}</Col>
      <Col>
        <div
          className={`font-weight-bold mb-2 ${
            data.paymentStatus === labTest_status.completed
              ? "text-success"
              : data.paymentStatus === labTest_status.cancelled
              ? "text-danger"
              // : data.paymentStatus === labTest_status.unpaid
              // ? "text-secondary"
              : data.paymentStatus === labTest_status.pending
              ? "text-primary"
              // : data.paymentStatus === labTest_status.paid
              // ? "text-muted"
              : ""
          }`}
        >
          {data.bookingStatus}
        </div>

        <Form.Group controlId="statusSelect">
          <Form.Control
            as="select"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="pending" className="text-center">
              {selectedStatus ? selectedStatus : "Select to Update"}
            </option>
            <option value="pending">{labTest_status.pending}</option>
            {/* <option value="confirmed">{labTest_status.paid}</option> */}
            {/* <option value="reschedule">{labTest_status.unpaid}</option> */}
            <option value="cancelled">{labTest_status.cancelled}</option>
            <option value="completed">{labTest_status.completed}</option>
          </Form.Control>
        </Form.Group>
        <Button onClick={handleUpdateClick} className="mt-1 mb-2">
          Update
        </Button>
      </Col>
    </Row>
  );
};

export default ItemCards;
