import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DoctorModalComp from "../../DoctorModalComp";
import { api, consultation } from "../../../../constant";
import Preloader from "../../../Preloader";
import SuperAdminModel from "../../model/SuperAdminModel";
import AppointTable from "../../common/AppointmentTable";
import LabBookedListTable from "../../common/LabBookedListTable";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const ItemCards = ({
  source,
  index,
  doctor,
  appointments,
  refreshDoctorList,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [doctorInCard, setDoctorInCard] = useState(doctor);
   
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

  // const handleSaveDoctor = async (updatedDoctor) => {
  //   // setLoader(true);
  //   console.log("Updated Doctor:", updatedDoctor);
  //   const id = updatedDoctor._id;
  //   const formData = new FormData();

  //   formData.append("name", updatedDoctor.name);
  //   formData.append("expertise", updatedDoctor.expertise);
  //   formData.append("language", updatedDoctor.language);
  //   formData.append("workDays", updatedDoctor.workDays);
  //   formData.append("overview", updatedDoctor.overview);
  //   formData.append("educationTraining", updatedDoctor.educationTraining);
  //   formData.append("workExperience", updatedDoctor.workExperience);
  //   formData.append("consultationType", updatedDoctor.consultationType);
  //   formData.append("location", updatedDoctor.location);
  //   formData.append("profilePicture", updatedDoctor.profilePictureUrl);
  //   formData.append("doctorType", updatedDoctor.doctorType);
  //   formData.append("price", updatedDoctor.price);
  //   formData.append("slotStartTime", updatedDoctor.slotStartTime);
  //   formData.append("slotEndTime", updatedDoctor.slotEndTime);
  //   updatedDoctor.diplomasCertificatesUrls.forEach((certificate, index) => {
  //     formData.append(`diplomasCertificatesUrls[${index}]`, certificate);
  //   });

  //   const requestOptions = {
  //     method: "PUT",
  //     body: formData,
  //   };
  //   try {
  //     const response = await fetch(`${api.addDoctor}?id=${id}`, requestOptions);
  //     {
  //       response.ok ? setLoader(false) : null;
  //     }
  //     if (response.ok) {
  //       setLoader(false);
  //       console.log(response, "response");
  //       return window.alert("Doctor has been updated");
  //     }
  //   } catch (error) {
  //     console.error("Error updating doctor:", error);
  //     throw error;
  //   }
  // };

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
        <Col>{"userRemarks"}</Col>
        <Col className="font-weight-bold text-primary" onClick={() => setShowModal(true)}>
          <u>{appointments.length}</u>
          <FaEye className="ml-1" />
        </Col>
        <Col>{"adminRemarks"}</Col>
        <Col>
          {/* <FaEdit onClick={handleEdit} style={{ cursor: "pointer" }} />
          {source == consultation ? (
            ""
          ) : (
            <MdDelete
              onClick={handleDelete}
              style={{ cursor: "pointer" }}
              className="ml-2"
            />
          )} */}
        </Col>
      </Row>
      {/* <DoctorModalComp
        show={showModal}
        handleClose={handleCloseModal}
        doctor={doctor}
        onSave={handleSaveDoctor}
      /> */}

      {loader && <Preloader />}
      <SuperAdminModel isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="mt-2">
      <LabBookedListTable
        heading={"TOTAL"}
        appointments={appointments}
        // onUpdateStatus={handleUpdateStatus}
      />
      </div>
      </SuperAdminModel>
    </>
  );
};

export default ItemCards;
