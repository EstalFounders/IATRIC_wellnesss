import { Button } from "react-bootstrap";
import { formatData } from "../../registerDocComponent/utils/helper";
import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const LeaveReqCard = ({
  request,
  handleLeaveApproveOrReject,
}) => {
  const id = request._id;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [severity, setSeverity] = useState("info");
  const [status, setStatus] = useState(request.status);

  const handleApproveOrReject = (id, action) => {
    // Simulating an API call
    if (action === "approve") {
      // Success case
      // You can add any success-specific logic here
      // For example, updating state or triggering a callback
      handleLeaveApproveOrReject(id, action);
      setStatus("approved");
      setSnackBarMessage("Approved");
      setOpenSnackBar(true);
    } else {
      handleLeaveApproveOrReject(id, action);
      setStatus("rejected");
      setSnackBarMessage("Reject");
      setOpenSnackBar(true);
      // Handle other actions if needed
    }
  };

  return (
    <div className="leave-request-card">
      <div className="d-flex align-items-center">
        <div>
          <p className="mb-0 font-weight-bold">
            <strong className="text-primary text-uppercase">
              {request.name}
            </strong>
          </p>
          <div className="mt-2">
            <p className="mb-1">
              <strong className="font-weight-bold">Start Date:</strong>{" "}
              {formatData(request.startTime)}
            </p>
            <p className="mb-1">
              <strong className="font-weight-bold">End Date:</strong>{" "}
              {formatData(request.endTime)}
            </p>
            <p className="mb-1">
              <strong className="font-weight-bold">Reason:</strong>{" "}
              {request.reason}
            </p>
            <p className="mb-1">
              <strong className="font-weight-bold">Status:</strong>
              <span
                className={`badge text-white text-uppercase ${
                  status === "pending"
                    ? "bg-warning"
                    : status === "approved"
                    ? "bg-success"
                    : "bg-danger"
                } ml-2`}
              >
                {status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Button
          variant="outline-success"
          size="sm"
          className="me-2"
          onClick={() => handleApproveOrReject(id, "approve")}
        >
          Approve
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          className="ml-2"
          onClick={() => handleApproveOrReject(id, "reject")}
        >
          Reject
        </Button>
      </div>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={1000}
        onClose={() => setOpenSnackBar(false)}
      >
        <Alert severity={severity} sx={{ width: "100%" }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LeaveReqCard;
