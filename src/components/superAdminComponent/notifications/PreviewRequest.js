import React from "react";
import styles from "./NotificationSection.module.css";
import {
  formatFieldValue,
  groupFields,
} from "../../../utils/doctorUpdateRequest";

// The bell's preview of one doctor change request. It has no doctor document to
// compare against (the bell only carries the request), so it lists the requested
// values using the same labels and the same indexed-key grouping as the full
// review page - "Consultation types: Video, Clinic, Audio" instead of
// "consultationType[0]", "consultationType[1]", "consultationType[2]".
const PreviewRequest = ({ request, handleDoctReqApproveOrReject, onClose }) => {
  const id = request._id;
  const fields = groupFields(request.updatedFields);

  return (
    <div style={{ padding: 24, minWidth: 400 }}>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111", marginBottom: 4 }}>
        UPDATE REQUEST
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1a3a0e", textTransform: "uppercase", marginBottom: 16 }}>
        {request.name}
      </div>

      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#222", marginBottom: 8 }}>
        Requested Updates
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {fields.length === 0 ? (
          <li style={{ marginBottom: 8, fontSize: "0.85rem", color: "#444" }}>
            This request carries no field values.
          </li>
        ) : (
          fields.map((field) => (
            <li
              key={field.key}
              style={{ marginBottom: 8, fontSize: "0.85rem", color: "#444" }}
            >
              <strong style={{ color: "#222", fontWeight: 600 }}>
                {field.label}:
              </strong>{" "}
              <span>{formatFieldValue(field.key, field.value) || "—"}</span>
            </li>
          ))
        )}
      </ul>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          className={styles.approveBtn}
          onClick={() => {
            handleDoctReqApproveOrReject(id, "approve");
            onClose();
          }}
        >
          Approve
        </button>
        <button
          className={styles.rejectBtn}
          onClick={() => {
            handleDoctReqApproveOrReject(id, "reject");
            onClose();
          }}
        >
          Reject
        </button>
        <button
          onClick={onClose}
          style={{
            background: "#f5f5f5",
            color: "#333",
            border: "1px solid #ccc",
            padding: "8px 18px",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PreviewRequest;