// CustomerQueryTable.js - the query table of the super-admin "Customer query"
// page.
//
// It replaced the old accordion list (a clickable <div> per query whose inline
// expand panel repeated exactly what the details dialog already showed) with a
// real <table> plus its own search box and a collapsing pagination bar. The page
// above owns the data and the tile/date filters; this component only searches,
// pages and paints the rows.
//
// A <colgroup> pins every column width and `overflow-wrap: anywhere` on the
// cells (set in the CSS module) keeps each column's minimum width at a single
// character, so no value can widen the table past its card.
import React, { useEffect, useMemo, useState } from "react";
import {
  CONTACT_EMAIL,
  contactOf,
  formatDateTime,
  getInitials,
  isVisited,
  searchText,
  toText,
} from "./customerQueryUtils";
import styles from "../css/CustomerQueryComp.module.css";

const ITEMS_PER_PAGE = 10;

// Column widths (px). Their sum is the table's min-width in the CSS module.
const COLUMNS = [
  { key: "customer", label: "Customer", width: 220 },
  { key: "contact", label: "Contact", width: 224 },
  { key: "received", label: "Received", width: 140 },
  { key: "message", label: "Message", width: 286 },
  { key: "visited", label: "Visited before", width: 110 },
  { key: "actions", label: "Actions", width: 100 },
];

// Every page as a button stops being readable past a handful of pages, so the
// middle is collapsed to a window: 1 … 5 6 [7] 8 9 … 42. The "gap-" string is
// both the "…between these two numbers" marker and the React key for it.
const WINDOW = 1;
const MAX_PLAIN_PAGES = 7;
const GAP_PREFIX = "gap-";

const buildPages = (currentPage, totalPages) => {
  if (totalPages <= MAX_PLAIN_PAGES) {
    return [...Array(totalPages).keys()].map((index) => index + 1);
  }

  const wanted = new Set([1, totalPages]);
  for (let page = currentPage - WINDOW; page <= currentPage + WINDOW; page += 1) {
    if (page > 1 && page < totalPages) wanted.add(page);
  }

  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1
      ? [`${GAP_PREFIX}${page}`, page]
      : [page]
  );
};


const CustomerQueryTable = ({
  queries = [],
  loading = false,
  emptyMessage = "No queries in this view.",
  onView,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return queries;
    return queries.filter((query) => searchText(query).includes(needle));
  }, [queries, search]);

  // A filter or a new search can leave the current page past the end of the
  // list, so every change starts again on page 1.
  useEffect(() => {
    setPage(1);
  }, [search, queries]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);
  const pages = buildPages(safePage, totalPages);

  return (
    <div>
      <div className={styles.searchRow}>
        <label className={styles.searchLabel} htmlFor="querySearch">
          Search
        </label>
        <input
          id="querySearch"
          type="search"
          className={styles.searchInput}
          placeholder="Name, email, phone or message"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span className={styles.countNote}>
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
          {search.trim() ? ` for “${search.trim()}”` : ""}
        </span>
      </div>

      {loading ? (
        <p className={styles.state}>Loading queries…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.state}>
          {search.trim() ? "No query matches that search." : emptyMessage}
        </p>
      ) : (
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
                  <th key={column.key} className={styles.th} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((query) => {
                const contact = contactOf(query);
                const message = toText(query.message);
                return (
                  <tr key={query._id}>
                    <td className={`${styles.td} ${styles.customerCol}`}>
                      <div className={styles.customer}>
                        <span className={styles.avatar} aria-hidden="true">
                          {getInitials(query.name)}
                        </span>
                        <span className={styles.customerInfo}>
                          <span className={styles.customerName}>
                            {toText(query.name) || "Unknown"}
                          </span>
                          <span className={styles.idLine}>
                            #{String(query._id).slice(-8)}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {contact.type === "none" ? (
                        <span className={styles.muted}>—</span>
                      ) : (
                        <span className={styles.contact}>
                          <a className={styles.contactLink} href={contact.href}>
                            {contact.value}
                          </a>
                          <span
                            className={`${styles.chip} ${
                              contact.type === CONTACT_EMAIL
                                ? styles.chipEmail
                                : styles.chipPhone
                            }`}
                          >
                            {contact.type === CONTACT_EMAIL ? "Email" : "Phone"}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.date}>
                        {formatDateTime(query.createdAt)}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.messageCol}`}>
                      {message ? (
                        <span className={styles.messageText}>{message}</span>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      {isVisited(query.visited_before) ? (
                        <span className={`${styles.chip} ${styles.chipVisited}`}>
                          Yes
                        </span>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <button
                        type="button"
                        className={styles.rowBtn}
                        onClick={() => onView(query)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav className={styles.pagination} aria-label="Pagination">
          <button
            type="button"
            className={styles.pageBtn}
            disabled={safePage === 1}
            onClick={() => setPage(Math.max(1, safePage - 1))}
          >
            ‹ Prev
          </button>

          {pages.map((entry) =>
            typeof entry === "string" ? (
              <span key={entry} className={styles.pageGap} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                className={`${styles.pageBtn}${
                  entry === safePage ? ` ${styles.pageBtnActive}` : ""
                }`}
                aria-current={entry === safePage ? "page" : undefined}
                onClick={() => setPage(entry)}
              >
                {entry}
              </button>
            )
          )}

          <button
            type="button"
            className={styles.pageBtn}
            disabled={safePage === totalPages}
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
          >
            Next ›
          </button>

          <span className={styles.pageInfo}>
            Page {safePage} of {totalPages}
          </span>
        </nav>
      ) : null}
    </div>
  );
};

export default CustomerQueryTable;

