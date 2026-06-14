import React, { useState } from "react";
import styles from "./NotificationSection.module.css";
import DoctorUpdateReqCard from "./DoctorUpdateReqCard";
import LeaveReqCard from "./LeaveReqCard";
import NotifcationPreviewModel from "../model/NotificationPreviewModel";
import PreviewRequest from "./PreviewRequest";

const ConsultationCard = ({ request }) => (
  <div className={styles.simpleCard}>
    <div className={styles.simpleCardTitle}>{request.title || "Consultation"}</div>
    <div className={styles.simpleCardBody}>{request.body || "No details"}</div>
  </div>
);

const LabTestCard = ({ request }) => (
  <div className={styles.simpleCard}>
    <div className={styles.simpleCardTitle}>Lab Test Request</div>
    <div className={styles.simpleCardBody}>{request.title || "No details"}</div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className={styles.emptyState}>
    <span className={styles.emptyStateIcon}>📬</span>
    {message || "No notifications"}
  </div>
);

const NotificationSection = ({
  consultationRequests = [],
  labTestRequests = [],
  doctorUpdateRequests = [],
  leaveRequest = [],
  handleDoctReqApproveOrReject,
  handleLeaveApproveOrReject,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [show, setShow] = useState(false);
  const [previewRequest, setPreviewRequest] = useState(null);

  const tabs = [
    { label: "Consultation", count: consultationRequests.length },
    { label: "Lab Test", count: labTestRequests.length },
    { label: "Doctor Update", count: doctorUpdateRequests.length },
    { label: "Leave", count: leaveRequest.length },
  ];

  const totalCount = tabs.reduce((sum, t) => sum + t.count, 0);

  const showModel = () => setShow(true);
  const closeModel = () => setShow(false);

  const handleReview = (request) => {
    setPreviewRequest(request);
    showModel();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        if (consultationRequests.length === 0) return <EmptyState message="No consultation notifications" />;
        return consultationRequests.map((request, index) => (
          <ConsultationCard key={index} request={request} />
        ));
      case 1:
        if (labTestRequests.length === 0) return <EmptyState message="No lab test notifications" />;
        return labTestRequests.map((request, index) => (
          <LabTestCard key={index} request={request} />
        ));
      case 2:
        if (doctorUpdateRequests.length === 0) return <EmptyState message="No doctor update requests" />;
        return doctorUpdateRequests.map((request, index) => (
          <div key={index}>
            <DoctorUpdateReqCard
              index={index}
              request={request}
              handleReview={() => handleReview(request)}
              handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
            />
            <NotifcationPreviewModel isOpen={show && previewRequest?._id === request._id}>
              <PreviewRequest
                request={previewRequest}
                handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
                onClose={closeModel}
              />
            </NotifcationPreviewModel>
          </div>
        ));
      case 3:
        if (leaveRequest.length === 0) return <EmptyState message="No leave requests" />;
        return leaveRequest.map((request, index) => (
          <LeaveReqCard
            key={index}
            request={request}
            handleReview={() => handleReview(request)}
            handleLeaveApproveOrReject={handleLeaveApproveOrReject}
          />
        ));
      default:
        return null;
    }
  };

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.header}>
        <h5 className={styles.headerTitle}>Notifications</h5>
        <span className={styles.headerCount}>{totalCount} total</span>
      </div>

      <div className={styles.tabsContainer}>
        <div style={{ display: "flex" }}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`${styles.tabButton} ${activeTab === index ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
              {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.scrollContainer}>
        {renderContent()}
      </div>
    </div>
  );
};

export default NotificationSection;