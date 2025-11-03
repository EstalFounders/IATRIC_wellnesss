import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import DoctorUpdateReqCard from "./notifications/DoctorUpdateReqCard";
import { ListGroup } from "react-bootstrap";
import { handleDoctReqApproveOrRejectService } from "./apiService/doctrReApproveOrRejectService";
import PreviewRequest from "./notifications/PreviewRequest";
import NotifcationPreviewModel from "./model/NotificationPreviewModel";

const ViewAllDocUpdateReqComp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { type } = router.query;
  const doctorUpdateReq = useSelector(
    (state) => state.notificationData.doctorUpdateRequest
  );
  const [filteredReq, setFilteredRq] = useState(doctorUpdateReq);
  const [show, setShow] = useState(false);

  const showModel = () => {
    setShow(true);
  };

  const closeModel = () => {
    setShow(false);
  };

  const handleDoctReqApproveOrReject = async (id, action) => {
    console.log("Approved request ID:", id, action);
    try {
      await handleDoctReqApproveOrRejectService(id, action);
    } catch (error) {
      console.error("Error while processing the request:", error);
      alert("Something went wrong. Please try again later.");
    }
  };


  // Handle search input
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = doctorUpdateReq.filter((req) => {
      return (
        req.name.toLowerCase().includes(query) ||
        req.status.toLowerCase().includes(query)
      );
    });

    setFilteredRq(filtered);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>
      {filteredReq && filteredReq.length > 0
        ? filteredReq.map((req, index) => (
            <React.Fragment key={req.id || index}>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <DoctorUpdateReqCard
                  key={index}
                  request={req}
                  handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
                  handleReview={showModel}
                />
                <NotifcationPreviewModel
                  isOpen={show}
                  key={`${req.id || index}-model`}
                >
                  <PreviewRequest
                    request={req}
                    handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
                    onClose={closeModel}
                  />
                </NotifcationPreviewModel>
              </ListGroup.Item>
            </React.Fragment>
          ))
        : "No Request found"}
    </div>
  );
};

export default ViewAllDocUpdateReqComp;
