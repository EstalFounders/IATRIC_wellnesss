import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Image from "next/image";
import Navbar from "../../components/registerDocComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/registerDocComponent/NavBarComponent/RightSideMenu";
import { doctor_info_local_storage, api, single_call, userTypeConstant, color_schema } from "../../constant";
import DoctorModalComp from "../../components/superAdminComponent/DoctorModalComp";
import { signOut } from "next-auth/react";
import Preloader from "../../components/Preloader";
import LeaveRequestModel from "../../components/registerDocComponent/model/LeaveRequestModel";
import ManageSlotsModal from "../../components/registerDocComponent/model/ManageSlotsModal";

/**
 * Upload a photo picked in the Doctor Panel and return its Firebase URL.
 * The URL is what goes into the approval request - passing the File itself would
 * serialise to "{}" in the JSON body and the new photo would be lost.
 * See pages/api/doctor/upload-avatar.js.
 */
const uploadDoctorAvatarWeb = async (file, doctorId) => {
  const formData = new FormData();
  formData.append("profilePicture", file, file.name || "doctor-photo.jpg");
  if (doctorId) formData.append("doctorId", doctorId);

  const response = await fetch(api.uploadDoctorAvatar, {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "photo upload failed");
  }

  return data.url;
};

const RegisterDocLoginHeader = () => {
  const [show, setShow] = useState(false);
  const [manageSlotsModelShow, setManageSlotsModelShow] = useState(false);
  const [leaveRequestModelShow, setLeaveRequestModelShow] = useState(false);
  const [loader, setLoader] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const DoctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage)
  );

  const [doctorStatus, setDoctorStatus] = useState(
    sessionStorage.getItem(single_call)
  ); // Initialize as false

  const handleSaveDoctor = async (updatedDoctor) => {
    console.log("Updated Doctor:", updatedDoctor);
    setLoader(true);

    let changedFields = {};
    let hasChanges = false; // Flag to track changes
    let pendingPhoto = null; // File picked in the modal - uploaded before saving

    Object.keys(updatedDoctor).forEach((key) => {
      // A new photo arrives as a File, which cannot travel in this JSON request
      // (it would serialise to "{}"). Upload it first and send its URL instead.
      if (
        key === "profilePictureUrl" &&
        typeof File !== "undefined" &&
        updatedDoctor[key] instanceof File
      ) {
        pendingPhoto = updatedDoctor[key];
        hasChanges = true;
        return;
      }

      if (Array.isArray(updatedDoctor[key])) {
        const updatedArray = updatedDoctor[key];
        const originalArray = DoctorInfo.user[key] || [];

        // Compare arrays (length and content)
        const arraysAreEqual =
          Array.isArray(originalArray) &&
          updatedArray.length === originalArray.length &&
          updatedArray.every((value, index) => value === originalArray[index]);

        if (!arraysAreEqual) {
          hasChanges = true; // Mark changes found
          changedFields[key] = updatedArray;
        }
      } else {
        if (updatedDoctor[key] !== DoctorInfo.user[key]) {
          hasChanges = true; // Mark changes found
          changedFields[key] = updatedDoctor[key];
        }
      }
    });

    // If no changes were detected, exit early
    if (!hasChanges) {
      window.alert("You have changed nothing");
      setLoader(false);
      return; // Stops further execution
    }

    // New photo: upload it first so the approval request carries a real URL.
    if (pendingPhoto) {
      try {
        setUploadStatus("Uploading your profile photo...");
        changedFields.profilePictureUrl = await uploadDoctorAvatarWeb(
          pendingPhoto,
          updatedDoctor._id
        );
      } catch (error) {
        // The photo failed but the rest of the profile changes still go through.
        window.alert(
          `Your new photo could not be uploaded (${error.message}). The rest of your profile changes will still be submitted.`
        );
      } finally {
        setUploadStatus("");
      }
    }

    // Only the photo changed and it failed - there is nothing left to submit.
    if (!Object.keys(changedFields).length) {
      setLoader(false);
      return;
    }

    try {
      const response = await fetch(
        `${api.doctorUpdateRequest}/?id=${updatedDoctor._id}&name=${DoctorInfo.user.name}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ changedFields }),
        }
      );

      const data = await response.json();
      setLoader(false);
      window.alert(data.message);
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting update request:", error);
      setLoader(false);
    }
  };

  const handleCloseModal = () => {
    setShow(false);
  };

  const handleShowModel = () => {
    setShow(true);
  };

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
        `${api.leaveRequest}/?id=${DoctorInfo.user._id}&name=${DoctorInfo.user.name}`, // Use '&' to separate query parameters
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
      handleCloseModal();
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
              handleShowModel={handleShowModel}
              handleShowLeaveReqestModel={handleShowLeaveReqestModel}
              handleShowManageSlotsModel={handleShowManageSlotsModel}
            />
          </div>
        )}
      </Col>
      <div>
        <DoctorModalComp
          show={show}
          handleClose={handleCloseModal}
          doctor={DoctorInfo.user}
          onSave={handleSaveDoctor}
          origin={userTypeConstant.doctor}
        />
      </div>
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
          doctorId={DoctorInfo?.user?._id}
        />
      </div>
      <div>
        {loader ? (
          <div>
            <Preloader />
            {uploadStatus && (
              <div
                role="status"
                style={{
                  position: "fixed",
                  bottom: "28px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1080,
                  maxWidth: "90vw",
                  textAlign: "center",
                  background: color_schema.green,
                  color: "#ffffff",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.25)",
                  fontSize: "14px",
                }}
              >
                {uploadStatus}
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </Row>
  );
};

export default RegisterDocLoginHeader;
