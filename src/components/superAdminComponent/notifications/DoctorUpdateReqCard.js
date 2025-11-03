import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";

const DoctorUpdateReqCard = ({
  request,
  handleDoctReqApproveOrReject,
  handleReview,
  index,
}) => {
  const id = request._id;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [severity, setSeverity] = useState("info");
  const [status,setStatus] = useState(request.status)

  console.log(request,' request')

  const handleApproveOrReject =(id, action)=> {
    // Simulating an API call
      if (action === "approve") {
        // Success case
        // You can add any success-specific logic here
        // For example, updating state or triggering a callback
        handleDoctReqApproveOrReject(id,action)
        setStatus('approved')
        setSnackBarMessage("Approved") 
        setOpenSnackBar(true)
      } else {
        // Handle other actions if needed
        handleDoctReqApproveOrReject(id,action)
        setStatus('reject')
        setSnackBarMessage("reject") 
        setOpenSnackBar(true)
      }
  }

  return (
    <>
      <div className="d-flex align-items-center">
        <div>
          <div className="mb-0 font-weight-bold">
            <strong className="text-primary text-uppercase">
              {request.name}
            </strong>
            <span
              className={`badge text-white text-uppercase ml-2 ${
                status === "pending"
                  ? "bg-warning"
                  : status === "approved"
                  ? "bg-success"
                  : "bg-danger"
              } ms-2`}
            >
              {status}
            </span>
            <div>request to change :-</div>
          </div>
          <small>
            <ul className="list-none">
              {Object.keys(request.updatedFields).map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </small>
        </div>
      </div>

      <div>
        <Button
          variant="outline-primary"
          size="sm"
          className="me-2 mr-1"
          onClick={() => handleReview(index)}
        >
          Review
        </Button>
        <Button
          variant="outline-success"
          size="sm"
          className="me-2 mr-1"
          onClick={() => handleApproveOrReject(id, "approve")}
        >
          Approve
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
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
        <Alert
          severity={severity}
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DoctorUpdateReqCard;
