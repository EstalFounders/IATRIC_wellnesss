// ServicesTable.js - the service list of the super-admin "Service offered" page.
//
// One row per service, one column per stored figure. A <colgroup> pins every
// column so the table lands on its intended width at desktop size and the wrap
// (.tableWrap, overflow-x: auto) scrolls below that. `overflow-wrap: anywhere` on
// the cells (set in the CSS module) keeps each column's minimum width tiny, so an
// unbroken value can never widen the table past the card.
import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { serviceCategoryType } from "../../../constant";
import styles from "../css/ServiceOffered.module.css";

// Column widths (px). Their sum is the table's min-width in the CSS module.
const COLUMNS = [
  { key: "name", label: "Service", width: 190 },
  { key: "category", label: "Category", width: 84 },
  { key: "fee", label: "Fee", width: 72 },
  { key: "hsn_code", label: "HSN code", width: 88 },
  { key: "hsn_percentage", label: "HSN %", width: 64 },
  { key: "share", label: "Share", width: 64 },
  { key: "gst", label: "GST", width: 58 },
  { key: "platformfee", label: "Platform", width: 78 },
  { key: "processingfee", label: "Processing", width: 88 },
  { key: "freight", label: "Freight", width: 64 },
  { key: "status", label: "Status", width: 88 },
  { key: "actions", label: "Actions", width: 150 },
];

const dash = (value) =>
  value === undefined || value === null || value === "" ? "—" : value;

const ServicesTable = ({ rows, onEdit, onDelete }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <colgroup>
        {COLUMNS.map((column) => (
          <col key={column.key} style={{ width: column.width }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th
              key={column.key}
              className={`${styles.th}${
                column.key === "name" ? ` ${styles.nameCol}` : ""
              }`}
              scope="col"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((service) => {
          const isMajor = service.categoryType !== serviceCategoryType.SUB;
          return (
            <tr key={service._id}>
              <td className={`${styles.td} ${styles.nameCol}`}>
                <div className={styles.nameCell}>
                  {service.image ? (
                    <img
                      src={service.image}
                      alt=""
                      className={styles.thumb}
                    />
                  ) : (
                    <span className={styles.thumbPlaceholder} aria-hidden="true" />
                  )}
                  <div>
                    <span className={styles.name}>{service.name}</span>
                    {service.subheading ? (
                      <span className={styles.sub}>{service.subheading}</span>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <span
                  className={`${styles.badge} ${
                    isMajor ? styles.badgeMajor : styles.badgeSub
                  }`}
                >
                  {isMajor ? "Major" : "Sub"}
                </span>
              </td>
              <td className={`${styles.td} ${styles.num}`}>{dash(service.fee)}</td>
              <td className={styles.td}>{dash(service.hsn_code)}</td>
              <td className={`${styles.td} ${styles.num}`}>
                {dash(service.hsn_percentage)}
              </td>
              <td className={`${styles.td} ${styles.num}`}>{dash(service.share)}</td>
              <td className={`${styles.td} ${styles.num}`}>{dash(service.gst)}</td>
              <td className={`${styles.td} ${styles.num}`}>
                {dash(service.platformfee)}
              </td>
              <td className={`${styles.td} ${styles.num}`}>
                {dash(service.processingfee)}
              </td>
              <td className={`${styles.td} ${styles.num}`}>
                {dash(service.freight)}
              </td>
              <td className={styles.td}>
                <span
                  className={`${styles.status}${
                    service.isActive
                      ? ` ${styles.statusActive}`
                      : ` ${styles.statusInactive}`
                  }`}
                >
                  {service.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className={`${styles.td} ${styles.actionsCell}`}>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.rowBtn}
                    onClick={() => onEdit(service)}
                  >
                    <MdEdit aria-hidden="true" size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.rowBtnDanger}
                    onClick={() => onDelete(service)}
                    title={`Delete ${service.name}`}
                    aria-label={`Delete ${service.name}`}
                  >
                    <MdDelete aria-hidden="true" size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default ServicesTable;
