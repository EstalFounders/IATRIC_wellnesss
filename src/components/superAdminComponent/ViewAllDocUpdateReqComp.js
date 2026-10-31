// ViewAllDocUpdateReqComp.js
// The super-admin review queue for doctor profile change requests
// (pages/superAdmin/viewAllDoctorUpdateRequest.js).
//
// The doctor panel's "Save" on a profile sends the changed fields to
// POST /api/registerDoc/doctorUpdateReq; this screen is the other end of that
// handshake. Every request is listed with the doctor it belongs to and the
// requested value next to what the doctor document holds right now, and the two
// decisions - PUT ?action=approve (which writes those fields onto the doctor
// document) and ?action=reject (which only closes the request) - are taken with a
// confirmation, a busy state and a refresh.
//
// The list is fetched here instead of read from the redux slice the header bell
// fills (store/slices/notificationSectionApiData.js). Relying on that slice meant
// a direct link to this page painted "No Request found" until the header happened
// to load after the first render - and the page's copy of the array was taken
// once, so an approval never showed up either. The header and the bell keep using
// the slice exactly as before. The doctor roster itself is shared redux state
// (`useDoctors`) - this page never keeps its own copy of it.
//
// Everything that is not a render decision (labels, the indexed-key grouping of
// `consultationType[0]`, value formatting, the before/after diff, the sort) lives
// in utils/doctorUpdateRequest.js.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import { api } from "../../constant";
import { useDoctors } from "../../customUtils/useDoctors";
import { doctorDisplayName } from "../../utils/doctorName";
import {
  buildDiff,
  changedFieldCount,
  countByStatus,
  findDoctorForRequest,
  formatDateTime,
  indexDoctorsById,
  isPending,
  nameInitials,
  requestStatus,
  sortRequests,
  statusLabel,
} from "../../utils/doctorUpdateRequest";
import { handleDoctReqApproveOrRejectService } from "./apiService/doctrReApproveOrRejectService";
import ConfirmModal from "./model/ConfirmModel";
import PanelPagination from "./ConsultationBooked/PanelPagination";
import styles from "./css/DoctorUpdateRequest.module.css";

const ROWS_PER_PAGE = 10;
// How many fields a card shows before "open the request to see all".
const PREVIEW_ROWS = 4;
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
  pending: "Nothing is waiting for a review - every request has been decided.",
  approved: "No request has been approved yet.",
  rejected: "No request has been rejected yet.",
  all: "No doctor profile change request has been submitted yet.",
};

/* ── Presentational pieces ───────────────────────────────────────────────── */

const DoctorAvatar = ({ doctor, name }) => {
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

// One "Field  old -> new" line of a card. `currentText` is empty both when the
// doctor has nothing stored there and when the doctor could not be found; the two
// are told apart by `hasCurrent`.
const DiffLine = ({ label, currentText, requestedText, changed, hasCurrent }) => (
  <li className={styles.fieldRow}>
    <span className={styles.fieldLabel}>{label}</span>
    {currentText ? (
      <span className={styles.fieldOld}>{currentText}</span>
    ) : (
      <em className={styles.fieldEmpty}>
        {hasCurrent ? "Not set" : "Unknown"}
      </em>
    )}
    <span className={styles.arrow} aria-hidden="true">
      →
    </span>
    <span className={styles.fieldNew}>{requestedText || "—"}</span>
    {changed ? <span className={styles.changedTag}>changed</span> : null}
  </li>
);

// The same comparison inside the modal, where each side gets its own column
// instead of the inline arrow.
const DiffRow = ({ label, currentText, requestedText, changed, hasCurrent }) => (
  <tr>
    <td className={styles.diffField}>{label}</td>
    <td>
      {currentText ? (
        <span className={styles.fieldOld}>{currentText}</span>
      ) : (
        <em className={styles.fieldEmpty}>
          {hasCurrent ? "Not set" : "Unknown"}
        </em>
      )}
    </td>
    <td className={changed ? styles.fieldNew : undefined}>
      {requestedText || "—"}
    </td>
  </tr>
);

/* ── The page ────────────────────────────────────────────────────────────── */

const ViewAllDocUpdateReqComp = () => {
  const [requests, setRequests] = useState([]);
  // Shared redux roster (cache first): avatars + the "current" column values.
  const { doctors, refetch: refetchDoctors } = useDoctors();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null); // { tone: "ok" | "error", text }
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null); // { id, action } while a PUT is in flight
  const [confirming, setConfirming] = useState(null); // { request, action }
  const [previewId, setPreviewId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      // The roster lives in redux; a forced refresh keeps the "current" column
      // in step with the latest saved document. Its failure must never hide the
      // queue itself, so it is fired alongside (never awaited as a hard step).
      const [requestRes] = await Promise.all([
        fetch(api.doctorUpdateRequest, { cache: "no-store" }),
        refetchDoctors(),
      ]);

      if (!requestRes.ok) {
        throw new Error(
          `The change requests could not be loaded (${requestRes.status}).`
        );
      }

      const requestList = await requestRes.json();
      if (!Array.isArray(requestList)) {
        throw new Error("The update-request API returned an unexpected response.");
      }
      setRequests(requestList);
    } catch (error) {
      setLoadError(error?.message || "The change requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [refetchDoctors]);

  useEffect(() => {
    load();
  }, [load]);

  const doctorsById = useMemo(() => indexDoctorsById(doctors), [doctors]);
  const counts = useMemo(() => countByStatus(requests), [requests]);

  // Pending first, newest first - then the tab narrows it down and the search box
  // matches the doctor's name (stored on the request or read back from the doctor
  // document) as well as the doctor and request ids.
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortRequests(requests).filter((request) => {
      if (tab !== "all" && requestStatus(request) !== tab) return false;
      if (!query) return true;

      const doctor = findDoctorForRequest(request, doctorsById);
      const haystack = [
        request?.name,
        doctor?.name,
        doctor?.email,
        request?._id,
        request?.doctorId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [requests, tab, search, doctorsById]);

  const totalPages = Math.max(1, Math.ceil(visible.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visible.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // A new filter is a new list: never leave the reviewer on page 4 of a one-page
  // result.
  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const previewRequest = useMemo(
    () => requests.find((request) => request._id === previewId) || null,
    [requests, previewId]
  );

  const runAction = async (request, action) => {
    setConfirming(null);
    setBusy({ id: request._id, action });

    const result = await handleDoctReqApproveOrRejectService(request._id, action);

    setBusy(null);

    if (!result.success) {
      setNotice({
        tone: "error",
        text:
          result.error || "The request could not be processed. Please try again.",
      });
      return;
    }

    setNotice({
      tone: "ok",
      text:
        action === "approve"
          ? "Approved. The doctor's profile now carries the requested values."
          : "Rejected. The doctor's profile was left untouched.",
    });

    // Re-read both the queue (new status) and the doctor documents, so the
    // "current" column shows the values an approval has just written.
    await load();
  };

  const rowBusy = (request) => Boolean(busy && busy.id === request._id);
  const actionBusy = (request, action) =>
    Boolean(busy && busy.id === request._id && busy.action === action);

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Doctor profile change requests</h1>
          <p className={styles.subtitle}>
            {counts.pending > 0
              ? `${counts.pending} request${
                  counts.pending === 1 ? "" : "s"
                } still waiting for a decision. Approving writes the requested values onto the doctor's profile; rejecting leaves the profile exactly as it is.`
              : "Every change request has been decided - the list below is the record of what was approved or rejected."}
          </p>
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
          <Link className={styles.linkBtn} href="/superAdmin/homepage">
            Back to dashboard
          </Link>
        </div>
      </header>

      {notice ? (
        <div
          className={`${styles.notice} ${
            notice.tone === "error" ? styles.noticeError : styles.noticeOk
          }`}
          role={notice.tone === "error" ? "alert" : "status"}
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

      <div className={styles.stats}>
        {[
          { key: "pending", label: "Awaiting review" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "all", label: "Total requests" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`${styles.stat} ${STAT_CLASS[stat.key] || ""}`}
          >
            <span className={styles.statValue}>{counts[stat.key]}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.toolbar} aria-label="Filter change requests">
        <input
          className={styles.search}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search doctor, email or request id"
          aria-label="Search change requests"
        />
        <div className={styles.tabs} role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((statusTab) => (
            <button
              key={statusTab.key}
              type="button"
              role="tab"
              aria-selected={tab === statusTab.key}
              className={`${styles.tab}${
                tab === statusTab.key ? ` ${styles.tabActive}` : ""
              }`}
              onClick={() => setTab(statusTab.key)}
            >
              {statusTab.label}
              <span className={styles.tabCount}>{counts[statusTab.key]}</span>
            </button>
          ))}
        </div>
        <span className={styles.spacer} />
        <span className={styles.resultCount}>
          {visible.length} of {counts.all} shown
        </span>
      </section>

      {loading && requests.length === 0 ? (
        <div className={styles.stateBox} role="status">
          Loading change requests…
        </div>
      ) : loadError ? (
        <div className={`${styles.stateBox} ${styles.stateError}`} role="alert">
          <p>{loadError}</p>
          <button type="button" className={styles.primary} onClick={load}>
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.stateBox} role="status">
          {search.trim()
            ? `No request matches “${search.trim()}”.`
            : EMPTY_MESSAGE[tab]}
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {pageRows.map((request) => {
              const doctor = findDoctorForRequest(request, doctorsById);
              const name =
                doctorDisplayName(doctor?.name || request?.name) ||
                "Unnamed doctor";
              const diff = buildDiff(request.updatedFields, doctor);
              const status = requestStatus(request);
              const decided = !isPending(request);
              const decidedAt =
                status === "approved"
                  ? request.approvedAt
                  : status === "rejected"
                  ? request.rejectedAt
                  : null;
              const decidedHint = decided
                ? `This request was already ${statusLabel(request).toLowerCase()}.`
                : undefined;

              return (
                <article
                  key={request._id}
                  className={`${styles.card}${
                    decided ? "" : ` ${styles.cardPending}`
                  }`}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.identity}>
                      <DoctorAvatar doctor={doctor} name={name} />
                      <div>
                        <h2 className={styles.docName}>{name}</h2>
                        <p className={styles.docMeta}>
                          Requested{" "}
                          {formatDateTime(request.requestedAt) ||
                            "on an unknown date"}{" "}
                          · {changedFieldCount(request)} field
                          {changedFieldCount(request) === 1 ? "" : "s"}
                          {doctor ? "" : " · doctor profile no longer exists"}
                          {decidedAt
                            ? ` · decided ${formatDateTime(decidedAt)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <StatusBadge request={request} />
                  </div>

                  {diff.length ? (
                    <>
                      <ul className={styles.diffPreview}>
                        {diff.slice(0, PREVIEW_ROWS).map(
                          ({ key, ...field }) => (
                            <DiffLine key={key} {...field} />
                          )
                        )}
                      </ul>
                      {diff.length > PREVIEW_ROWS ? (
                        <p className={styles.more}>
                          + {diff.length - PREVIEW_ROWS} more field
                          {diff.length - PREVIEW_ROWS === 1 ? "" : "s"} - open the
                          request to see every change.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className={styles.more}>
                      This request carries no field values.
                    </p>
                  )}

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => setPreviewId(request._id)}
                    >
                      Review {diff.length} field{diff.length === 1 ? "" : "s"}
                    </button>
                    {doctor ? (
                      <Link
                        className={styles.linkBtn}
                        href={`${PROFILE_ROUTE}?id=${doctor._id}`}
                      >
                        Open profile
                      </Link>
                    ) : null}
                    <span className={styles.actionSpacer} />
                    {rowBusy(request) ? (
                      <span className={styles.busyNote}>
                        {busy.action === "approve" ? "Approving…" : "Rejecting…"}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={styles.primary}
                      title={decidedHint}
                      disabled={decided || rowBusy(request)}
                      onClick={() => setConfirming({ request, action: "approve" })}
                    >
                      {actionBusy(request, "approve") ? "Approving…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      title={decidedHint}
                      disabled={decided || rowBusy(request)}
                      onClick={() => setConfirming({ request, action: "reject" })}
                    >
                      {actionBusy(request, "reject") ? "Rejecting…" : "Reject"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.paginationWrap}>
            <PanelPagination
              currentPage={currentPage}
              totalItems={visible.length}
              itemsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <Modal
        show={Boolean(previewRequest)}
        onHide={() => setPreviewId(null)}
        centered
        dialogClassName={styles.dialog}
        aria-labelledby="doctor-update-request-title"
      >
        {previewRequest
          ? (() => {
              const doctor = findDoctorForRequest(previewRequest, doctorsById);
              const name =
                doctorDisplayName(doctor?.name || previewRequest?.name) ||
                "Unnamed doctor";
              const diff = buildDiff(previewRequest.updatedFields, doctor);
              const decided = !isPending(previewRequest);
              const decidedHint = decided
                ? `This request was already ${statusLabel(
                    previewRequest
                  ).toLowerCase()}.`
                : undefined;

              return (
                <>
                  <Modal.Header closeButton className={styles.modalHeader}>
                    <div className={styles.modalDoctor}>
                      <DoctorAvatar doctor={doctor} name={name} />
                      <div>
                        <h2
                          className={styles.modalTitle}
                          id="doctor-update-request-title"
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
                    <p className={styles.tableCaption}>
                      {doctor
                        ? "Left: what the doctor's profile holds right now. Right: what this request asks to store."
                        : "The doctor document for this request could not be found, so only the requested values can be shown."}
                    </p>
                    <div className={styles.diffWrap}>
                      <table className={styles.diffTable}>
                        <thead>
                          <tr>
                            <th scope="col">Field</th>
                            <th scope="col">Current</th>
                            <th scope="col">Requested</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diff.length ? (
                            diff.map(({ key, ...field }) => (
                              <DiffRow key={key} {...field} />
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3}>
                                This request carries no field values.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Modal.Body>

                  <Modal.Footer className={styles.modalFoot}>
                    {rowBusy(previewRequest) ? (
                      <span className={styles.busyNote}>
                        {busy.action === "approve"
                          ? "Approving…"
                          : "Rejecting…"}
                      </span>
                    ) : null}
                    {doctor ? (
                      <Link
                        className={styles.linkBtn}
                        href={`${PROFILE_ROUTE}?id=${doctor._id}`}
                      >
                        Open full profile
                      </Link>
                    ) : null}
                    <span className={styles.actionSpacer} />
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => setPreviewId(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className={styles.primary}
                      title={decidedHint}
                      disabled={decided || rowBusy(previewRequest)}
                      onClick={() =>
                        setConfirming({
                          request: previewRequest,
                          action: "approve",
                        })
                      }
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      title={decidedHint}
                      disabled={decided || rowBusy(previewRequest)}
                      onClick={() =>
                        setConfirming({
                          request: previewRequest,
                          action: "reject",
                        })
                      }
                    >
                      Reject
                    </button>
                  </Modal.Footer>
                </>
              );
            })()
          : null}
      </Modal>

      <ConfirmModal
        show={Boolean(confirming)}
        title={
          confirming?.action === "approve"
            ? "Approve this change request?"
            : "Reject this change request?"
        }
        message={
          confirming
            ? confirming.action === "approve"
              ? `The requested values will be written onto ${
                  doctorDisplayName(confirming.request?.name) ||
                  "this doctor's profile"
                } immediately, and patients will see them from that moment. This cannot be undone from this screen.`
              : "The request will be closed and the doctor's profile will stay exactly as it is."
            : ""
        }
        confirmLabel={confirming?.action === "approve" ? "Approve" : "Reject"}
        confirmVariant={confirming?.action === "approve" ? "success" : "danger"}
        busy={Boolean(busy)}
        onClose={() => setConfirming(null)}
        onConfirm={() =>
          confirming && runAction(confirming.request, confirming.action)
        }
      />
    </div>
  );
};

export default ViewAllDocUpdateReqComp;
