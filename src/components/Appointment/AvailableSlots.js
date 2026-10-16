import React, { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { extractDate, formatTime } from "../helper";

/**
 * Fallback slot picker.
 *
 * Shown when the patient asked for "Now" but nothing is free today: the booking
 * API answers `status: 304` plus `nextSlots` (pages/api/helper.js), and this
 * component lists them.
 *
 * Deliberately minimal - one card per slot with a single direct "Book" button.
 * Each entry already carries its doctor and start time, so there is no calendar
 * step or "Select" detour between the patient and the payment gateway.
 */
const AvailableSlots = ({ slots = [], onBookSlot, message }) => {
  const { t } = useLanguage();
  // Slot whose Book button is in flight. Every button disables meanwhile so a
  // double tap cannot send two bookings for the same slot.
  const [bookingSlotId, setBookingSlotId] = useState("");

  const bookSlot = async (slot) => {
    if (bookingSlotId) return;
    setBookingSlotId(slot._id || `${slot.doctorId}-${slot.startTime}`);
    try {
      await onBookSlot(slot);
    } finally {
      setBookingSlotId("");
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4 text-success">{message}</div>
      {slots.length > 0 ? (
        <div className="row">
          {slots.map((slot) => {
            const slotKey = slot._id || `${slot.doctorId}-${slot.startTime}`;
            return (
              <div key={slotKey} className="col-md-4 mb-4">
                <div className="card shadow-lg border-0 h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="card-text text-secondary">
                      <strong>{t("avs.date")}</strong> {extractDate(slot.startTime)}
                    </div>
                    <div className="card-text text-secondary">
                      <strong>{t("avs.time")}</strong> {formatTime(slot.startTime)} -{" "}
                      {formatTime(slot.endTime)}
                    </div>
                    {slot.doctorName ? (
                      <div className="card-text text-secondary">
                        <strong>{t("avs.doctor")}</strong> {slot.doctorName}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-success mt-3 mt-auto"
                      disabled={Boolean(bookingSlotId)}
                      onClick={() => bookSlot(slot)}
                    >
                      {t("avs.book")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted">
          <h4>{t("avs.none")}</h4>
        </div>
      )}
    </div>
  );
};

export default AvailableSlots;
