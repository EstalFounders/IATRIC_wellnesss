import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import DoctorModal from "../DoctorModalComp";
import DoctorModalComp from "../DoctorModalComp";
import { api } from "../../../constant";
import Preloader from "../../Preloader";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const ItemCards = ({ index, doctor }) => {
  const [showModal, setShowModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleEdit = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveDoctor = async (updatedDoctor) => {
    setLoader(true);
    console.log("Updated Doctor:", updatedDoctor);
    const id = updatedDoctor._id;
    const formData = new FormData();

    formData.append("name", updatedDoctor.name);
    formData.append("expertise", updatedDoctor.expertise);
    formData.append("degree", updatedDoctor.degree);
    formData.append("language", updatedDoctor.language);
    formData.append("workDays", updatedDoctor.workDays);
    formData.append("overview", updatedDoctor.overview);
    formData.append("educationTraining", updatedDoctor.educationTraining);
    formData.append("workExperience", updatedDoctor.workExperience);
    formData.append("consultationType", updatedDoctor.consultationType);
    formData.append("location", updatedDoctor.location);
    formData.append("profilePicture", updatedDoctor.profilePictureUrl);
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
        </Col>
      </Row>
      <DoctorModalComp
        show={showModal}
        handleClose={handleCloseModal}
        doctor={doctor}
        onSave={handleSaveDoctor}
      />
      {loader && <Preloader />}
    </>
  );
};

export default ItemCards;
