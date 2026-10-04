import React, { useEffect, useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { api, color_schema } from "../../constant";
import styles from "./css/CustomerQueryComp.module.css";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const getInitials = (name) => {
  return (name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const CustomerQueryComp = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queries, setQueries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      setLoading(true);
      try {
        const response = await fetch(api.userQuery);
        const data = await response.json();
        setQueries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching queries:", error);
        setQueries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const totalPages = Math.max(1, Math.ceil(queries.length / ITEMS_PER_PAGE));
  const paginatedQueries = queries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (query) => {
    setSelectedQuery(query);
    setShowModal(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h5 className={styles.headerTitle}>Customer Queries</h5>
        <span className={styles.headerCount}>{queries.length} total</span>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading queries...</div>
      ) : queries.length === 0 ? (
        <div className={styles.emptyState}>No queries found</div>
      ) : (
        <>
          {paginatedQueries.map((query) => {
            const isExpanded = expandedId === query._id;
            return (
              <div key={query._id} className={styles.queryItem}>
                <div className={styles.queryMain} onClick={() => toggleExpand(query._id)}>
                  <div className={styles.queryAvatar}>
                    {getInitials(query.name)}
                  </div>
                  <div className={styles.queryInfo}>
                    <div className={styles.queryName}>{query.name || "Unknown"}</div>
                    <div className={styles.queryMeta}>
                      <span>📅 {formatDate(query.createdAt)}</span>
                      {query.email && <span>✉️ {query.email}</span>}
                      {query.mobile_number && <span>📞 {query.mobile_number}</span>}
                    </div>
                  </div>
                  {query.message && (
                    <div className={styles.queryMessage}>{query.message}</div>
                  )}
                  <span className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ""}`}>
                    ▼
                  </span>
                </div>

                {isExpanded && (
                  <div className={styles.queryExpanded}>
                    <div className={styles.expandedField}>
                      <strong>Query ID:</strong> {query._id}
                    </div>
                    {query.email && (
                      <div className={styles.expandedField}>
                        <strong>Email:</strong> {query.email}
                      </div>
                    )}
                    {query.mobile_number && (
                      <div className={styles.expandedField}>
                        <strong>Phone:</strong> {query.mobile_number}
                      </div>
                    )}
                    {query.visited_before !== undefined && (
                      <div className={styles.expandedField}>
                        <strong>Visited Before:</strong> {query.visited_before ? "Yes" : "No"}
                      </div>
                    )}
                    {query.message && (
                      <div className={styles.expandedField}>
                        <strong>Message:</strong> {query.message}
                      </div>
                    )}
                    <div className={styles.expandedActions}>
                      <button className={`${styles.actionBtn} ${styles.viewBtn}`} onClick={() => handleView(query)}>
                        View
                      </button>
                      <button className={`${styles.actionBtn} ${styles.replyBtn}`}>
                        Reply
                      </button>
                      <button className={`${styles.actionBtn} ${styles.assignBtn}`}>
                        Assign
                      </button>
                      <button className={`${styles.actionBtn} ${styles.closeBtn}`}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next ›
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* Query Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Query Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuery && (
            <>
              <p><strong>Query ID:</strong> {selectedQuery._id}</p>
              <p><strong>Customer Name:</strong> {selectedQuery.name}</p>
              <p><strong>Query Date:</strong> {formatDate(selectedQuery.createdAt)}</p>
              <p><strong>Email:</strong> {selectedQuery.email}</p>
              {selectedQuery.mobile_number && (
                <p><strong>Phone:</strong> {selectedQuery.mobile_number}</p>
              )}
              {selectedQuery.message && (
                <p><strong>Message:</strong> {selectedQuery.message}</p>
              )}
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
          <div
            className="py-2 px-3 rounded font-weight-bold"
            onClick={() => setShowModal(false)}
            style={{ cursor: "pointer", background: "#f5f5f5", color: "#555", border: "1px solid #ddd" }}
          >
            Cancel
          </div>
          <div
            className="py-2 px-3 rounded font-weight-bold"
            style={{ cursor: "pointer", background: color_schema.green, color: "#fff" }}
          >
            Send Reply
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerQueryComp;