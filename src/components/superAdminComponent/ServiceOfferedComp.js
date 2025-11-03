import React, { useState, useEffect } from "react";
import styles from "./css/ServiceOffered.module.css";
import { MdDelete } from "react-icons/md";
import { api, sessionStorageName } from "../../constant";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setConsultationType } from "../../store/slices/superAdmin/otherDetailsSlice";
import { set } from "mongoose";

const ServiceOfferedComp = () => {
  const [loader, setLoader] = useState(false);
  const [service, setService] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedService, setEditedService] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    hsn_percentage: "",
    hsn_code: "",
    share: "",
    gst: "",
    platformfee: "",
    processingfee: "",
    freight: "",
    isActive: true,
  });
  const dispatch = useDispatch();
  const storedService = useSelector(
    (state) => state.superAdminHomePage.serviceOffered
  )

  console.log(storedService, "storedService");

  useEffect(() => {
    setService(storedService);
  }, []);

  const handleEdit = (id) => {
    const serviceToEdit = service.find((item) => item._id === id);
    if (serviceToEdit) {
      setEditing(id);
      setEditedService({ ...serviceToEdit });
    }
  };

  const handleDiscard = () => {
    setEditing(null);
    setEditedService(null);
  };

  const handleUpdate = (id) => {
    fetch(`${api.serviceOffered}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedService),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update consultation");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data, "response 43");
        setService((prev) =>
          prev.map((item) => (item._id === id ? data : item))
        );
        setEditing(null);
        setEditedService(null);
      })
      .catch((error) => console.error("Error updating consultation:", error));
  };

  const handleAdd = () => {
    setLoader(true);
    fetch(api.serviceOffered, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newService),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add service");
        }
        return response.json();
      })
      .then((data) => {
        setService((prev) => [...prev, data]);
        setNewService({ name: "", fee: "", isActive: true });
        setLoader(false);
      })
      .catch((error) => console.error("Error adding service:", error));
  };

  const handleDelete = (id) => {
    fetch(`${api.serviceOffered}?id=${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete service");
        }
        return response.text(); // You can use `.json()` if your backend returns a JSON response.
      })
      .then(() => {
        setService((prev) => prev.filter((item) => item._id !== id));
      })
      .catch((error) => console.error("Error deleting service:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Service Offered</h1>
      <div className={styles.cardContainer}>
        {service.map((service) => (
          <div key={service._id} className={styles.card}>
            {editing === service._id && editedService ? (
              <div>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Name"
                  value={editedService.name}
                  onChange={(e) =>
                    setEditedService({ ...editedService, name: e.target.value })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="Fee"
                  value={editedService.fee}
                  onChange={(e) =>
                    setEditedService({ ...editedService, fee: e.target.value })
                  }
                />

                <input
                  className={styles.input}
                  type="text"
                  placeholder="HSN Code"
                  value={editedService.hsn_code}
                  onChange={(e) =>
                    setEditedService({
                      ...editedService,
                      hsn_code: e.target.value,
                    })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="HSN %"
                  value={editedService.hsn_percentage}
                  onChange={(e) =>
                    setEditedService({
                      ...editedService,
                      hsn_percentage: e.target.value,
                    })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="Share"
                  value={editedService.share}
                  onChange={(e) =>
                    setEditedService({
                      ...editedService,
                      share: e.target.value,
                    })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="GST"
                  value={editedService.gst}
                  onChange={(e) =>
                    setEditedService({ ...editedService, gst: e.target.value })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="Platform Fee"
                  value={editedService.platformfee}
                  onChange={(e) =>
                    setEditedService({
                      ...editedService,
                      platformfee: e.target.value,
                    })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="Processing Fee"
                  value={editedService.processingfee}
                  onChange={(e) =>
                    setEditedService({
                      ...editedService,
                      processing_fee: e.target.value,
                    })
                  }
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="Freight"
                  value={editedService.freight}
                  onChange={(e) =>
                    setEditedService({
                      ...editedService,
                      freight: e.target.value,
                    })
                  }
                />

                <div
                  className={styles.toggleSwitch}
                  onClick={() =>
                    setEditedService({
                      ...editedService,
                      isActive: !editedService.isActive,
                    })
                  }
                  style={{
                    backgroundColor: editedService.isActive ? "green" : "gray",
                  }}
                >
                  <div
                    className={styles.toggleKnob}
                    style={{
                      left: editedService.isActive ? "20px" : "2px",
                    }}
                  ></div>
                </div>
                <small className={styles.statusText}>
                  {editedService.isActive ? "Active" : "Not Active"}
                </small>

                <div className={styles.buttonGroup}>
                  <Button
                    className={styles.updateButton}
                    onClick={() => handleUpdate(service._id)}
                  >
                    Update
                  </Button>
                  <button
                    className={styles.discardButton}
                    onClick={handleDiscard}
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.consultationCard}>
                  <div className={styles.infoSection}>
                    <div className={styles.name}>{service.name}</div>
                    <div>{service.fee}</div>
                    <div
                      className={styles.toggleSwitch}
                      style={{
                        backgroundColor: service.isActive ? "green" : "gray",
                      }}
                    >
                      <div
                        className={styles.toggleKnob}
                        style={{
                          left: service.isActive ? "20px" : "2px",
                        }}
                      />
                    </div>
                    <small className={styles.statusText}>
                      {service.isActive ? "Active" : "Not Active"}
                    </small>
                  </div>

                  <div className={styles.buttonGroup}>
                    <Button
                      className={styles.editButton}
                      onClick={() => handleEdit(service._id)}
                    >
                      Edit
                    </Button>
                    <MdDelete
                      size={22}
                      className="ml-2"
                      onClick={() => handleDelete(service._id)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <h2 className={styles.subtitle}>Add New Service</h2>
      <div className={styles.form}>
        <div className="d-flex flex-wrap gap-3 mb-3">
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              className={styles.input}
              type="text"
              name="name"
              value={newService.name}
              onChange={handleChange}
              placeholder="Enter service name"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              className={styles.input}
              type="text"
              name="description"
              value={newService.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </div>

          <div className={styles.formGroup}>
            <label>HSN %</label>
            <input
              className={styles.input}
              type="number"
              name="hsn_percentage"
              value={newService.hsn_percentage}
              onChange={handleChange}
              placeholder="e.g., 18"
            />
          </div>

          <div className={styles.formGroup}>
            <label>HSN Code</label>
            <input
              className={styles.input}
              type="text"
              name="hsn_code"
              value={newService.hsn_code}
              onChange={handleChange}
              placeholder="e.g., 9983"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Share</label>
            <input
              className={styles.input}
              type="number"
              name="share"
              value={newService.share}
              onChange={handleChange}
              placeholder="Enter share"
            />
          </div>

          <div className={styles.formGroup}>
            <label>GST</label>
            <input
              className={styles.input}
              type="number"
              name="gst"
              value={newService.gst}
              onChange={handleChange}
              placeholder="Enter GST"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Platform Fee</label>
            <input
              className={styles.input}
              type="number"
              name="platformfee"
              value={newService.platformfee}
              onChange={handleChange}
              placeholder="Enter platform fee"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Processing Fee</label>
            <input
              className={styles.input}
              type="number"
              name="processingfee"
              value={newService.processingfee}
              onChange={handleChange}
              placeholder="Enter processing fee"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Freight</label>
            <input
              className={styles.input}
              type="number"
              name="freight"
              value={newService.freight}
              onChange={handleChange}
              placeholder="Enter freight"
            />
          </div>
        </div>

        {loader ? (
          <div className={styles.loader}>Loading...</div>
        ) : (
          <Button className={styles.addButton} onClick={handleAdd}>
            Add Service
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServiceOfferedComp;
