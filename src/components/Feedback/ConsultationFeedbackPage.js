// src/components/Feedback/ConsultationFeedbackPage.js
//
// The patient-facing post-consultation feedback form.
//
// Opened from the "Share feedback" link we send/print after a consultation:
//   /feedback?bookingId=<appointment _id | meetingId>
// The same component also accepts a public `meetingId`, so a consultation-room
// URL can be reused.
//
// Flow: GET the consultation -> if it is not over yet (or was cancelled) show a
// locked state; if feedback exists show the thank-you card with an "edit" path;
// otherwise render the form. Submitting POSTs once (the API holds a unique index
// on appointmentId); editing PUTs the same document.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaRegStar,
  FaStar,
} from "react-icons/fa";
import { api } from "../../constant";
import {
  FEEDBACK_RATING_LABELS,
  FEEDBACK_SUB_RATINGS,
  FEEDBACK_TAGS,
  MAX_COMMENT_LENGTH,
  MAX_FEEDBACK_TAGS,
} from "../../utils/feedbackOptions";
import styles from "./ConsultationFeedback.module.css";

const STAR_VALUES = [1, 2, 3, 4, 5];

const EMPTY_FORM = {
  overallRating: 0,
  ratings: FEEDBACK_SUB_RATINGS.reduce((acc, { key }) => {
    acc[key] = 0;
    return acc;
  }, {}),
  tags: [],
  comment: "",
};

/** Consultation date/time in IST - the clinic's own timezone everywhere else. */
const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
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

const initialsOf = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const formFromFeedback = (feedback) => {
  if (!feedback) return { ...EMPTY_FORM };
  return {
    overallRating: feedback.overallRating || 0,
    ratings: FEEDBACK_SUB_RATINGS.reduce((acc, { key }) => {
      acc[key] = feedback.ratings?.[key] || 0;
      return acc;
    }, {}),
    tags: Array.isArray(feedback.tags) ? [...feedback.tags] : [],
    comment: feedback.comment || "",
  };
};

/**
 * Accessible star group: a WAI-ARIA radiogroup with roving tabindex and arrow
 * keys, so it is usable without a mouse. Clicking the selected star clears it
 * when `allowClear` (the sub-ratings and the overall score are all optional once
 * the patient has picked one).
 */
const StarRating = ({
  value = 0,
  onChange,
  label,
  describedBy,
  size = "large",
}) => {
  const handleKeyDown = (event, star) => {
    const moves = {
      ArrowRight: Math.min(5, star + 1),
      ArrowUp: Math.min(5, star + 1),
      ArrowLeft: Math.max(1, star - 1),
      ArrowDown: Math.max(1, star - 1),
    };
    if (moves[event.key] !== undefined) {
      event.preventDefault();
      onChange(moves[event.key]);
    }
  };

  return (
    <div
      className={`${styles.stars} ${
        size === "large" ? styles.starsLarge : styles.starsSmall
      }`}
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {STAR_VALUES.map((star) => {
        const active = star <= value;
        const isTabStop = value === star || (value === 0 && star === 1);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} of 5 - ${FEEDBACK_RATING_LABELS[star]}`}
            tabIndex={isTabStop ? 0 : -1}
            className={`${styles.star} ${active ? styles.starActive : ""}`}
            onClick={() => onChange(value === star ? 0 : star)}
            onKeyDown={(event) => handleKeyDown(event, star)}
          >
            {active ? <FaStar aria-hidden="true" /> : <FaRegStar aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
};

const ConsultationSummary = ({ consultation }) => {
  if (!consultation) return null;
  const doctorName = consultation.doctor?.name || "IATRIC doctor";
  const metaParts = [
    consultation.doctor?.expertise,
    consultation.consultationType,
    formatDateTime(consultation.appointmentTime),
  ].filter(Boolean);

  return (
    <div className={styles.summary}>
      <span className={styles.avatar} aria-hidden="true">
        {consultation.doctor?.profilePictureUrl ? (
          // Plain <img>: the avatar comes from a remote/legacy host that is not
          // in next.config images domains, and it is decorative here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.avatarImage}
            src={consultation.doctor.profilePictureUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          initialsOf(doctorName) || "IA"
        )}
      </span>
      <div className={styles.summaryBody}>
        <p className={styles.summaryName}>{doctorName}</p>
        <p className={styles.summaryMeta}>{metaParts.join(" · ")}</p>
        <p className={styles.summaryMeta}>
          Booking ID #{consultation.shortId}
          {consultation.patientName ? ` · ${consultation.patientName}` : ""}
        </p>
      </div>
      {consultation.prescriptionShared ? (
        <span className={styles.summaryTag}>Completed</span>
      ) : null}
    </div>
  );
};

const ReadOnlyStars = ({ value }) => (
  <span
    className={`${styles.stars} ${styles.starsSmall} ${styles.starActive}`}
    role="img"
    aria-label={`${value} out of 5 stars`}
  >
    {STAR_VALUES.map((star) => (
      <span key={star} className={styles.star} aria-hidden="true">
        {star <= value ? <FaStar /> : <FaRegStar />}
      </span>
    ))}
  </span>
);

const ThankYouState = ({ feedback, justSubmitted, onEdit }) => {
  const submittedOn = formatDateTime(feedback.submittedAt);
  return (
    <div className={styles.state}>
      <span className={styles.stateIcon} aria-hidden="true">
        <FaCheckCircle />
      </span>
      <h3 className={styles.stateTitle}>
        {justSubmitted
          ? "Thank you for your feedback"
          : "You have already shared feedback"}
      </h3>
      <p className={styles.stateText}>
        {justSubmitted
          ? "Your response has been recorded and goes straight to our care team. It helps us keep improving every consultation."
          : "We already have your response for this consultation. You can update it any time using the button below."}
      </p>

      {feedback.overallRating ? (
        <ReadOnlyStars value={feedback.overallRating} />
      ) : null}
      <p className={styles.submittedMeta}>
        {feedback.revision > 1 ? "Updated" : "Submitted"}
        {submittedOn ? ` on ${submittedOn}` : ""}
        {feedback.overallRating
          ? ` · Rating ${feedback.overallRating}/5 (${
              FEEDBACK_RATING_LABELS[feedback.overallRating]
            })`
          : " · No overall rating given"}
      </p>

      {feedback.tags?.length ? (
        <div className={styles.chips} aria-label="What you highlighted">
          {feedback.tags.map((tag) => (
            <span key={tag} className={`${styles.chip} ${styles.chipActive}`}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {feedback.comment ? (
        <p className={styles.submittedComment}>{feedback.comment}</p>
      ) : null}

      <div className={styles.stateActions}>
        <button type="button" className={styles.primaryButton} onClick={onEdit}>
          Edit my feedback
        </button>
        <Link href="/" className={styles.ghostButton}>
          Back to home
        </Link>
      </div>
    </div>
  );
};

const ConsultationFeedbackPage = ({ initialBookingId = "" }) => {
  const router = useRouter();
  const cardRef = useRef(null);

  // Either the query string (the normal path) or a prop (used when the page is
  // embedded/tested) supplies the booking; both accept _id and meetingId.
  const bookingId = useMemo(() => {
    const fromQuery =
      typeof router.query.bookingId === "string"
        ? router.query.bookingId.trim()
        : "";
    return fromQuery || initialBookingId;
  }, [router.query.bookingId, initialBookingId]);

  // loading | ready | error | missing
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [consultation, setConsultation] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState(formFromFeedback(null));
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const load = useCallback(async () => {
    if (!bookingId) {
      setStatus("missing");
      return;
    }

    setStatus("loading");
    setLoadError("");

    try {
      const response = await fetch(
        `${api.consultationFeedback}?bookingId=${encodeURIComponent(bookingId)}`
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "We could not load this consultation. Please try again."
        );
      }

      setConsultation(data.consultation || null);
      setCanSubmit(Boolean(data.eligibility?.canSubmit));
      setEligibilityMessage(data.eligibility?.message || "");
      setFeedback(data.feedback || null);
      setForm(formFromFeedback(data.feedback));
      setIsEditing(false);
      setJustSubmitted(false);
      setStatus("ready");
    } catch (error) {
      setLoadError(
        error.message || "We could not load this consultation. Please try again."
      );
      setStatus("error");
    }
  }, [bookingId]);

  useEffect(() => {
    // Wait for the query string, otherwise a client-side navigation would read
    // `bookingId` as empty and flash the "missing link" state.
    if (!router.isReady && !initialBookingId) return;
    load();
  }, [router.isReady, initialBookingId, load]);

  const scrollToCard = () => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    cardRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const updateRating = (key, value) =>
    setForm((current) => ({
      ...current,
      ratings: { ...current.ratings, [key]: value },
    }));

  const toggleTag = (tag) =>
    setForm((current) => {
      const selected = current.tags.includes(tag);
      if (selected) {
        return { ...current, tags: current.tags.filter((item) => item !== tag) };
      }
      if (current.tags.length >= MAX_FEEDBACK_TAGS) return current;
      return { ...current, tags: [...current.tags, tag] };
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    setSubmitting(true);
    const editingExisting = Boolean(feedback);

    try {
      const response = await fetch(api.consultationFeedback, {
        method: editingExisting ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          ...(editingExisting ? { feedbackId: feedback.id } : {}),
          overallRating: form.overallRating,
          ratings: form.ratings,
          tags: form.tags,
          comment: form.comment,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Someone already submitted from another tab / an earlier visit: show
        // the thank-you card instead of an error the patient cannot act on.
        if (data.code === "FEEDBACK_EXISTS" && data.feedback) {
          setFeedback(data.feedback);
          setForm(formFromFeedback(data.feedback));
          setIsEditing(false);
          setJustSubmitted(false);
          return;
        }
        throw new Error(
          data.message || "We could not save your feedback. Please try again."
        );
      }

      setFeedback(data.feedback || null);
      setForm(formFromFeedback(data.feedback));
      setIsEditing(false);
      setJustSubmitted(true);
      scrollToCard();
    } catch (error) {
      setFormError(
        error.message || "We could not save your feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = () => {
    setForm(formFromFeedback(feedback));
    setIsEditing(true);
    setJustSubmitted(false);
    setFormError("");
    scrollToCard();
  };

  const commentLength = form.comment.length;
  const commentAtLimit = commentLength >= MAX_COMMENT_LENGTH;
  const showForm = status === "ready" && canSubmit && (!feedback || isEditing);

  return (
    <section className={styles.page} aria-busy={status === "loading"}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Consultation feedback</span>
          <h2 className={styles.title}>How was your consultation?</h2>
          <p className={styles.subtitle}>
            Your feedback takes less than a minute and helps our doctors and care
            team serve every patient better.
          </p>
        </header>

        <div className={styles.card} ref={cardRef}>
          {status === "loading" ? (
            <div className={styles.skeletonCard} aria-hidden="true">
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              <div className={styles.skeletonBlock} />
            </div>
          ) : null}

          {status === "missing" ? (
            <div className={styles.state}>
              <span
                className={`${styles.stateIcon} ${styles.stateIconMuted}`}
                aria-hidden="true"
              >
                <FaExclamationCircle />
              </span>
              <h3 className={styles.stateTitle}>This link is missing a booking</h3>
              <p className={styles.stateText}>
                Open the feedback link from your consultation confirmation message
                or WhatsApp reminder - it carries the booking reference we need.
              </p>
              <div className={styles.stateActions}>
                <Link href="/appointment" className={styles.ghostButton}>
                  Book a consultation
                </Link>
                <Link href="/" className={styles.ghostButton}>
                  Back to home
                </Link>
              </div>
            </div>
          ) : null}

          {status === "error" ? (
            <div className={styles.state}>
              <span
                className={`${styles.stateIcon} ${styles.stateIconMuted}`}
                aria-hidden="true"
              >
                <FaExclamationCircle />
              </span>
              <h3 className={styles.stateTitle}>
                We could not load this consultation
              </h3>
              <p className={styles.stateText}>{loadError}</p>
              <div className={styles.stateActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={load}
                >
                  Try again
                </button>
                <Link href="/" className={styles.ghostButton}>
                  Back to home
                </Link>
              </div>
            </div>
          ) : null}

          {status === "ready" ? (
            <>
              <ConsultationSummary consultation={consultation} />

              {!canSubmit ? (
                <div className={styles.state}>
                  <span
                    className={`${styles.stateIcon} ${styles.stateIconMuted}`}
                    aria-hidden="true"
                  >
                    <FaExclamationCircle />
                  </span>
                  <h3 className={styles.stateTitle}>Feedback is not open yet</h3>
                  <p className={styles.stateText}>
                    {eligibilityMessage ||
                      "Feedback opens once your consultation is completed."}
                  </p>
                  <div className={styles.stateActions}>
                    <Link href="/" className={styles.ghostButton}>
                      Back to home
                    </Link>
                  </div>
                </div>
              ) : null}

              {canSubmit && feedback && !isEditing ? (
                <ThankYouState
                  feedback={feedback}
                  justSubmitted={justSubmitted}
                  onEdit={startEditing}
                />
              ) : null}

              {showForm ? (
                <form className={styles.body} onSubmit={handleSubmit} noValidate>
                  {/* Overall rating */}
                  <div className={styles.block}>
                    <div className={styles.blockHead}>
                      <span className={styles.label}>Overall experience</span>
                      <span className={styles.optional}>
                        {form.overallRating
                          ? FEEDBACK_RATING_LABELS[form.overallRating]
                          : "Optional"}
                      </span>
                    </div>
                    <StarRating
                      value={form.overallRating}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          overallRating: value,
                        }))
                      }
                      label="Overall experience rating"
                      describedBy="overall-rating-hint"
                    />
                    <p className={styles.hint} id="overall-rating-hint">
                      Tap a star to rate your consultation, then add anything that
                      would help us improve. Nothing on this form is required - send
                      whichever parts you want.
                    </p>
                  </div>

                  {/* Optional sub-ratings */}
                  <div className={styles.block}>
                    <div className={styles.blockHead}>
                      <span className={styles.label}>Rate the details</span>
                      <span className={styles.optional}>Optional</span>
                    </div>
                    <div className={styles.subRatings}>
                      {FEEDBACK_SUB_RATINGS.map(({ key, label }) => (
                        <div className={styles.subRatingRow} key={key}>
                          <span className={styles.subRatingLabel}>{label}</span>
                          <StarRating
                            value={form.ratings[key] || 0}
                            onChange={(value) => updateRating(key, value)}
                            label={label}
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick tags */}
                  <div className={styles.block}>
                    <div className={styles.blockHead}>
                      <span className={styles.label}>What stood out?</span>
                      <span className={styles.optional}>
                        Pick up to {MAX_FEEDBACK_TAGS}
                      </span>
                    </div>
                    <div className={styles.chips}>
                      {FEEDBACK_TAGS.map((tag) => {
                        const selected = form.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            aria-pressed={selected}
                            className={`${styles.chip} ${
                              selected ? styles.chipActive : ""
                            }`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Free-text comment */}
                  <div className={styles.block}>
                    <div className={styles.blockHead}>
                      <label className={styles.label} htmlFor="feedback-comment">
                        Anything else you would like to share?
                      </label>
                      <span className={styles.optional}>Optional</span>
                    </div>
                    <textarea
                      id="feedback-comment"
                      className={styles.textarea}
                      value={form.comment}
                      rows={4}
                      maxLength={MAX_COMMENT_LENGTH}
                      placeholder="What went well? What could we do better?"
                      aria-describedby="feedback-comment-counter"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                    />
                    <span
                      id="feedback-comment-counter"
                      className={`${styles.counter} ${
                        commentAtLimit ? styles.counterFull : ""
                      }`}
                    >
                      {commentLength}/{MAX_COMMENT_LENGTH}
                    </span>
                  </div>

                  {formError ? (
                    <p className={styles.errorBanner} role="alert">
                      {formError}
                    </p>
                  ) : null}

                  <div className={styles.actions}>
                    <p className={styles.privacyNote}>
                      Your feedback is shared with the doctor and our care team
                      only. It never changes your booking or prescription.
                    </p>
                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Saving…"
                        : feedback
                        ? "Update feedback"
                        : "Submit feedback"}
                    </button>
                  </div>
                </form>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ConsultationFeedbackPage;
