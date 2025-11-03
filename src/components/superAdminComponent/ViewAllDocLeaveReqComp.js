import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { ListGroup } from "react-bootstrap";
import LeaveReqCard from "./notifications/LeaveReqCard";
import { handleLeaveApproveOrRejectService } from "./apiService/doctorLeaveApproveOrRejectService";

const ViewAllDocLeaveReqComp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { type } = router.query;
  const doctorLeaveReq = useSelector(
    (state) => state.notificationData.doctorLeaveRequest
  );
  const [filteredReq, setFilteredRq] = useState(doctorLeaveReq);
  

  const handleLeaveApproveOrReject = async (id, action) => {
      console.log("Approved request ID:", id, action);
      try {
         await handleLeaveApproveOrRejectService(id,action)
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
                <LeaveReqCard
                  key={index}
                  request={req}
                  handleLeaveApproveOrReject={handleLeaveApproveOrReject}
                />
              </ListGroup.Item>
            </React.Fragment>
          ))
        : "No Request found"}
    </div>
  );
};

export default ViewAllDocLeaveReqComp;
