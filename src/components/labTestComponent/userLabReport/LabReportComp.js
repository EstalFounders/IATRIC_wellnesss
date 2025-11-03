import { Container } from "react-bootstrap";
import styles from "../css/UserLabReport.module.css";
import { useState } from "react";

const LabReportComp = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // Sample data to represent reports
  const reports = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    name: "Vansh Goel",
    date: "09 Sep '24",
    downloadLink: "#",
    amount: "₹520",
  }));

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {/* First Section */}

      <div className="container mt-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className={styles.reportsText}>Reports</div>
        </div>

        {/* Search Bar */}
        <div className="input-group mb-4">
          <div className="d-flex align-items-center col-md-5">
            <span className={styles.sortByText}>Sort by</span>
            <select className={`form-select ms-2 ml-2 ${styles.formSelect}`}>
              <option>Latest</option>
              <option>Oldest</option>
            </select>
          </div>
          <input
            type="text"
            className={`form-control ${styles.searchInput}`}
            placeholder="Search for Report"
          />
          <div className={styles.searchBtn}>Search</div>
        </div>

        {/* Table Section */}
        <div className="table-responsive">
          <table className={`table table-borderless ${styles.table}`}>
            <thead className={styles.thead}>
              <tr className={styles.column}>
                <th scope="col">Patient Name</th>
                <th scope="col">Order Placed</th>
                <th scope="col">Invoice</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report) => (
                <tr key={report.id} className={styles.columnData}>
                  <td>{report.name}</td>
                  <td>{report.date}</td>
                  <td>
                    <a className={styles.downloadColumn} href={report.downloadLink}><u>Download</u></a>
                  </td>
                  <td>{report.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav aria-label="Page navigation example">
          <ul className="pagination justify-content-center mt-3">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default LabReportComp;
