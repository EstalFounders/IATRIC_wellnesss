// CustomerQueryComp.js - the super-admin "Customer query" page
// (pages/superAdmin/customerQuery.js).
//
// This page used to be a plain accordion list with three action buttons
// (Reply / Assign / Close) and a "Send Reply" box that had no backend behind
// them - pages/api/userQuery.js only implements GET, and the PUT/DELETE handlers
// are commented out. It has been rebuilt on the panel's own design system (the
// same hero, filter tiles, card, table and pagination vocabulary as
// ConsultationBooked / ServiceOffered) so the data is scannable and the actions
// are honest: every button here either changes what is on screen or opens a
// real mail/call link.
//
// Read-only on purpose. It gets its data with a single GET to api.userQuery and
// normalises it (the API may return a bare array or a { data } envelope). The
// tile/date filters live here because they feed the hero numbers; the actual
// search, paging and row rendering live in ./CustomerQuery/CustomerQueryTable.
//

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  MdClose,
  MdContentCopy,
  MdEmail,
  MdOutlineQueryStats,
  MdPhone,
  MdRefresh,
} from "react-icons/md";
import { api } from "../../constant";
import CustomerQueryTable from "./CustomerQuery/CustomerQueryTable";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  contactOf,
  dayKey,
  formatDateTime,
  formatDayKey,
  isRecent,
  isVisited,
  toText,
} from "./CustomerQuery/customerQueryUtils";
import styles from "./css/CustomerQueryComp.module.css";

// The filter tiles double as the hero's summary numbers, so both read from this
// one list.
const FILTERS = [
  {
    key: "total",
    label: "Total",
    hint: "Every query",
  },
  {
    key: "recent",
    label: "Last 7 days",
    hint: "Received this week",
    empty: "Nothing came in over the last 7 days.",
  },
  {
    key: CONTACT_EMAIL,
    label: "Email contact",
    hint: "Reachable by email",
    empty: "No query left an email address.",
  },
  {
    key: CONTACT_PHONE,
    label: "Phone contact",
    hint: "Shared a phone number",
    empty: "No query left a phone number.",
  },
];

const CustomerQueryComp = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("total");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadQueries = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch(api.userQuery);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      // The route returns a bare array today, but tolerate a { data } envelope
      // so a future change cannot silently blank the table.
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload && payload.data)
        ? payload.data
        : [];
      // The API returns insertion order, so sort newest-first here: the newest
      // query then tops the table and the hero can name it as "latest".
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setQueries(sorted);
    } catch (error) {
      console.error("Error fetching customer queries:", error);
      setQueries([]);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  // --- Date range filter (on createdAt). An empty From/To means "no bound". ---
  const rangedQueries = useMemo(() => {
    if (!fromDate && !toDate) return queries;
    return queries.filter((query) => {
      const key = dayKey(query.createdAt);
      if (!key) return false;
      if (fromDate && key < fromDate) return false;
      if (toDate && key > toDate) return false;
      return true;
    });
  }, [queries, fromDate, toDate]);

  // Tile numbers, computed off the date-ranged set so they read as "of what is
  // in the date range".
  const counts = useMemo(
    () => ({
      total: rangedQueries.length,
      recent: rangedQueries.filter((query) => isRecent(query.createdAt)).length,
      [CONTACT_EMAIL]: rangedQueries.filter(
        (query) => contactOf(query).type === CONTACT_EMAIL
      ).length,
      [CONTACT_PHONE]: rangedQueries.filter(
        (query) => contactOf(query).type === CONTACT_PHONE
      ).length,
    }),
    [rangedQueries]
  );

  const visibleQueries = useMemo(() => {
    if (activeFilter === "total") return rangedQueries;
    if (activeFilter === "recent") {
      return rangedQueries.filter((query) => isRecent(query.createdAt));
    }
    return rangedQueries.filter((query) => contactOf(query).type === activeFilter);
  }, [rangedQueries, activeFilter]);

  const activeMeta =
    FILTERS.find((filter) => filter.key === activeFilter) || FILTERS[0];

  const dateSummary = useMemo(() => {
    if (!fromDate && !toDate) return "";
    if (fromDate && toDate) {
      return `${formatDayKey(fromDate)} – ${formatDayKey(toDate)}`;
    }
    if (fromDate) return `from ${formatDayKey(fromDate)}`;
    return `up to ${formatDayKey(toDate)}`;
  }, [fromDate, toDate]);

  const setTodayRange = () => {
    const today = dayKey(new Date());
    setFromDate(today);
    setToDate(today);
  };

  const clearRange = () => {
    setFromDate("");
    setToDate("");
  };

  const openDetails = (query) => {
    setCopied(false);
    setSelected(query);
  };

  const closeDetails = () => setSelected(null);

  const copyMessage = async () => {
    const text = toText(selected && selected.message);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error("Could not copy to clipboard:", error);
    }
  };

  const selectedContact = selected ? contactOf(selected) : null;

  const heroSubtitle =
    queries.length === 0
      ? "Enquiries submitted through the website contact form."
      : `${queries.length} ${
          queries.length === 1 ? "query" : "queries"
        } received · latest ${formatDateTime(queries[0].createdAt)}`;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <MdOutlineQueryStats />
        </span>
        <div className={styles.heroInfo}>
          <p className={styles.heroEyebrow}>Super admin · Customer queries</p>
          <h1 className={styles.heroTitle}>Customer Queries</h1>
          <p className={styles.heroSubtitle}>{heroSubtitle}</p>
        </div>
        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={loadQueries}
            disabled={loading}
          >
            <MdRefresh aria-hidden="true" />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {failed ? (
        <div className={styles.errorBox} role="alert">
          <span>Could not load customer queries. Please try again.</span>
          <button
            type="button"
            className={styles.retry}
            onClick={loadQueries}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className={styles.tileGrid}>
        {FILTERS.map((filter) => {
          const isActive = filter.key === activeFilter;
          return (
            <button
              key={filter.key}
              type="button"
              className={`${styles.tile}${isActive ? ` ${styles.tileActive}` : ""}`}
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter.key)}
            >
              <span className={styles.tileLabel}>{filter.label}</span>
              <span className={styles.tileValue}>{counts[filter.key] ?? 0}</span>
              <span className={styles.tileHint}>{filter.hint}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.dateBar}>
        <span className={styles.dateBarLabel}>Received between</span>
        <label className={styles.dateField}>
          <span className={styles.dateFieldLabel}>From</span>
          <input
            type="date"
            className={styles.dateInput}
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label className={styles.dateField}>
          <span className={styles.dateFieldLabel}>To</span>
          <input
            type="date"
            className={styles.dateInput}
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>
        <button type="button" className={styles.ghostBtn} onClick={setTodayRange}>
          Today
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={clearRange}
          disabled={!fromDate && !toDate}
        >
          All dates
        </button>
        {dateSummary ? (
          <span className={styles.dateNote}>Showing {dateSummary}</span>
        ) : null}
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>{activeMeta.label}</h2>
          <span className={styles.cardCount}>
            {visibleQueries.length} shown
          </span>
        </div>

        <CustomerQueryTable
          queries={visibleQueries}
          loading={loading}
          emptyMessage={
            activeFilter === "total"
              ? "No customer queries yet."
              : activeMeta.empty || "No queries in this view."
          }
          onView={openDetails}
        />
      </section>

      <Modal
        show={Boolean(selected)}
        onHide={closeDetails}
        centered
        className={styles.modal}
        aria-labelledby="queryDetailsTitle"
      >
        {selected ? (
          <>
            <Modal.Header className={styles.modalHeader}>
              <Modal.Title
                id="queryDetailsTitle"
                className={styles.modalTitle}
              >
                {toText(selected.name) || "Customer query"}
              </Modal.Title>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeDetails}
                aria-label="Close"
              >
                <MdClose aria-hidden="true" />
              </button>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <dl className={styles.modalFields}>
                <div className={styles.modalField}>
                  <dt>Received</dt>
                  <dd>{formatDateTime(selected.createdAt)}</dd>
                </div>
                <div className={styles.modalField}>
                  <dt>Contact</dt>
                  <dd>
                    {selectedContact && selectedContact.type !== "none" ? (
                      <a
                        className={styles.contactLink}
                        href={selectedContact.href}
                      >
                        {selectedContact.value}
                      </a>
                    ) : (
                      <span className={styles.muted}>Not provided</span>
                    )}
                  </dd>
                </div>
                <div className={styles.modalField}>
                  <dt>Visited before</dt>
                  <dd>{isVisited(selected.visited_before) ? "Yes" : "No"}</dd>
                </div>
                <div className={styles.modalField}>
                  <dt>Query ID</dt>
                  <dd className={styles.modalId}>#{String(selected._id)}</dd>
                </div>
              </dl>

              <div className={styles.messageBlock}>
                <div className={styles.messageBlockHead}>
                  <span>Message</span>
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={copyMessage}
                    disabled={!toText(selected.message)}
                  >
                    <MdContentCopy aria-hidden="true" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className={styles.messageFull}>
                  {toText(selected.message) || "No message was provided."}
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer className={styles.modalFooter}>
              {selectedContact && selectedContact.type === CONTACT_EMAIL ? (
                <a
                  className={styles.primaryBtn}
                  href={selectedContact.href}
                >
                  <MdEmail aria-hidden="true" />
                  Reply by email
                </a>
              ) : null}
              {selectedContact && selectedContact.type === CONTACT_PHONE ? (
                <a
                  className={styles.primaryBtn}
                  href={selectedContact.href}
                >
                  <MdPhone aria-hidden="true" />
                  Call back
                </a>
              ) : null}
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={closeDetails}
              >
                Close
              </button>
            </Modal.Footer>
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default CustomerQueryComp;

