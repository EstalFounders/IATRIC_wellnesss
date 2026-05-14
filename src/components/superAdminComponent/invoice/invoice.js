import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ListGroup } from "react-bootstrap";
import { api } from "../../../constant";
import InvoiceCard from "./InvoiceCard";
import NotifcationPreviewModel from "../model/NotificationPreviewModel";
import GenerateInvoiceImage from "./generateInvoiceImage";
import CreateInvoiceModal from "./CreateInvoiceModal";

const InvoiceComp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { type } = router.query;
  const [invoice, setInvoice] = useState([]);
  const [filteredReq, setFilteredRq] = useState(invoice);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [show, setShow] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    setShow(false);
  };

  const handleManualInvoiceSubmit = (invoiceData) => {
    setShowCreateModal(false);
    setSelectedInvoice([invoiceData]);
    setShow(true);
  };

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
      {/* Search Bar + Create Invoice */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
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
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Invoice
        </button>
      </div>

      {filteredReq && filteredReq.length > 0
        ? filteredReq.map((req, index) => (
            <ListGroup.Item
              key={req.id || index}
              className="d-flex justify-content-between align-items-center"
            >
              <InvoiceCard request={req} openPreview={openPreview} />
            </ListGroup.Item>
          ))
        : "No Request found"}

      {/* Invoice preview modal (shared) */}
      <NotifcationPreviewModel isOpen={show}>
        {selectedInvoice && (
          <GenerateInvoiceImage
            request={selectedInvoice}
            onClose={closePreview}
          />
        )}
      </NotifcationPreviewModel>

      {/* Manual create invoice modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleManualInvoiceSubmit}
        />
      )}
    </div>
  );
};

export default InvoiceComp;
