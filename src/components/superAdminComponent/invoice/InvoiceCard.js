import { Button } from "react-bootstrap";
import { formatData } from "../../registerDocComponent/utils/helper";
import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const InvoiceCard = ({ request,   openPreview,handleGenerate }) => {
  const id = request._id;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [severity, setSeverity] = useState("info");
  const [status, setStatus] = useState(request.status);

  // const handleApproveOrReject = (id, action) => {
  //   // Simulating an API call
  //   if (action === "approve") {
  //     // Success case
  //     // You can add any success-specific logic here
  //     // For example, updating state or triggering a callback
  //     handleLeaveApproveOrReject(id, action);
  //     setStatus("approved");
  //     setSnackBarMessage("Approved");
  //     setOpenSnackBar(true);
  //   } else {
  //     handleLeaveApproveOrReject(id, action);
  //     setStatus("rejected");
  //     setSnackBarMessage("Reject");
  //     setOpenSnackBar(true);
  //     // Handle other actions if needed
  //   }
  // };

  return (
    <div className="leave-request-card">
      <div className="d-flex flex-wrap">
        <div className="col-12 mb-2">
          <p className="mb-0 font-weight-bold text-primary text-uppercase">
            {request.name}
          </p>
        </div>
        <div className="col-6 mb-2">
          <strong className="font-weight-bold">Patient Name:</strong>{" "}
          {request.name}
        </div>
        <div className="col-6 mb-2">
          <strong className="font-weight-bold">Mobile No:</strong>{" "}
          {request.mobNo}
        </div>
        <div className="col-6 mb-2">
          <strong className="font-weight-bold">Total Price:</strong>{" "}
          {request.totalPrice}
        </div>
        <div className="col-6 mb-2">
          <strong className="font-weight-bold">Items:</strong>
          {request.item.map((i) => i.name).join(", ")}
        </div>
        <div className="col-6 mb-2">
          <strong className="font-weight-bold">Invoice Number:</strong>
          <span>{request.invoiceNumber}</span>
        </div>
      </div>
      <div className="mt-3">
        <Button
          variant="outline-success"
          size="sm"
          className="me-2"
          onClick={() => openPreview(request.id)}
        >
          VIEW INVOICE
        </Button>
        {/* <Button
          variant="outline-danger"
          size="sm"
          className="ml-2"
          onClick={() => handleGenerate()}
        >
          GENERATE & SEND
        </Button> */}
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

export default InvoiceCard;
