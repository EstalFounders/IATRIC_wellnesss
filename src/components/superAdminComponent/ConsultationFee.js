import React, { useState, useEffect } from "react";
import styles from "./css/ConsultationFee.module.css";
import { MdDelete } from "react-icons/md";
import { api, sessionStorageName } from "../../constant";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setConsultationType } from "../../store/slices/superAdmin/otherDetailsSlice";
import { set } from "mongoose";

const ConsultationFeeComponent = () => {
  const [consultations, setConsultations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedConsultation, setEditedConsultation] = useState(null);
  const [newConsultation, setNewConsultation] = useState({
    name: "",
    fee: "",
    isActive: true,
  });
  const dispatch = useDispatch();
  const storedConsultations = useSelector(
    (state) => state.otherDetailsSlice.consultationType
  );

  useEffect(() => {
    setConsultations(storedConsultations);
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
    fetch(`${api.consiltationFee}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedConsultation),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update consultation");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data, "response 43");
        setConsultations((prev) =>
          prev.map((item) => (item._id === id ? data : item))
        );
        setEditing(null);
        setEditedConsultation(null);
      })
      .catch((error) => console.error("Error updating consultation:", error));
  };

  const handleAdd = () => {
    fetch(api.consiltationFee, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newConsultation),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add consultation");
        }
        return response.json();
      })
      .then((data) => {
        setConsultations((prev) => [...prev, data]);
        setNewConsultation({ name: "", fee: "", isActive: true });
      })
      .catch((error) => console.error("Error adding consultation:", error));
  };

  const handleDelete = (id) => {
    fetch(`${api.consiltationFee}?id=${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete consultation");
        }
        return response.text(); // You can use `.json()` if your backend returns a JSON response.
      })
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
                    backgroundColor: editedConsultation.isActive
                      ? "green"
                      : "gray",
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
                  <button
                    className={styles.discardButton}
                    onClick={handleDiscard}
                  >
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
                  <Button
                    className={styles.editButton}
                    onClick={() => handleEdit(consultation._id)}
                  >
                    Edit
                  </Button>
                    <MdDelete size={22} className="ml-2" onClick={() => handleDelete(consultation._id)} />
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
        <Button className={styles.addButton} onClick={handleAdd}>
          Add Consultation
        </Button>
      </div>
    </div>
  );
};

export default ConsultationFeeComponent;
