// NotificationSection.jsx
import React, { useState } from "react";
import { Box, Grid, Typography, Tabs, Tab, Badge, Paper } from "@mui/material";
import DoctorUpdateReqCard from "./DoctorUpdateReqCard";
import LeaveReqCard from "./LeaveReqCard";
import NotifcationPreviewModel from "../model/NotificationPreviewModel";
import PreviewRequest from "./PreviewRequest";

const ConsultationCard = ({ request }) => (
  <Box p={2} border={1} borderRadius={2}>
    <Typography variant="subtitle1">Consultation Request</Typography>
    <Typography>{request.title || "No title"}</Typography>
  </Box>
);

const LabTestCard = ({ request }) => (
  <Box p={2} border={1} borderRadius={2}>
    <Typography variant="subtitle1">Lab Test Request</Typography>
    <Typography>{request.title || "No title"}</Typography>
  </Box>
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showModel = () => setShow(true);
  const closeModel = () => setShow(false);

  const handleReview = (request) => {
    setPreviewRequest(request);
    showModel();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return consultationRequests.map((request, index) => (
          <Box key={index} mb={2}>
            <ConsultationCard request={request} />
          </Box>
        ));
      case 1:
        return labTestRequests.map((request, index) => (
          <Box key={index} mb={2}>
            <LabTestCard request={request} />
          </Box>
        ));
      case 2:
        return doctorUpdateRequests.map((request, index) => (
          <Box key={index} mb={2}>
            <DoctorUpdateReqCard
              index={index}
              request={request}
              handleReview={() => handleReview(request)}
              handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
            />
            <NotifcationPreviewModel isOpen={show}>
              <PreviewRequest
                request={previewRequest}
                handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
                onClose={closeModel}
              />
            </NotifcationPreviewModel>
          </Box>
        ));
      case 3:
        return leaveRequest.map((request, index) => (
          <Box key={index} mb={2}>
            <LeaveReqCard
              request={request}
              handleReview={() => handleReview(request)}
              handleLeaveApproveOrReject={handleLeaveApproveOrReject}
            />
          </Box>
        ));
      default:
        return null;
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Notification Tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Badge
                  color="success"
                  badgeContent={tab.count}
                  sx={{ mr: 1 }}
                >
                  {tab.label}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Scrollable content container */}
      <Box
        sx={{
          maxHeight: "450px", // adjust as needed
          overflowY: "auto",
          pr: 1,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderContent()}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default NotificationSection;
