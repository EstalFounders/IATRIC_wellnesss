import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./css/ConsultationFee.module.css";
import { MdDelete } from "react-icons/md";

const ConsultationComponent = () => {
  const [consultations, setConsultations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedConsultation, setEditedConsultation] = useState(null);
  const [newConsultation, setNewConsultation] = useState({
    name: "",
    fee: "",
    isActive: true,
  });

  useEffect(() => {
    axios
      .get("/api/superAdmin/consultationFee")
      .then((response) => {
        setConsultations(response.data);
      })
      .catch((error) => console.error("Error fetching consultations:", error));
  }, []);

  const handleEdit = (id) => {
    const consultationToEdit = consultations.find((item) => item._id === id);
    if (consultationToEdit) {
      setEditing(id);
      setEditedConsultation({ ...consultationToEdit });
    }
  };
  

  const handleDiscard = () => {
    setEditing(null);
    setEditedConsultation(null);
  };

  const handleUpdate = (id) => {
    axios
      .put(`/api/superAdmin/consultationFee?id=${id}`, editedConsultation)
      .then((response) => {
        console.log(response, 'response 43')
        setConsultations((prev) =>
          prev.map((item) => (item._id === id ? response.data : item))
        );
        setEditing(null);
        setEditedConsultation(null);
      })
      .catch((error) => console.error("Error updating consultation:", error));
  };

  const handleAdd = () => {
    axios
      .post("/api/superAdmin/consultationFee", newConsultation)
      .then((response) => {
        setConsultations((prev) => [...prev, response.data]);
        setNewConsultation({ name: "", fee: "", isActive: true });
      })
      .catch((error) => console.error("Error adding consultation:", error));
  };

  const handleDelete = (id) => {
    axios
      .delete(`/api/superAdmin/consultationFee?id=${id}`)
      .then(() => {
        setConsultations((prev) => prev.filter((item) => item._id !== id));
      })
      .catch((error) => console.error("Error deleting consultation:", error));
  };


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Consultation Types</h1>
      <div className={styles.cardContainer}>
        {consultations.map((consultation) => (
          
          <div key={consultation._id} className={styles.card}>
            {editing === consultation._id && editedConsultation ? (
              <>
              <input
                className={styles.input}
                type="text"
                value={editedConsultation.name}
                onChange={(e) =>
                  setEditedConsultation({
                    ...editedConsultation,
                    name: e.target.value,
                  })
                }
              />
              <input
                className={styles.input}
                type="text"
                value={editedConsultation.fee}
                onChange={(e) =>
                  setEditedConsultation({
                    ...editedConsultation,
                    fee: e.target.value,
                  })
                }
              />
              <div
                className={styles.toggleSwitch}
                onClick={() =>
                  setEditedConsultation({
                    ...editedConsultation,
                    isActive: !editedConsultation.isActive,
                  })
                }
                style={{
                  backgroundColor: editedConsultation.isActive ? "green" : "gray",
                }}
              >
                <div
                  className={styles.toggleKnob}
                  style={{
                    left: editedConsultation.isActive ? "20px" : "2px",
                  }}
                ></div>
              </div>
              <small className={styles.statusText}>
                {editedConsultation.isActive ? "Active" : "Not Active"}
              </small>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.updateButton}
                  onClick={() => handleUpdate(consultation._id)}
                >
                  Update
                </button>
                <button className={styles.discardButton} onClick={handleDiscard}>
                  Discard
                </button>
              </div>
            </>
            ) : (
              <>
                <div className="font-weight-bold">{consultation.name}</div>
                <div>{consultation.fee}</div>
                <div
                  className={styles.toggleSwitch}
                  style={{
                    backgroundColor: consultation.isActive ? "green" : "gray",
                  }}
                >
                  <div
                    className={styles.toggleKnob}
                    style={{
                      left: consultation.isActive ? "20px" : "2px",
                    }}
                  ></div>
                </div>
                <small className={styles.statusText}>
                  {consultation.isActive ? "Active" : "Not Active"}
                </small>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(consultation._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="ml-2"
                    onClick={() => handleDelete(consultation._id)}
                  >
                    <MdDelete />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <h2 className={styles.subtitle}>Add New Consultation</h2>
      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Name"
          value={newConsultation.name}
          onChange={(e) =>
            setNewConsultation({ ...newConsultation, name: e.target.value })
          }
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Fee"
          value={newConsultation.fee}
          onChange={(e) =>
            setNewConsultation({ ...newConsultation, fee: e.target.value })
          }
        />
        <button className={styles.addButton} onClick={handleAdd}>
          Add Consultation
        </button>
      </div>
    </div>
  );
};

export default ConsultationComponent;
