import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { api } from "../../constant";

const CustomerQueryComp = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await fetch(api.userQuery);  // Replace with actual API endpoint to fetch queries
        const data = await response.json();
        setQueries(data);
      } catch (error) {
        console.error("Error fetching queries:", error);
      }
    };
    fetchQueries();
  }
  , []);  // Run only once on component mount         

  const handleView = (query) => {
    setSelectedQuery(query);
    setShowModal(true);
  };

  return (
    <div className="container-fluid">
      <div className="row">

        {/* Main Content */}
        <div className="col-md-10 p-4">
          <h3>Customer Queries</h3>

          {/* Query Table */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Query ID</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {queries ? queries.map((query) => (
                <tr key={query._id}>
                  <td>{query._id}</td>
                  <td>{query.name}</td>
                  <td>{query.createdAt}</td>
                  <td>{query.email}</td>
                  <td>{query.mobile_number}</td>
                  {/* <td>
                    <span
                      className={`badge ${
                        query.status === "Open"
                          ? "bg-danger"
                          : query.status === "In Progress"
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                    >
                      {query.status}
                    </span>
                  </td>
                  <td>{query.assignedTo}</td> */}
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleView(query)}>
                      View
                    </Button>{" "}
                    <Button variant="success" size="sm">
                      Reply
                    </Button>{" "}
                    <Button variant="warning" size="sm">
                      Assign
                    </Button>{" "}
                    <Button variant="danger" size="sm">
                      Close
                    </Button>
                  </td>
                </tr>
              )): <tr><td colSpan="7">No queries found</td></tr>}
            </tbody>
          </Table>

          {/* Query Details Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Query Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedQuery && (
                <>
                  <p>
                    <strong>Query ID:</strong> {selectedQuery._id}
                  </p>
                  <p>
                    <strong>Customer Name:</strong> {selectedQuery.name}
                  </p>
                  <p>
                    <strong>Query Date:</strong> {selectedQuery.createdAt}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedQuery.email}
                  </p>
                  {/* <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        selectedQuery.status === "Open"
                          ? "bg-danger"
                          : selectedQuery.status === "In Progress"
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                    >
                      {selectedQuery.status}
                    </span>
                  </p> */}
                  <Form>
                    <Form.Group>
                      <Form.Label>Reply</Form.Label>
                      <Form.Control as="textarea" rows={3} placeholder="Write your response..." />
                    </Form.Group>
                  </Form>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <div className="bg-secondary text-white py-2 px-3 rounded font-weight-bold" onClick={() => setShowModal(false)}>
                Close
              </div>
              <div className="bg-primary text-white py-2 px-3 rounded font-weight-bold">Send Reply</div>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default CustomerQueryComp;
