import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/superAdminComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/superAdminComponent/NavBarComponent/RightSideMenu";
import { IoIosNotifications } from "react-icons/io";
import styles from "../css/SuperAdmin.module.css";
import SuperAdminModel from "../../components/superAdminComponent/model/SuperAdminModel";
import {
  api,
  sessionStorageName,
  super_admin_info_local_sotrage,
} from "../../constant";
import NotificationSection from "../../components/superAdminComponent/notifications/NotificationSection";
import { useDispatch } from "react-redux";
import {
  setDoctorLeaveRequest,
  setDoctorUpdateRequest,
  setUpdateRequest,
} from "../../store/slices/notificationSectionApiData";
import { handleDoctReqApproveOrRejectService } from "../../components/superAdminComponent/apiService/doctrReApproveOrRejectService";
import { handleLeaveApproveOrRejectService } from "../../components/superAdminComponent/apiService/doctorLeaveApproveOrRejectService";

const SuperAdminLoginHeader = ({ session }) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [globalVar, setGlobalVar] = useState([]);
  const [doctorUpdateRequests, setDoctorUpdateRequests] = useState([]);
  const [newRequestCount, setNewRequestCount] = useState(0);
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [newLeaveRequestCount, setNewLeaveRequestCount] = useState([]);
  const dispatch = useDispatch();

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

  const handleLeaveApproveOrReject = async (id, action) => {
    console.log("Approved request ID:", id, action);
    try {
       await handleLeaveApproveOrRejectService(id,action)
    } catch (error) {
      console.error("Error while processing the request:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const fetchAPIs = useCallback(async () => {
    try {
      const [globalResponse, doctorUpdateResponse, leaveRequestResponse] =
        await Promise.all([
          fetch(api.globalVar),
          fetch(api.doctorUpdateRequest),
          fetch(api.leaveRequest),
        ]);

      const [globalData, doctorData, leaveData] = await Promise.all([
        globalResponse.json(),
        doctorUpdateResponse.json(),
        leaveRequestResponse.json(),
      ]);
      setGlobalVar(globalData); // Assuming globalVar has two elements now
      setDoctorUpdateRequests(doctorData);
      setLeaveRequest(leaveData); // Add a new state to store leave requests
      dispatch(setDoctorUpdateRequest(doctorData)); //getting error setLeave request so will put in seperate useEffect
      dispatch(setDoctorLeaveRequest(leaveData));
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  }, []);

  useEffect(() => {
    fetchAPIs();
  }, [fetchAPIs]);

  useEffect(() => {
    calculateCounts(); // Centralize calculation into a single function
  }, [globalVar, doctorUpdateRequests, leaveRequest]);

  const calculateCounts = () => {
    if (!globalVar || globalVar.length === 0) return;

    // Extract values for `doctorUpdate` and `leaveRequest` counts
    const doctorUpdateCount =
      globalVar.find((item) => item.name === "doctorUpdateRequestCount")
        ?.value || 0;
    const leaveRequestCount =
      globalVar.find((item) => item.name === "doctorLeaveRequestCount")
        ?.value || 0;

    // Calculate `newRequestCount`
    const newDoctorUpdateCount = Math.max(
      doctorUpdateCount,
      doctorUpdateRequests.length
    );
    setNewRequestCount(
      newDoctorUpdateCount -
        Math.min(doctorUpdateCount, doctorUpdateRequests.length)
    );

    // Calculate `newLeaveRequestCount`
    const newLeaveRequestCount = Math.max(
      leaveRequestCount,
      leaveRequest.length
    );
    setNewLeaveRequestCount(
      newLeaveRequestCount - Math.min(leaveRequestCount, leaveRequest.length)
    );

    console.log({
      newDoctorUpdateCount,
      newLeaveRequestCount,
    });
  };

  //need to create admin panel to approve and reject doctor update request

  return (
    <>
      <Row className="bg-white border-bottom">
        <Col className="mt-4" md={5}>
          {session && <Navbar />}
        </Col>
        <Col className="pl-4" md={5}>
          <Image
            src="/images/logo.png" // Make sure the path is correct starting from the 'public' directory
            width={180}
            height={70}
            alt="mobile-logo"
            className="pt-2"
          />
        </Col>
        <Col className="mt-4 d-flex flex-row">
          {session && (
            <>
              <div className={styles.cartIconContainer} onClick={showModel}>
                <IoIosNotifications size={30} />
                <div className={styles.cartItemCount}>
                  {newRequestCount + newLeaveRequestCount}
                </div>
              </div>
              <div className="ml-2">
                <RightSideMenu />
              </div>
            </>
          )}
        </Col>
      </Row>
      <SuperAdminModel isOpen={show} onClose={closeModel} className="w-100">
        <NotificationSection
          doctorUpdateRequests={doctorUpdateRequests}
          leaveRequest={leaveRequest}
          handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
          handleLeaveApproveOrReject={handleLeaveApproveOrReject}
        />
      </SuperAdminModel>
    </>
  );
};

export default SuperAdminLoginHeader;
