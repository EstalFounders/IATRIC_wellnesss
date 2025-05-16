import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { ListGroup } from "react-bootstrap";
import LeaveReqCard from "../notifications/LeaveReqCard";
import { handleLeaveApproveOrRejectService } from "../apiService/doctorLeaveApproveOrRejectService";
import { api } from "../../../constant";
import InvoiceCard from "./InvoiceCard";
import NotifcationPreviewModel from "../model/NotificationPreviewModel";
import GenerateInvoiceImage from "./generateInvoiceImage";

const InvoiceComp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { type } = router.query;
  const [invoice, setInvoice] = useState([]);
  const [filteredReq, setFilteredRq] = useState(invoice);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [show, setShow] = useState(false)
  const invoiceRef = React.useRef();

  useEffect(() => {
    try {
      const getInvoice = async () => {
        const response = await fetch(api.getInvoice, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setInvoice(data.message);
        setFilteredRq(data.message);
      };
      getInvoice();
    } catch (error) {
      console.error("Error fetching leave request data:", error);
    }
  }, []);

  const openPreview = (id) => {
    console.log("id", id);
    setSelectedInvoice(invoice.filter((req) => req.id === id));
    setShow(true)
  }

  const closePreview = () => {
    setShow(false)
  }

  // const removeInvoice = (invoiceNumber) => {
  //   const updatedInvoice = invoice.filter((req) => req.invoiceNumber !== invoiceNumber);
  //   setInvoice(updatedInvoice);
  //   setFilteredRq(updatedInvoice);
  // };

  

  // Handle search input
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = invoice.filter((req) => {
      return (
        req.name.toLowerCase().includes(query) 
        // ||
        // req.status.toLowerCase().includes(query)
      );
    });

    setFilteredRq(filtered);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search invoice..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>
      {filteredReq && filteredReq.length > 0
        ? filteredReq.map((req, index) => (
            <React.Fragment key={req.id || index}>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <InvoiceCard
                  key={index}
                  request={req}
                  openPreview={openPreview}
                />
                <NotifcationPreviewModel
                  isOpen={show}
                  key={`${req.id || index}-model`}
                >
                  <GenerateInvoiceImage
                    request={selectedInvoice}
                    onClose={closePreview}
                  />
                </NotifcationPreviewModel>
              </ListGroup.Item>
            </React.Fragment>
          ))
        : "No Request found"}
    </div>
  );
};

export default InvoiceComp;
