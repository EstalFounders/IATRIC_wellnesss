// ViewAllDocLeaveReqComp.js
// The super-admin leave-approval queue for every staff member under HealthPath
// (pages/superAdmin/viewAllDoctorLeaveRequest.js).
//
// A leave request is a LeaveRequest document (src/models/leaveRequest.js) raised
// from a panel's "Request leave" modal; this screen is the other end of it. Every
// request is listed with the requester it belongs to and the window they asked
// for (start -> end, and how many days that is), and the two decisions -
// PUT ?action=approve / ?action=reject - are taken with a confirmation, a busy
// state and a refresh.
//
// The list is fetched here instead of read from the redux slice the header bell
// fills (store/slices/notificationSectionApiData.js). Relying on that slice meant
// a direct link to this page painted "No Request found" until the header happened
// to load after the first render - and the page's copy of the array was taken
// once, so an approval never showed up either. The header and the bell keep using
// the slice exactly as before. The doctor roster itself is shared redux state
// (`useDoctors`) - this page never keeps its own copy of it.
//
// Everything that is not a render decision (labels, status grouping, the day
// count, the sorting) lives in utils/leaveRequest.js.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import { api } from "../../constant";
import { useDoctors } from "../../customUtils/useDoctors";
import { doctorDisplayName } from "../../utils/doctorName";
import {
  countByStatus,
  findDoctorForRequest,
  formatDate,
  formatDateTime,
  formatLeaveRange,
  indexDoctorsById,
  isPending,
  leaveDurationDays,
  nameInitials,
  requestStatus,
  sortRequests,
  statusLabel,
} from "../../utils/leaveRequest";
import { handleLeaveApproveOrRejectService } from "./apiService/doctorLeaveApproveOrRejectService";
import ConfirmModal from "./model/ConfirmModel";
import PanelPagination from "./ConsultationBooked/PanelPagination";
import styles from "./css/LeaveRequest.module.css";

const ROWS_PER_PAGE = 10;
const PROFILE_ROUTE = "/superAdmin/doctorProfile";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const BADGE_CLASS = {
  pending: styles.badgePending,
  approved: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

const STAT_CLASS = {
  pending: styles.statPending,
  approved: styles.statApproved,
  rejected: styles.statRejected,
};

const EMPTY_MESSAGE = {
  pending: "No leave request is waiting for a decision.",
  approved: "No leave request has been approved yet.",
  rejected: "No leave request has been rejected yet.",
  all: "No leave request has been submitted yet.",
};

/* ── Presentational pieces ───────────────────────────────────────────────── */

const PersonAvatar = ({ doctor, name }) => {
  if (doctor?.profilePictureUrl) {
    return (
      <img
        className={styles.avatar}
        src={doctor.profilePictureUrl}
        alt=""
        width={44}
        height={44}
      />
    );
  }

  return (
    <span className={styles.avatarFallback} aria-hidden="true">
      {nameInitials(name) || "DR"}
    </span>
  );
};

const StatusBadge = ({ request }) => {
  const status = requestStatus(request);
  return (
    <span className={`${styles.badge} ${BADGE_CLASS[status]}`}>
      {statusLabel(request)}
    </span>
  );
};

// One labelled value inside the card's / modal's details grid.
const Detail = ({ label, value, className, block }) => (
  <div className={block ? styles.modalBlock : styles.detail}>
    <span className={styles.detailLabel}>{label}</span>
    <span className={className || styles.detailValue}>{value}</span>
  </div>
);

// "3 days" / "1 day" / "" when a boundary is missing.
const durationText = (request) => {
  const days = leaveDurationDays(request);
  if (days === null) return "";
  return `${days} day${days === 1 ? "" : "s"}`;
};

/* ── The queue ───────────────────────────────────────────────────────────── */

const ViewAllDocLeaveReqComp = () => {
  const [requests, setRequests] = useState([]);
  // Shared redux roster (cache first): avatars + requester details.
  const { doctors, refetch: refetchDoctors } = useDoctors();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null); // { tone: "ok" | "error", text }
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null); // { id, action }
  const [confirming, setConfirming] = useState(null); // { request, action }
  const [previewId, setPreviewId] = useState(null);

  // Reads the live queue from the API. `addDoctor` is a best-effort enrichment
  // (avatar + email) served by the shared roster: it is refreshed alongside the
  // queue, and if it fails the queue still renders, just with initials.
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [leaveRes] = await Promise.all([
        fetch(api.leaveRequest),
        refetchDoctors(),
      ]);

      if (!leaveRes.ok) throw new Error("The server rejected the request.");
      const leaveData = await leaveRes.json();
      setRequests(Array.isArray(leaveData) ? leaveData : []);
    } catch (error) {
      console.error("Failed to load leave requests:", error);
      setLoadError("We could not load the leave requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [refetchDoctors]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => countByStatus(requests), [requests]);
  const doctorsById = useMemo(() => indexDoctorsById(doctors), [doctors]);

  const searched = useMemo(() => {
    const ordered = sortRequests(requests);
    const needle = search.trim().toLowerCase();
    if (!needle) return ordered;

    return ordered.filter((request) => {
      const doctor = findDoctorForRequest(request, doctorsById);
      const haystack = [
        request.name,
        request.reason,
        request.doctorId,
        request._id,
        doctor?.name,
        doctor?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [requests, doctorsById, search]);

  const visible = useMemo(
    () =>
      tab === "all"
        ? searched
        : searched.filter((request) => requestStatus(request) === tab),
    [searched, tab]
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visible.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  const previewRequest = useMemo(
    () => requests.find((request) => request._id === previewId) || null,
    [requests, previewId]
  );

  const rowBusy = (request) => busy?.id === request._id;

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTabChange = (key) => {
    setTab(key);
    setPage(1);
  };

  const runAction = async (request, action) => {
    setConfirming(null);
    setBusy({ id: request._id, action });

    const result = await handleLeaveApproveOrRejectService(request._id, action);
    setBusy(null);

    if (!result?.success) {
      setNotice({
        tone: "error",
        text: result?.error || "Could not update the request. Please try again.",
      });
      return;
    }

    const doctor = findDoctorForRequest(request, doctorsById);
    const name =
      doctorDisplayName(doctor?.name || request.name) || "The doctor's";
    const verb = action === "reject" ? "rejected" : "approved";
    setNotice({ tone: "ok", text: `${name} leave request ${verb}.` });

    await load();
  };

  const handleConfirm = () => {
    if (!confirming) return;
    runAction(confirming.request, confirming.action);
  };

  const openConfirm = (request, action) => {
    setPreviewId(null);
    setConfirming({ request, action });
  };

  const subtitle = counts.pending
    ? `${counts.pending} ${
        counts.pending === 1 ? "request is" : "requests are"
      } waiting for a decision.`
    : "Every leave request raised by the doctors, and every decision taken on one.";

  const firstLoad = loading && requests.length === 0;
  const hardError = Boolean(loadError) && requests.length === 0;
  const showQueue = !firstLoad && !hardError;

  const confirmName = confirming
    ? doctorDisplayName(
        findDoctorForRequest(confirming.request, doctorsById)?.name ||
          confirming.request.name
      ) || "this doctor"
    : "";


  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Leave requests</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.headActions}>
          <button
            type="button"
            className={styles.ghost}
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <Link href="/superAdmin" className={styles.linkBtn}>
            Back to panel
          </Link>
        </div>
      </header>

      {notice ? (
        <div
          className={`${styles.notice} ${
            notice.tone === "error" ? styles.noticeError : styles.noticeOk
          }`}
          role="status"
        >
          <span>{notice.text}</span>
          <button
            type="button"
            className={styles.noticeClose}
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      ) : null}

      {firstLoad ? (
        <div className={styles.stateBox}>Loading leave requests…</div>
      ) : null}

      {hardError ? (
        <div className={`${styles.stateBox} ${styles.stateError}`}>
          <p>{loadError}</p>
          <button type="button" className={styles.primary} onClick={load}>
            Try again
          </button>
        </div>
      ) : null}

      {showQueue ? (
        <>
          {loadError ? (
            <div className={`${styles.notice} ${styles.noticeError}`} role="status">
              <span>{loadError}</span>
            </div>
          ) : null}

          <section className={styles.stats} aria-label="Request totals">
            {STATUS_TABS.filter((item) => item.key !== "all").map((item) => (
              <div
                key={item.key}
                className={`${styles.stat} ${STAT_CLASS[item.key]}`}
              >
                <span className={styles.statValue}>{counts[item.key]}</span>
                <span className={styles.statLabel}>
                  {item.key === "pending" ? "Awaiting decision" : item.label}
                </span>
              </div>
            ))}
            <div className={styles.stat}>
              <span className={styles.statValue}>{counts.all}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </section>

          <div className={styles.toolbar}>
            <input
              type="search"
              className={styles.search}
              placeholder="Search by doctor, email or reason…"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              aria-label="Search leave requests"
            />
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Filter by status"
            >
              {STATUS_TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  className={`${styles.tab}${
                    tab === item.key ? ` ${styles.tabActive}` : ""
                  }`}
                  onClick={() => handleTabChange(item.key)}
                >
                  {item.label}
                  <span className={styles.tabCount}>{counts[item.key]}</span>
                </button>
              ))}
            </div>
            <span className={styles.spacer} />
            <span className={styles.resultCount}>
              {visible.length} {visible.length === 1 ? "request" : "requests"}
            </span>
          </div>


          {visible.length ? (
            <div className={styles.list}>
              {pageItems.map((request) => {
                const doctor = findDoctorForRequest(request, doctorsById);
                const name =
                  doctorDisplayName(doctor?.name || request.name) ||
                  "Unnamed doctor";
                const pending = isPending(request);
                const isBusy = rowBusy(request);
                const profileId = doctor?._id || request.doctorId;
                const decidedHint = pending
                  ? undefined
                  : `This request was already ${statusLabel(
                      request
                    ).toLowerCase()}.`;

                return (
                  <article
                    key={request._id}
                    className={`${styles.card}${
                      pending ? ` ${styles.cardPending}` : ""
                    }`}
                  >
                    <div className={styles.cardTop}>
                      <div className={styles.identity}>
                        <PersonAvatar doctor={doctor} name={name} />
                        <div>
                          <h2 className={styles.docName}>{name}</h2>
                          <p className={styles.docMeta}>
                            Requested{" "}
                            {formatDateTime(request.requestedAt) ||
                              "on an unknown date"}
                            {doctor?.email ? ` · ${doctor.email}` : ""}
                          </p>
                        </div>
                      </div>
                      <StatusBadge request={request} />
                    </div>

                    <div className={styles.details}>
                      <Detail
                        label="Start"
                        value={
                          formatDateTime(request.startTime) ||
                          formatDate(request.startTime) ||
                          "—"
                        }
                      />
                      <Detail
                        label="End"
                        value={
                          formatDateTime(request.endTime) ||
                          formatDate(request.endTime) ||
                          "—"
                        }
                      />
                      <Detail
                        label="Duration"
                        value={durationText(request) || "—"}
                        className={styles.duration}
                      />
                    </div>

                    <p
                      className={`${styles.reason}${
                        request.reason ? "" : ` ${styles.reasonEmpty}`
                      }`}
                    >
                      {request.reason || "No reason was given."}
                    </p>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.ghost}
                        onClick={() => setPreviewId(request._id)}
                      >
                        Review
                      </button>
                      {profileId ? (
                        <Link
                          href={`${PROFILE_ROUTE}/${profileId}`}
                          className={styles.linkBtn}
                        >
                          Open profile
                        </Link>
                      ) : null}
                      <span className={styles.actionSpacer} />
                      {isBusy ? (
                        <span className={styles.busyNote}>
                          {busy.action === "approve"
                            ? "Approving…"
                            : "Rejecting…"}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className={styles.primary}
                        title={decidedHint}
                        disabled={!pending || isBusy}
                        onClick={() =>
                          setConfirming({ request, action: "approve" })
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={styles.danger}
                        title={decidedHint}
                        disabled={!pending || isBusy}
                        onClick={() =>
                          setConfirming({ request, action: "reject" })
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.stateBox}>{EMPTY_MESSAGE[tab]}</div>
          )}

          <div className={styles.paginationWrap}>
            <PanelPagination
              currentPage={safePage}
              totalItems={visible.length}
              itemsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : null}


      <Modal
        show={Boolean(previewRequest)}
        onHide={() => setPreviewId(null)}
        centered
        dialogClassName={styles.dialog}
        aria-labelledby="doctor-leave-request-title"
      >
        {previewRequest
          ? (() => {
              const doctor = findDoctorForRequest(previewRequest, doctorsById);
              const name =
                doctorDisplayName(doctor?.name || previewRequest.name) ||
                "Unnamed doctor";
              const pending = isPending(previewRequest);
              const isBusy = rowBusy(previewRequest);
              const profileId = doctor?._id || previewRequest.doctorId;
              const decidedHint = pending
                ? undefined
                : `This request was already ${statusLabel(
                    previewRequest
                  ).toLowerCase()}.`;

              return (
                <>
                  <Modal.Header closeButton className={styles.modalHeader}>
                    <div className={styles.modalDoctor}>
                      <PersonAvatar doctor={doctor} name={name} />
                      <div>
                        <h2
                          className={styles.modalTitle}
                          id="doctor-leave-request-title"
                        >
                          {name}
                        </h2>
                        <p className={styles.modalMeta}>
                          Requested{" "}
                          {formatDateTime(previewRequest.requestedAt) ||
                            "on an unknown date"}
                          {previewRequest.approvedAt
                            ? ` · approved ${formatDateTime(
                                previewRequest.approvedAt
                              )}`
                            : ""}
                          {previewRequest.rejectedAt
                            ? ` · rejected ${formatDateTime(
                                previewRequest.rejectedAt
                              )}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <StatusBadge request={previewRequest} />
                  </Modal.Header>

                  <Modal.Body className={styles.modalBody}>
                    <div className={styles.modalGrid}>
                      <Detail
                        label="Leave starts"
                        value={
                          formatDateTime(previewRequest.startTime) ||
                          formatDate(previewRequest.startTime) ||
                          "—"
                        }
                      />
                      <Detail
                        label="Leave ends"
                        value={
                          formatDateTime(previewRequest.endTime) ||
                          formatDate(previewRequest.endTime) ||
                          "—"
                        }
                      />
                      <Detail
                        label="Duration"
                        value={durationText(previewRequest) || "—"}
                        className={styles.duration}
                      />
                      <Detail
                        label="Requested"
                        value={
                          formatDateTime(previewRequest.requestedAt) ||
                          "Unknown"
                        }
                      />
                      <Detail
                        label="Reason"
                        value={previewRequest.reason || "No reason was given."}
                        block
                      />
                    </div>
                  </Modal.Body>


                  <Modal.Footer className={styles.modalFoot}>
                    {isBusy ? (
                      <span className={styles.busyNote}>
                        {busy.action === "approve" ? "Approving…" : "Rejecting…"}
                      </span>
                    ) : null}
                    <span className={styles.actionSpacer} />
                    {profileId ? (
                      <Link
                        href={`${PROFILE_ROUTE}/${profileId}`}
                        className={styles.linkBtn}
                      >
                        Open profile
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => setPreviewId(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      title={decidedHint}
                      disabled={!pending || isBusy}
                      onClick={() => openConfirm(previewRequest, "reject")}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className={styles.primary}
                      title={decidedHint}
                      disabled={!pending || isBusy}
                      onClick={() => openConfirm(previewRequest, "approve")}
                    >
                      Approve
                    </button>
                  </Modal.Footer>
                </>
              );
            })()
          : null}
      </Modal>

      <ConfirmModal
        show={Boolean(confirming)}
        busy={Boolean(busy)}
        title={
          confirming?.action === "reject"
            ? "Reject this leave request?"
            : "Approve this leave request?"
        }
        message={
          confirming
            ? `${
                confirming.action === "reject" ? "Reject" : "Approve"
              } the leave request from ${confirmName} (${
                formatLeaveRange(confirming.request) || "dates not set"
              })?`
            : ""
        }
        confirmLabel={
          confirming?.action === "reject" ? "Reject leave" : "Approve leave"
        }
        confirmVariant={confirming?.action === "reject" ? "danger" : "success"}
        onClose={() => {
          if (!busy) setConfirming(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ViewAllDocLeaveReqComp;

