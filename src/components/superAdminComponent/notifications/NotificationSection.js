import React, { useState } from "react";
import styles from "../css/NotificationSection.module.css";
import { Button, Col, ListGroup, Row } from "react-bootstrap";
import NotifcationPreviewModel from "../model/NotificationPreviewModel";
import DoctorUpdateReqCard from "./DoctorUpdateReqCard";
import PreviewRequest from "./PreviewRequest";
import LeaveReqCard from "./LeaveReqCard";
import { name } from "@stream-io/video-react-sdk";

const NotificationSection = ({
  doctorUpdateRequests,
  leaveRequest,
  handleDoctReqApproveOrReject,
  handleLeaveApproveOrReject,
}) => {
  console.log(leaveRequest, "leave request");

  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState("Doctor Update"); // State to track active tab

  const showModel = () => {
    setShow(true);
  };

  const closeModel = () => {
    setShow(false);
  };

  const handleReview = (index) => {
    console.log("Reviewed request ID:", index);
    showModel();
    // Add API call or navigation logic for review here
  };

  return (
    <div className={`mb-2 ${styles.notificationsection}`}>
      <h2 className="mb-4">Requests</h2>
      <Row>
        <Col>
          <div className="tabs">
            <Button
              variant="link"
              className={`text-decoration-none position-relative w-25 ${
                activeTab === "Doctor Update" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Doctor Update")} // Set active tab
            >
              Doctor Update
              <span className="position-absolute badge bg-white rounded-circle px-2 py-1 mt-2 ml-1">
                {doctorUpdateRequests.length}
              </span>
            </Button>

            <Button
              variant="link"
              className={`text-decoration-none ml-2 w-25 ${
                activeTab === "Leave" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Leave")} // Set active tab
            >
              Leave
              <span className="position-absolute badge bg-white rounded-circle px-2 py-1 mt-2 ml-1">
                {leaveRequest.length}
              </span>
            </Button>
          </div>
        </Col>
      </Row>
      <ListGroup className="mt-3">
        {activeTab === "Doctor Update" &&
          doctorUpdateRequests.map((request, index) => (
            <React.Fragment key={request.id || index}>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <DoctorUpdateReqCard
                  index={index}
                  request={request}
                  handleReview={handleReview}
                  handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
                />
              </ListGroup.Item>
              <NotifcationPreviewModel
                isOpen={show}
                key={`${request.id || index}-model`}
              >
                <PreviewRequest
                  request={request}
                  handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
                  onClose={closeModel}
                />
              </NotifcationPreviewModel>
            </React.Fragment>
          ))}

        {activeTab === "Leave" &&
          leaveRequest.map((request, index) => (
            <ListGroup.Item
              key={request.id || index} // Use a unique key
              className="d-flex justify-content-between align-items-center"
            >
              <LeaveReqCard
                request={request}
                handleReview={handleReview}
                handleLeaveApproveOrReject={handleLeaveApproveOrReject}
              />
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  );
};

export default NotificationSection;
