import { useState, useEffect } from "react";
import styles from "./css/OffersComponent.module.css";
import { api, discount_type, serviceOffered } from "../../constant";
import { Button } from "react-bootstrap";
import Preloader from "../Preloader";
import { MdClose } from "react-icons/md";

const OffersComponent = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedOffer, setEditedOffer] = useState(null);
  const [newOffer, setNewOffer] = useState({
    name: "",
    code: "",
    start_date: "",
    end_date: "",
    discount_type: discount_type.Percentage,
    discount_value: "",
    redemption_limit: "",
    service_type: selectedServices,
    target_audience: "",
    isActive: true,
  });

  const handleCheckboxChange = (service) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(service)
        ? prevSelected.filter((s) => s !== service)
        : [...prevSelected, service]
    );
  };

  const removeService = (service) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service));
  };

  useEffect(() => {
    fetch(api.addNewOffer)
      .then((response) => response.json())
      .then((data) => setOffers(data))
      .catch((error) => console.error("Error fetching offers:", error));
  }, []);

  const handleEdit = (id) => {
    const offerToEdit = offers.find((item) => item._id === id);
    if (offerToEdit) {
      setEditing(id);
      setEditedOffer({ ...offerToEdit });
    }
  };

  const handleDiscard = () => {
    setEditing(null);
    setEditedOffer(null);
  };

  const handleUpdate = (id) => {
    fetch(`${api.addNewOffer}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedOffer),
    })
      .then((response) => response.json())
      .then((data) => {
        setOffers((prev) =>
          prev.map((item) => (item._id === id ? data : item))
        );
        setEditing(null);
        setEditedOffer(null);
      })
      .catch((error) => console.error("Error updating offer:", error));
  };

  const handleAdd = () => {
    setLoading(true);
    fetch(api.addNewOffer, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newOffer),
    })
      .then((response) => response.json())
      .then((data) => {
        setOffers((prev) => [...prev, data]);
        setNewOffer({
          name: "",
          code: "",
          start_date: "",
          end_date: "",
          discount_type: discount_type.Percentage,
          redemption_limit: "",
          target_audience: "",
          isActive: true,
        });
        setLoading(false);
      })
      .catch((error) => console.error("Error adding offer:", error));
  };

  const handleDelete = (id) => {
    fetch(`${api.addNewOffer}?id=${id}`, { method: "DELETE" })
      .then(() => setOffers((prev) => prev.filter((item) => item._id !== id)))
      .catch((error) => console.error("Error deleting offer:", error));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Offers</h1>
      <div className={styles.cardContainer}>
        {offers.length > 0
          ? offers.map((offer) => (
              <div key={offer._id} className={styles.card}>
                {editing === offer._id && editedOffer ? (
                  <>
                    <div className="float-right">
                      <div
                        className={styles.toggleSwitch}
                        onClick={() =>
                          setEditedOffer({
                            ...editedOffer,
                            isActive: !editedOffer.isActive,
                          })
                        }
                        style={{
                          backgroundColor: editedOffer.isActive
                            ? "green"
                            : "gray",
                        }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{
                            left: editedOffer.isActive ? "20px" : "2px",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.statusText}>
                      {editedOffer.isActive ? "Active" : "Not Active"}
                    </div>
                    <input
                      className={styles.input}
                      type="text"
                      value={editedOffer.name}
                      onChange={(e) =>
                        setEditedOffer({ ...editedOffer, name: e.target.value })
                      }
                      placeholder="Name"
                    />
                    <input
                      className={styles.input}
                      type="text"
                      value={editedOffer.code}
                      onChange={(e) =>
                        setEditedOffer({ ...editedOffer, code: e.target.value })
                      }
                      placeholder="Code"
                    />
                    <input
                      className={styles.input}
                      type="date"
                      value={editedOffer.start_date}
                      onChange={(e) =>
                        setEditedOffer({
                          ...editedOffer,
                          start_date: e.target.value,
                        })
                      }
                      placeholder="Start Date"
                    />
                    <input
                      className={styles.input}
                      type="date"
                      value={editedOffer.end_date}
                      onChange={(e) =>
                        setEditedOffer({
                          ...editedOffer,
                          end_date: e.target.value,
                        })
                      }
                      placeholder="End Date"
                    />
                    <select
                      className={styles.dropdown}
                      value={editedOffer.discount_type}
                      onChange={(e) =>
                        setEditedOffer({
                          ...editedOffer,
                          discount_type: e.target.value,
                        })
                      }
                    >
                      <option value={discount_type.Percentage}>
                        Percentage
                      </option>
                      <option value={discount_type.Fixed}>Fixed</option>
                      <option value={discount_type.Free}>Free</option>
                    </select>
                    <input
                      className={styles.input}
                      type="text"
                      value={editedOffer.discount_value}
                      onChange={(e) =>
                        setEditedOffer({
                          ...editedOffer,
                          discount_value: e.target.value,
                        })
                      }
                      placeholder="Discount Value"
                    />
                    <input
                      className={styles.input}
                      type="text"
                      value={editedOffer.redemption_limit}
                      onChange={(e) =>
                        setEditedOffer({
                          ...editedOffer,
                          redemption_limit: e.target.value,
                        })
                      }
                      placeholder="Redemption Limit"
                    />
                    <input
                      className={styles.input}
                      type="text"
                      value={editedOffer.target_audience}
                      onChange={(e) =>
                        setEditedOffer({
                          ...editedOffer,
                          target_audience: e.target.value,
                        })
                      }
                      placeholder="Target Audience"
                    />

                    <Button
                      className={styles.buttonUpdate}
                      onClick={() => handleUpdate(offer._id)}
                    >
                      Update
                    </Button>
                    <Button
                      className={`ml-2 ${styles.buttonDiscard}`}
                      onClick={handleDiscard}
                    >
                      Discard
                    </Button>
                  </>
                ) : (
                  <>
                    <div className={styles.offerDetails}>
                      <div className={styles.offerName}>
                        <b>NAME</b> - {offer.name}
                      </div>
                      <div className={styles.offerCode}>
                        <b>CODE</b> - {offer.code}
                      </div>
                      <div className={styles.offerDates}>
                        <b>DURATION</b> - {offer.start_date} - {offer.end_date}
                      </div>
                      <div className={styles.offerDiscount}>
                        <b>DISCOUNT TYPE</b> - {offer.discount_type}
                      </div>
                      <div className={styles.offerDiscount}>
                        <b>DISCOUNT VALUE</b> - {offer.discount_value}
                      </div>
                      <div className={styles.offerLimit}>
                        <b>REDEMPTION LIMIT</b> - {offer.redemption_limit}
                      </div>
                      <div className={styles.offerAudience}>
                        <b>TARGET AUDIENCE</b> - {offer.target_audience}
                      </div>
                    </div>
                    <div
                      className={styles.toggleSwitch}
                      style={{
                        backgroundColor: offer.isActive ? "green" : "gray",
                      }}
                    >
                      <div
                        className={styles.toggleKnob}
                        style={{
                          left: offer.isActive ? "20px" : "2px",
                        }}
                      ></div>
                    </div>
                    <div className={styles.buttonGroup}>
                      <Button
                        className={styles.buttonEdit}
                        onClick={() => handleEdit(offer._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        className={styles.buttonDelete}
                        onClick={() => handleDelete(offer._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          : "No Offers"}
      </div>

      <h2 className={styles.subtitle}>Add New Offer</h2>
      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Name"
          value={newOffer.name || ""}
          onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Code"
          value={newOffer.code || ""}
          onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
        />
        <input
          className={styles.input}
          type="date"
          placeholder="Start Date"
          value={newOffer.start_date || ""}
          onChange={(e) =>
            setNewOffer({ ...newOffer, start_date: e.target.value })
          }
        />
        <input
          className={styles.input}
          type="date"
          placeholder="End Date"
          value={newOffer.end_date || ""}
          onChange={(e) =>
            setNewOffer({ ...newOffer, end_date: e.target.value })
          }
        />
        <select
          className={styles.dropdown}
          value={newOffer.discount_type || ""}
          onChange={(e) =>
            setNewOffer({ ...newOffer, discount_type: e.target.value })
          }
        >
          <option value={discount_type.Percentage}>
            {discount_type.Percentage}
          </option>
          <option value={discount_type.Fixed}>{discount_type.Fixed}</option>
          <option value={discount_type.Free}>{discount_type.Free}</option>
        </select>
        <select
          className={styles.dropdown}
          value={newOffer.service_type || ""}
          onChange={(e) => handleCheckboxChange(e.target.value)}
          // onChange={(e) =>
          //   setNewOffer({ ...newOffer, service_type: e.target.value })
          // }
        >
          <option value="">Select Service</option>
          <option value={serviceOffered.consultation}>
            {serviceOffered.consultation}
          </option>
          <option value={serviceOffered.labTest}>
            {serviceOffered.labTest}
          </option>
        </select>

        {/* Display selected options */}
        <div className={styles.tagsContainer}>
          {selectedServices.map((service) => (
            <div key={service} className={styles.tag}>
              {service}
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeService(service)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>

        <input
          className={styles.input}
          type="text"
          placeholder="Discount Value"
          value={newOffer.discount_value || ""}
          onChange={(e) =>
            setNewOffer({ ...newOffer, discount_value: e.target.value })
          }
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Redemption Limit"
          value={newOffer.redemption_limit || ""}
          onChange={(e) =>
            setNewOffer({ ...newOffer, redemption_limit: e.target.value })
          }
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Target Audience"
          value={newOffer.target_audience || ""}
          onChange={(e) =>
            setNewOffer({ ...newOffer, target_audience: e.target.value })
          }
        />

        <div>
          <Button className={`${styles.buttonAdd}`} onClick={handleAdd}>
            Add Offer
          </Button>
        </div>
      </div>
      {loading && <Preloader />}
    </div>
  );
};

export default OffersComponent;
