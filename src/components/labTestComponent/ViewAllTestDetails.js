import React, { useState } from "react";
import { useSelector } from "react-redux";
import HealthCheckupCard from "./common/HealthCheckupCard";
import { Col } from "react-bootstrap";
import styles from "./css/FirstSection.module.css"

const ViewAllTestDetails = () => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const testsPerPage = 20;

    const allTestDetails = useSelector(
        (state) => state.labtestHomepage.allTestDetails
    );

    const filteredTests = allTestDetails.filter((test) =>
        test.title.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const indexOfLastTest = currentPage * testsPerPage;
    const indexOfFirstTest = indexOfLastTest - testsPerPage;
    const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
    const totalPages = Math.ceil(filteredTests.length / testsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="d-flex flex-column align-items-center mt-5 labtest-bg-image">
            <h2>All Lab Test Details</h2>
            <input
                type="text"
                placeholder="Search tests..."
                value={search}
                className="mt-2"
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                }}
                style={{
                    width: "80%",
                    padding: 8,
                    marginBottom: 16,
                    fontSize: 16,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                }}
            />
            <div className="row">
                {currentTests.length === 0
                    ? "No tests found"
                    : currentTests.map((checkup) => (
                            <Col
                                key={checkup._id}
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                className="mb-3"
                            >
                                <HealthCheckupCard healthCheckupData={checkup} />
                            </Col>
                        ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav className="mt-3 d-flex justify-content-center mb-5">
                    <ul
                        className="pagination"
                        style={{
                            width: "fit-content",
                            minWidth: 0,
                            margin: "0 auto",
                            padding: "0 1px",
                            gap: "1px",
                            maxWidth: "90vw",
                            overflowX: "auto",
                        }}
                    >
                        <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                            <button
                                className="page-link"
                                style={{ padding: "1px 4px", minWidth: 20, fontSize: 16 }}
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li
                                key={i + 1}
                                className={`page-item${currentPage === i + 1 ? " active" : ""}`}
                            >
                                <button
                                    className="page-link"
                                    style={{ padding: "1px 4px", minWidth: 20, fontSize: 16 }}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li
                            className={`page-item${
                                currentPage === totalPages ? " disabled" : ""
                            }`}
                        >
                            <button
                                className="page-link"
                                style={{ padding: "1px 4px", minWidth: 20, fontSize: 16 }}
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default ViewAllTestDetails;
