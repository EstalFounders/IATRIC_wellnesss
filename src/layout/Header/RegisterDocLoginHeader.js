import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Image from "next/image";
import Navbar from "../../components/registerDocComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/registerDocComponent/NavBarComponent/RightSideMenu";
import { doctor_info_local_storage, api, single_call, imageBlurDataUrl } from "../../constant";
import { signOut } from "next-auth/react";
import Preloader from "../../components/Preloader";
import LeaveRequestModel from "../../components/registerDocComponent/model/LeaveRequestModel";
import ManageSlotsModal from "../../components/registerDocComponent/model/ManageSlotsModal";

const RegisterDocLoginHeader = () => {
  const [manageSlotsModelShow, setManageSlotsModelShow] = useState(false);
  const [leaveRequestModelShow, setLeaveRequestModelShow] = useState(false);
  const [loader, setLoader] = useState(false);
  const DoctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage)
  );

  const [doctorStatus, setDoctorStatus] = useState(
    sessionStorage.getItem(single_call)
  ); // Initialize as false

  // The profile form and its save flow moved to the dedicated profile page
  // (pages/registerDoc/profile.js -> DoctorProfilePage -> doctorProfileSubmit).

  const handleShowLeaveReqestModel = () => {
    setLeaveRequestModelShow(true);
  };
  const handleCloseLeaveReqestModel = () => {
    setLeaveRequestModelShow(false);
  };

  const handleShowManageSlotsModel = () => {
    setManageSlotsModelShow(true);
  };
  const handleCloseManageSlotsModel = () => {
    setManageSlotsModelShow(false);
  };

  // Function to update the doctor's active status on the backend
  const updateDoctorStatus = async (status) => {
    try {
      const response = await fetch(`${api.updateDoctorStatus}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: DoctorInfo?.user?._id,
          isActive: status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const result = await response.json();
      console.log("Status updated:", result);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  // Handle toggle click
  const handleToggle = async () => {
    const newStatus = !doctorStatus;
    setDoctorStatus(newStatus); // Optimistically update the UI
    await updateDoctorStatus(newStatus); // Update the backend
  };

  // Handle logout
  const handleLogout = async () => {
    setDoctorStatus(false); // Set to false in UI
    await updateDoctorStatus(false); // Update the backend
    try {
      // `redirect: false` keeps the browser away from the absolute callbackUrl
      // next-auth builds server-side (a stale NEXTAUTH_URL used to make that
      // http://localhost:3000/...).
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
    // Perform logout actions (e.g., clearing session, redirecting)
    sessionStorage.removeItem(doctor_info_local_storage);
    sessionStorage.removeItem(single_call);
    // Relative target: resolved by the browser against the real domain.
    window.location.replace("/registerDoc/login");
  };

  const handleLeaveRequestSubmit = async (formData) => {
    //need to create client api call for leave request
    console.log(
      JSON.stringify(formData),
      "formdata on 138 in register Doc login header"
    );
    setLoader(true);
    try {
      const response = await fetch(
        `${api.leaveRequest}/?id=${DoctorInfo?.user?._id ?? DoctorInfo?._id}&name=${DoctorInfo?.user?.name ?? DoctorInfo?.name}`, // Use '&' to separate query parameters
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData }),
        }
      );

      const data = await response.json();
      setLoader(false);
      window.alert(data.message);
    } catch (error) {
      console.error("Error submitting update request:", error);
    }
  };

  // Set doctorStatus to true when the component loads (login)
  useEffect(() => {
    console.log(doctorStatus, "doctor status",DoctorInfo, "doctor info");
    // if (DoctorInfo?.user?.isActive === false && doctorStatus === null) {
      setDoctorStatus(true); // Set to true locally
      updateDoctorStatus(true); // Update backend
      sessionStorage.setItem(single_call, true);
    // }
  }, [doctorStatus]);

  return (
    <Row className="bg-white border-bottom align-items-center">
      <Col xs={12} md={5} className="mt-4">
        {DoctorInfo && <Navbar />}
      </Col>
      <Col xs={12} md={5} className="py-3">
        <Image
          placeholder="blur"
          blurDataURL={imageBlurDataUrl}
          src="/images/logo.png"
          width={180}
          height={70}
          alt="mobile-logo"
          className="pt-2"
        />
      </Col>
      <Col className="mt-3">
        {/* Toggle Switch with Status Text */}
        <div className="d-flex flex-column align-items-center">
          <div
            className="toggle-switch"
            onClick={handleToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              width: "40px",
              height: "20px",
              borderRadius: "15px",
              backgroundColor: doctorStatus ? "green" : "gray",
              position: "relative",
            }}
          >
            <div
              className="toggle-knob"
              style={{
                position: "absolute",
                top: "2px",
                left: doctorStatus ? "20px" : "2px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "white",
                transition: "left 0.2s ease",
              }}
            ></div>
          </div>
          <small className="mt-1" style={{ color: "black" }}>
            {doctorStatus ? "Online" : "Offline"}
          </small>
        </div>
      </Col>
      <Col className="mb-3">
        {DoctorInfo && (
          <div>
            <RightSideMenu
              user={DoctorInfo}
              onLogout={handleLogout}
              handleShowLeaveReqestModel={handleShowLeaveReqestModel}
              handleShowManageSlotsModel={handleShowManageSlotsModel}
            />
          </div>
        )}
      </Col>
      <div>
        <LeaveRequestModel
          show={leaveRequestModelShow}
          onClose={handleCloseLeaveReqestModel}
          onConfirm={handleLeaveRequestSubmit}
        />
      </div>
      <div>
        <ManageSlotsModal
          show={manageSlotsModelShow}
          onClose={handleCloseManageSlotsModel}
          doctorId={DoctorInfo?.user?._id ?? DoctorInfo?._id}
        />
      </div>
      {loader ? (
        <div>
          <Preloader />
        </div>
      ) : null}
    </Row>
  );
};

export default RegisterDocLoginHeader;
