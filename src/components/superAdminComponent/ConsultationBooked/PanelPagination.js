// PanelPagination.js - the pagination bar of the two tables on the super-admin
// "Consultation booked" page.
//
// It replaces the shared `CustomPagination` helper (src/helper.js) *on these two
// tables only*. That helper renders a react-bootstrap <Pagination>, whose
// `.page-link` boxes are painted blue (#5496ff) with a heavy drop shadow by
// public/css/style.css - the only blue on an otherwise green/yellow page.
//
// This bar copies the pagination already used by /superAdmin/customerQuery
// (CustomerQueryComp.js + css/CustomerQueryComp.module.css): ‹ Prev, the page
// numbers, Next ›, then "Page x of y", in the panel's own vocabulary.
//
// The shared helper is left untouched because eight other panel pages still
// render it.
import React from "react";
import styles from "../css/ConsultationBooked.module.css";

// Every page as a button stops being readable past a handful of pages, so the
// middle is collapsed to a window: 1 … 5 6 [7] 8 9 … 42
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

  // The sentinel marks "… between these two numbers" and doubles as the React
  // key for the ellipsis.
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1
      ? [`${GAP_PREFIX}${page}`, page]
      : [page]
  );
};

const PanelPagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.pageBtn}
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        ‹ Prev
      </button>

      {pages.map((page) =>
        typeof page === "string" ? (
          <span key={page} className={styles.pageGap} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`${styles.pageBtn}${
              page === currentPage ? ` ${styles.pageBtnActive}` : ""
            }`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className={styles.pageBtn}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next ›
      </button>

      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
};

export default PanelPagination;
