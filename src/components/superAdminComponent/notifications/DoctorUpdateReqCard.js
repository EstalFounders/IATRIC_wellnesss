import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";
import styles from "./NotificationSection.module.css";

const DoctorUpdateReqCard = ({
  request,
  handleDoctReqApproveOrReject,
  handleReview,
  index,
}) => {
  const id = request._id;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [status, setStatus] = useState(request.status);

  const handleApproveOrReject = (id, action) => {
    if (action === "approve") {
      handleDoctReqApproveOrReject(id, action);
      setStatus("approved");
      setSnackBarMessage("Approved");
      setSeverity("success");
      setOpenSnackBar(true);
    } else {
      handleDoctReqApproveOrReject(id, action);
      setStatus("rejected");
      setSnackBarMessage("Rejected");
      setSeverity("error");
      setOpenSnackBar(true);
    }
  };

  const badgeClass =
    status === "pending"
      ? `${styles.cardBadge} ${styles.badgePending}`
      : status === "approved"
      ? `${styles.cardBadge} ${styles.badgeApproved}`
      : `${styles.cardBadge} ${styles.badgeRejected}`;

  return (
    <div className={styles.card}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span className={styles.cardName}>{request.name}</span>
        <span className={badgeClass}>{status}</span>
      </div>
      <div className={styles.cardSubtext}>Requested changes:</div>
      <ul className={styles.cardFieldList}>
        {Object.keys(request.updatedFields || {}).map((field) => (
          <li key={field} className={styles.cardFieldItem}>{field}</li>
        ))}
      </ul>
      <div className={styles.actionArea}>
        <button className={styles.reviewBtn} onClick={handleReview}>Review</button>
        <button className={styles.approveBtn} onClick={() => handleApproveOrReject(id, "approve")}>Approve</button>
        <button className={styles.rejectBtn} onClick={() => handleApproveOrReject(id, "reject")}>Reject</button>
      </div>
      <Snackbar open={openSnackBar} autoHideDuration={1000} onClose={() => setOpenSnackBar(false)}>
        <Alert severity={severity} sx={{ width: "100%" }}>{snackBarMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default DoctorUpdateReqCard;