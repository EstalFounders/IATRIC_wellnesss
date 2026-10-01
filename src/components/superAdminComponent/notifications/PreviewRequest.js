import React from "react";
import styles from "./NotificationSection.module.css";

const PreviewRequest = ({ request, handleDoctReqApproveOrReject, onClose }) => {
  const id = request._id;

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
        {Object.entries(request.updatedFields || {}).map(([key, value], index) => (
          <li key={index} style={{ marginBottom: 8, fontSize: "0.85rem", color: "#444" }}>
            <strong style={{ color: "#222", fontWeight: 600 }}>{key}:</strong>{" "}
            <span>{Array.isArray(value) ? value.join(", ") : value}</span>
          </li>
        ))}
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