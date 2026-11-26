// src/components/superAdminComponent/Feedback/FeedbackPanel.js
//
// "Consultation feedback" panel page (super-admin, and doctor-scoped).
//
// Reads GET /api/feedback/list, which does the filtering, pagination and the
// aggregate summary in Mongo - this component only renders. Every control
// (search, rating, doctor, page) maps to a query parameter, so the URL state is
// the server state and no numbers are added up in the browser.
//
// Visual language is the existing panel one: the page shell, hero, cards, tiles,
// table and pagination come from ConsultationBooked.module.css; the extra
// feedback-only pieces live in FeedbackPanel.module.css.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaRegStar, FaStar, FaSyncAlt } from "react-icons/fa";
import { api } from "../../../constant";
import { useDoctors } from "../../../customUtils/useDoctors";
import { FEEDBACK_RATING_LABELS } from "../../../utils/feedbackOptions";
import styles from "../css/ConsultationBooked.module.css";
import feedbackStyles from "../css/FeedbackPanel.module.css";
import PanelPagination from "../ConsultationBooked/PanelPagination";

const PAGE_SIZE = 10;
const STARS = [1, 2, 3, 4, 5];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

const StarRow = ({ value = 0 }) => (
  <span
    className={feedbackStyles.stars}
    role="img"
    aria-label={`${value} out of 5 stars`}
  >
    {STARS.map((star) => (
      <span
        key={star}
        className={star <= value ? feedbackStyles.starActive : ""}
        aria-hidden="true"
      >
        {star <= value ? <FaStar /> : <FaRegStar />}
      </span>
    ))}
  </span>
);

const FeedbackPanel = () => {
  // What the user is typing vs. what the API was last asked for - the search box
  // debounces so a five-letter name is one request, not five.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    count: 0,
    averageRating: 0,
    distribution: {},
    nps: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });
  const [isDoctorSession, setIsDoctorSession] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // The doctor roster comes from the shared redux cache (one request per visit).
  const { doctors } = useDoctors();

  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    const current = requestId.current + 1;
    requestId.current = current;
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) params.set("q", search);
    if (rating) params.set("rating", rating);
    if (doctorId) params.set("doctorId", doctorId);

    try {
      const response = await fetch(`${api.consultationFeedbackList}?${params}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load consultation feedback.");
      }

      // Ignore a stale response that lost the race against a newer filter.
      if (!mounted.current || current !== requestId.current) return;

      setRows(Array.isArray(data.feedback) ? data.feedback : []);
      setSummary(
        data.summary || { count: 0, averageRating: 0, distribution: {}, nps: 0 }
      );
      setPagination(
        data.pagination || { page: 1, pages: 1, total: 0, limit: PAGE_SIZE }
      );
      setIsDoctorSession(Boolean(data.scope?.isDoctorSession));
    } catch (loadError) {
      if (!mounted.current || current !== requestId.current) return;
      console.error("Feedback panel:", loadError);
      setError(loadError.message || "Could not load consultation feedback.");
      setRows([]);
    } finally {
      if (mounted.current && current === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [page, search, rating, doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  const distributionRows = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: summary.distribution?.[star] || 0,
      })),
    [summary.distribution]
  );

  const maxDistribution = Math.max(
    1,
    ...distributionRows.map((row) => row.count)
  );

  const hasFilters = Boolean(search || rating || doctorId);
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRating("");
    setDoctorId("");
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <FaStar />
        </span>
        <div className={styles.heroInfo}>
          <p className={styles.heroEyebrow}>Patient experience</p>
          <h1 className={styles.heroTitle}>Consultation feedback</h1>
          <p className={styles.heroSubtitle}>
            {isDoctorSession
              ? "Responses your patients shared after completed consultations."
              : "Every response patients shared after a completed consultation."}
          </p>
        </div>
        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={load}
            disabled={isLoading}
          >
            <FaSyncAlt aria-hidden="true" />{" "}
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </section>

      <section className={styles.tileGrid} aria-label="Feedback summary">
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Responses</span>
          <span className={styles.tileValue}>{summary.count}</span>
          <span className={styles.tileHint}>
            {hasFilters ? "Matching the current filters" : "All time"}
          </span>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Average rating</span>
          <span className={styles.tileValue}>
            {summary.count ? `${summary.averageRating} / 5` : "—"}
          </span>
          <span className={styles.tileHint}>
            {summary.count
              ? FEEDBACK_RATING_LABELS[Math.round(summary.averageRating)] ||
                "Mixed"
              : "No rating yet"}
          </span>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>NPS</span>
          <span className={styles.tileValue}>
            {summary.count ? summary.nps : "—"}
          </span>
          <span className={styles.tileHint}>
            4-5 star share minus 1-2 star share
          </span>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaStar aria-hidden="true" /> Rating summary
        </h2>
        <div className={feedbackStyles.summaryGrid}>
          <div>
            <p className={feedbackStyles.summaryColumnTitle}>Average score</p>
            <p className={feedbackStyles.bigRating}>
              {summary.count ? summary.averageRating : "—"}
              <span className={feedbackStyles.bigRatingTotal}>
                / 5 · {summary.count}{" "}
                {summary.count === 1 ? "response" : "responses"}
              </span>
            </p>
            <StarRow value={Math.round(summary.averageRating || 0)} />
            <p className={feedbackStyles.npsNote}>
              {summary.count
                ? `Net promoter score ${summary.nps}. Patients leaving 4-5 stars count as promoters, 1-2 stars as detractors.`
                : "No feedback yet - responses appear here as soon as a patient submits the form."}
            </p>
          </div>
          <div>
            <p className={feedbackStyles.summaryColumnTitle}>Distribution</p>
            <div className={feedbackStyles.distribution}>
              {distributionRows.map(({ star, count }) => (
                <div className={feedbackStyles.distributionRow} key={star}>
                  <span>{star} ★</span>
                  <span className={feedbackStyles.distributionTrack}>
                    <span
                      className={feedbackStyles.distributionBar}
                      style={{
                        width: `${Math.round((count / maxDistribution) * 100)}%`,
                      }}
                    />
                  </span>
                  <span className={feedbackStyles.distributionCount}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaStar aria-hidden="true" /> Patient responses
        </h2>

        <div className={feedbackStyles.filterRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search patient, comment or booking ID"
            aria-label="Search feedback"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <div className={feedbackStyles.filterField}>
            <label
              className={feedbackStyles.filterLabel}
              htmlFor="feedback-rating"
            >
              Rating
            </label>
            <select
              id="feedback-rating"
              className={styles.select}
              value={rating}
              onChange={(event) => {
                setRating(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} {star === 1 ? "star" : "stars"} ·{" "}
                  {FEEDBACK_RATING_LABELS[star]}
                </option>
              ))}
            </select>
          </div>

          {!isDoctorSession && (
            <div className={feedbackStyles.filterField}>
              <label
                className={feedbackStyles.filterLabel}
                htmlFor="feedback-doctor"
              >
                Doctor
              </label>
              <select
                id="feedback-doctor"
                className={styles.select}
                value={doctorId}
                onChange={(event) => {
                  setDoctorId(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All doctors</option>
                {(doctors || []).map((doctor) => {
                  const value = doctor._id || doctor.id;
                  if (!value) return null;
                  return (
                    <option key={value} value={value}>
                      {doctor.name || "Doctor"}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {hasFilters && (
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}

          {!isLoading && !error && (
            <span className={styles.countNote}>
              {pagination.total} {pagination.total === 1 ? "response" : "responses"}
            </span>
          )}
        </div>

        {error && (
          <div className={styles.errorBox} role="alert">
            <p>{error}</p>
            <button type="button" className={styles.retry} onClick={load}>
              Try again
            </button>
          </div>
        )}

        {!error && isLoading && (
          <div className={styles.loading}>Loading feedback…</div>
        )}

        {!error && !isLoading && rows.length === 0 && (
          <div className={styles.empty}>
            {hasFilters
              ? "No feedback matches these filters yet."
              : "No consultation feedback yet. Patients see the form right after a consultation is closed."}
          </div>
        )}

        {!error && !isLoading && rows.length > 0 && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} scope="col">
                      Patient
                    </th>
                    <th className={styles.th} scope="col">
                      Doctor
                    </th>
                    <th className={styles.th} scope="col">
                      Rating
                    </th>
                    <th className={styles.th} scope="col">
                      Liked
                    </th>
                    <th className={styles.th} scope="col">
                      Comment
                    </th>
                    <th className={styles.th} scope="col">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.td}>
                        <span className={styles.name}>{row.patientName}</span>
                        <span className={styles.contact}>
                          {row.patientMobile || "Mobile not shared"}
                        </span>
                        <span className={styles.contact}>
                          Booking #{row.shortBookingId}
                        </span>
                      </td>
                      <td className={styles.td}>
                        {row.doctor?.name ? (
                          <>
                            <span className={styles.name}>{row.doctor.name}</span>
                            {row.doctor.expertise ? (
                              <span className={styles.contact}>
                                {row.doctor.expertise}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <span className={feedbackStyles.emptyCell}>
                            Doctor removed
                          </span>
                        )}
                      </td>
                      <td className={styles.td}>
                        {row.overallRating ? (
                          <span className={feedbackStyles.ratingCell}>
                            <StarRow value={row.overallRating} />
                            <span className={feedbackStyles.ratingValue}>
                              {row.overallRating}/5
                            </span>
                          </span>
                        ) : (
                          <span className={feedbackStyles.emptyCell}>
                            Not rated
                          </span>
                        )}
                        {row.ratings?.doctorCommunication ||
                        row.ratings?.consultationHelpfulness ||
                        row.ratings?.callQuality ||
                        row.ratings?.bookingProcess ? (
                          <span className={styles.contact}>
                            Communication {row.ratings.doctorCommunication || "—"}
                            {" · "}
                            Advice {row.ratings.consultationHelpfulness || "—"}
                            {" · "}
                            Call {row.ratings.callQuality || "—"}
                            {" · "}
                            Booking {row.ratings.bookingProcess || "—"}
                          </span>
                        ) : null}
                      </td>
                      <td className={styles.td}>
                        {row.tags?.length ? (
                          <span className={feedbackStyles.chips}>
                            {row.tags.map((tag) => (
                              <span className={feedbackStyles.chip} key={tag}>
                                {tag}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className={feedbackStyles.emptyCell}>—</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        {row.comment ? (
                          <span
                            className={feedbackStyles.comment}
                            title={row.comment}
                          >
                            {row.comment}
                          </span>
                        ) : (
                          <span
                            className={`${feedbackStyles.comment} ${feedbackStyles.commentMuted}`}
                          >
                            No comment
                          </span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <span className={styles.dateLine}>
                          {formatDate(row.submittedAt)}
                        </span>
                        {row.revision > 1 && (
                          <span className={styles.contact}>
                            Edited · revision {row.revision}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PanelPagination
              currentPage={pagination.page}
              totalItems={pagination.total}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default FeedbackPanel;

