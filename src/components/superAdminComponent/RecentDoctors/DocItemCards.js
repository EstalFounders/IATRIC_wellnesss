import React, { useState } from "react";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import DoctorModal from "../DoctorModalComp";
import DoctorModalComp from "../DoctorModalComp";
import { api, roles } from "../../../constant";
import Preloader from "../../Preloader";
import { MdDelete } from "react-icons/md";
import ConfirmModal from "../model/ConfirmModel";
import { useSelector } from "react-redux";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const ItemCards = ({ index, doctor, refreshDoctorList }) => {
  const [showModal, setShowModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [doctorInCard, setDoctorInCard] = useState(doctor);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const userDetails = useSelector((state) => state.userDetails.userDetails);

  const handleEdit = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = async () => {
    setLoader(true);
    const id = doctor._id;
    const requestOptions = {
      method: "DELETE",
    };
    try {
      const response = await fetch(`${api.addDoctor}?id=${id}`, requestOptions);
      if (response.ok) {
        window.alert("Doctor has been deleted");
        refreshDoctorList(); // Call refreshDoctorList to update the list after deletion
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleSaveDoctor = async (updatedDoctor) => {
    // setLoader(true);
    console.log("Updated Doctor:", updatedDoctor);
    const id = updatedDoctor._id;
    const formData = new FormData();

    formData.append("name", updatedDoctor.name);
    formData.append("expertise", updatedDoctor.expertise);
    formData.append("degree", updatedDoctor.degree);
    formData.append("mobileNumber", updatedDoctor.mobileNumber);
    formData.append("language", updatedDoctor.language);
    formData.append("workDays", updatedDoctor.workDays);
    formData.append("overview", updatedDoctor.overview);
    formData.append("educationTraining", updatedDoctor.educationTraining);
    formData.append("workExperience", updatedDoctor.workExperience);
    formData.append("consultationType", updatedDoctor.consultationType);
    formData.append("location", updatedDoctor.location);
    formData.append("profilePicture", updatedDoctor.profilePictureUrl);
    formData.append("doctorType", updatedDoctor.doctorType);
    formData.append("price", updatedDoctor.price);
    formData.append("slotStartTime", updatedDoctor.slotStartTime);
    formData.append("slotEndTime", updatedDoctor.slotEndTime);
    updatedDoctor.diplomasCertificatesUrls.forEach((certificate, index) => {
      formData.append(`diplomasCertificatesUrls[${index}]`, certificate);
    });

    const requestOptions = {
      method: "PUT",
      body: formData,
    };
    try {
      const response = await fetch(`${api.addDoctor}?id=${id}`, requestOptions);
      {
        response.ok ? setLoader(false) : null;
      }
      if (response.ok) {
        setLoader(false);
        console.log(response, "response");
        return window.alert("Doctor has been updated");
      }
    } catch (error) {
      console.error("Error updating doctor:", error);
      throw error;
    }
  };

  return (
    <>
      <Row
        style={{
          borderBottom: "1px solid #ccc",
          borderBottomWidth: 3,
          display: "flex",
          flexDirection: "row",
        }}
        className="mt-4"
      >
        <Col>{doctor.name}</Col>
        <Col>{doctor.expertise}</Col>
        <Col>{doctor.degree}</Col>
        <Col>{doctor.workDays}</Col>
        <Col>{formatDate(doctor.joiningDate)}</Col>
        <Col>
          <FaEdit onClick={handleEdit} style={{ cursor: "pointer" }} />

          {Array.isArray(userDetails?.role) &&
          userDetails.role.includes(roles.superAdmin) ? (
            <MdDelete
              onClick={() => setShowConfirmModal(true)}
              style={{ cursor: "pointer" }}
              className="ml-2"
            />
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>You are not allowed to perform this action</Tooltip>
              }
            >
              <span className="d-inline-block">
                <MdDelete
                  style={{ cursor: "not-allowed", opacity: 0.5 }}
                  tabIndex={0}
                />
              </span>
            </OverlayTrigger>
          )}
        </Col>
      </Row>
      <DoctorModalComp
        show={showModal}
        handleClose={handleCloseModal}
        doctor={doctor}
        onSave={handleSaveDoctor}
      />
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
      />
      {loader && <Preloader />}
    </>
  );
};

export default ItemCards;
