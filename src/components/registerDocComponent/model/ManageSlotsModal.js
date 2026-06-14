import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import styles from "./ManageSlotsModal.module.css";
import { extractTime } from "../utils/helper";

const toISODate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const ManageSlotsModal = ({ show, onClose, doctorId }) => {
  const today = toISODate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [isDateUnavailable, setIsDateUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slotToggles, setSlotToggles] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch slots for the selected date using existing fetchSlot API
  const fetchSlotsForDate = useCallback(async () => {
    if (!doctorId || !selectedDate) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Use the selectedDate at noon UTC to avoid timezone boundary issues
      const dateObj = new Date(selectedDate + "T12:00:00Z");
      const response = await fetch(
        `/api/slots/fetchSlot/?doctor=${doctorId}&date=${dateObj.toISOString()}`
      );
      const result = await response.json();

      // Also fetch unavailable status for the date
      const statusResponse = await fetch(
        `/api/registerDoc/manageSlots?doctorId=${doctorId}&date=${selectedDate}`
      );
      const statusResult = await statusResponse.json();

      if (result.success && Array.isArray(result.data)) {
        setSlots(result.data);
        // Initialize toggles: isBooked = false means available
        const toggles = {};
        for (const slot of result.data) {
          // If the slot is already booked by a patient, mark it as booked (cannot toggle)
          // Otherwise, if date is unavailable, default to unavailable
          if (slot.isBooked) {
            toggles[slot._id] = "booked"; // special value: booked by patient
          } else {
            toggles[slot._id] = true; // true = available
          }
        }
        setSlotToggles(toggles);

        // Set date unavailable status
        if (statusResult.success) {
          setIsDateUnavailable(statusResult.isDateUnavailable || false);
        }
      } else {
        setSlots([]);
        setSlotToggles({});
        if (statusResult.success) {
          setIsDateUnavailable(statusResult.isDateUnavailable || false);
        }
      }
      setHasChanges(false);
    } catch (err) {
      setError("Failed to load slots. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [doctorId, selectedDate]);

  // Reset to today when modal opens
  useEffect(() => {
    if (show) {
      setSelectedDate(today);
      setSuccess("");
      setError("");
      setHasChanges(false);
    }
  }, [show]);

  // Fetch slots when date changes
  useEffect(() => {
    if (show && doctorId && selectedDate) {
      fetchSlotsForDate();
    }
  }, [show, doctorId, selectedDate, fetchSlotsForDate]);

  const handleToggleSlot = (slotId) => {
    setSlotToggles((prev) => {
      const current = prev[slotId];
      // If "booked" (patient already booked), don't allow toggle
      if (current === "booked") return prev;
      return { ...prev, [slotId]: !current };
    });
    setHasChanges(true);
  };

  const handleToggleDateUnavailable = () => {
    setIsDateUnavailable((prev) => !prev);
    setHasChanges(true);
    // When marking date as unavailable, also mark all free slots as unavailable
    if (!isDateUnavailable) {
      setSlotToggles((prev) => {
        const updated = { ...prev };
        for (const [id, status] of Object.entries(updated)) {
          if (status !== "booked") updated[id] = false;
        }
        return updated;
      });
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    // Find slots that were toggled off (unavailable)
    const slotsToDisable = Object.entries(slotToggles)
      .filter(([_id, status]) => status === false)
      .map(([_id]) => _id);

    try {
      const response = await fetch("/api/registerDoc/manageSlots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: selectedDate,
          unavailableSlots: slotsToDisable,
          isDateUnavailable,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess("Slots updated successfully.");
        setHasChanges(false);
        // Refresh the data
        await fetchSlotsForDate();
      } else {
        setError(result.message || "Failed to update slots.");
      }
    } catch (err) {
      setError("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Slots</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.container}>
          {error && <div className={styles.errorText}>{error}</div>}
          {success && <div className={styles.successText}>{success}</div>}

          {/* Date Picker */}
          <div className={styles.datePickerRow}>
            <label className={styles.datePickerLabel}>Select Date:</label>
            <input
              type="date"
              className={styles.datePickerInput}
              value={selectedDate}
              min={today}
              onChange={handleDateChange}
            />
          </div>

          {/* Mark Full Day Unavailable Toggle */}
          <div className={styles.fullDayRow}>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={isDateUnavailable}
                onChange={handleToggleDateUnavailable}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.fullDayLabel}>
              {isDateUnavailable
                ? "Marked as Unavailable (full day)"
                : "Mark as Unavailable (full day)"}
            </span>
          </div>

          <hr />

          {/* Slots for selected date */}
          {loading ? (
            <div className={styles.loadingText}>Loading slots...</div>
          ) : slots.length === 0 && !loading ? (
            <div className={styles.emptyText}>
              No slots found for this date. Slots are generated by the admin.
            </div>
          ) : isDateUnavailable ? (
            <div className={styles.emptyText}>
              This date is marked as unavailable. All slots are disabled.
            </div>
          ) : (
            <div className={styles.slotsList}>
              {slots.map((slot) => {
                const status = slotToggles[slot._id];
                const isBooked = status === "booked";
                const isAvailable = status === true;

                if (isBooked) {
                  return (
                    <div key={slot._id} className={styles.slotRow}>
                      <span className={styles.slotTime}>
                        {extractTime(slot.startTime)} – {extractTime(slot.endTime)}
                      </span>
                      <span className={styles.bookedBadge}>Booked</span>
                    </div>
                  );
                }

                return (
                  <div key={slot._id} className={styles.slotRow}>
                    <span className={styles.slotTime}>
                      {extractTime(slot.startTime)} – {extractTime(slot.endTime)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={() => handleToggleSlot(slot._id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span
                        className={
                          isAvailable
                            ? styles.availableBadge
                            : styles.unavailableBadge
                        }
                      >
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.footerNote}>
            Toggle individual slots or mark the full day as unavailable. Changes apply when you save.
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || loading || !hasChanges}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageSlotsModal;