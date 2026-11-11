import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { api, booking_btn_txt, imageBlurDataUrl } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useDoctors } from "../../customUtils/useDoctors";
import { doctorDisplayName } from "../../utils/doctorName";
import {
  formatDegreeLabel,
  formatEducationTrainingLabel,
} from "../../customUtils/educationTraining";
import { setDoctorInfo } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import styles from "./HealthPathTeam.module.css";

/**
 * Team-card avatar. A picture is rendered with `next/image`; a stored object that
 * cannot be shown (a document uploaded into the picture slot on an old record, or
 * a deleted object) falls back to the initial instead of a broken image.
 */
const MemberAvatar = ({ member }) => {
  const [failed, setFailed] = useState(false);

  if (member.profilePictureUrl && !failed) {
    return (
      <Image
        placeholder="blur"
        blurDataURL={imageBlurDataUrl}
        src={member.profilePictureUrl}
        alt={member.name}
        fill
        draggable={false}
        sizes="(max-width: 575px) 92px, (max-width: 991px) 104px, 120px"
        style={{
          objectFit: "cover",
          objectPosition: "center 20%",
        }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={styles.avatarFallback}>
      {(member.name || "?").charAt(0).toUpperCase()}
    </span>
  );
};

// Horizontal speed of the strip. Constant in px/second (not "one pass per N
// seconds"), so the strip moves at the same pace whether the roster has 3 or 40
// people - that is what makes it read as a continuous, calm ticker.
const MARQUEE_SPEED = 42;

// Dragging further than this means "the visitor wanted to scroll", not "the
// visitor tapped Book Now" - the click that follows such a drag is swallowed.
const DRAG_CLICK_THRESHOLD = 6;

/** Collapse stray whitespace so a stored "name   " cannot shift a card. */
const oneLine = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/** Keep `value` inside [0, max) - used to wrap the marquee offset. */
const wrapOffset = (value, max) => (max > 0 ? ((value % max) + max) % max : 0);

/**
 * "Service offered" line for a card.
 *
 * Doctors carry an array of specialities (`serviceOffered`) plus an optional
 * free-text `expertise`; nursing staff carry a single `jobTitle`.
 */
const formatServiceOffered = (member) => {
  if (member.type === "doctor") {
    const offered = Array.isArray(member.serviceOffered)
      ? member.serviceOffered.filter(Boolean).join(", ")
      : "";
    return oneLine(offered || member.expertise || "Doctor Consultation");
  }
  return oneLine(member.jobTitle || "Nursing Care");
};

/**
 * Degree line for a card.
 *
 * Doctors keep their degrees in the repeatable `educationTraining` field (the
 * standalone `degree` field no longer exists), so the card prints just the
 * credentials ("MBBS, MD") in one short line - the full entry, university
 * included, is what `degreeTitle` puts in the tooltip. Nursing staff have no
 * degrees on file, and every card still renders the slot (with a nbsp) so the
 * fixed card box never reflows.
 */
const formatDegree = (member) => {
  if (member.type !== "doctor") return { label: "", title: "" };
  return {
    label: oneLine(formatDegreeLabel(member.educationTraining)),
    title: oneLine(formatEducationTrainingLabel(member.educationTraining)),
  };
};

/**
 * The degree line of a card.
 *
 * Collapsed it is exactly one line: the label is ellipsised and the "More"
 * toggle sits at the end of that same line, so a long degree can never change
 * the card's height. "More" is only rendered when the label really does not fit
 * (measured the way `DoctorCard` measures its education line); clicking it grows
 * the card to show the full entry and turns the label into "Less".
 *
 * The toggle lives inside the card's profile link - the whole card is one link -
 * so its click is default-prevented and stopped: without that it would open the
 * profile instead of expanding the text.
 */
const TeamCardDegree = ({ member, expanded, onToggle, inert = false }) => {
  const textRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);

  // Measured only while collapsed and while the toggle is still absent: the
  // toggle takes width away from the label, so measuring with it on screen would
  // let the two states flip each other. Re-measured on resize because the card
  // (and therefore the available width) changes with the breakpoint.
  useEffect(() => {
    if (expanded || overflowing) return undefined;

    const element = textRef.current;
    if (!element) return undefined;

    const measure = () =>
      setOverflowing(element.scrollWidth > element.clientWidth + 1);

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [expanded, overflowing, member.degreeLabel]);

  return (
    <div
      className={`${styles.degreeRow} ${
        expanded ? styles.degreeRowExpanded : ""
      }`}
    >
      <div
        ref={textRef}
        className={`${styles.degree} ${expanded ? styles.degreeExpanded : ""}`}
        title={expanded ? undefined : member.degreeTitle || undefined}
      >
        {member.degreeLabel || "\u00A0"}
      </div>
      {(overflowing || expanded) && (
        <button
          type="button"
          className={styles.degreeToggle}
          aria-expanded={expanded}
          // Copies after the first are aria-hidden and out of the tab order.
          tabIndex={inert ? -1 : undefined}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggle(member.key);
          }}
        >
          {expanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

/**
 * HealthPathTeam
 *
 * One horizontal, continuously auto-scrolling strip of team cards that merges
 * the doctor roster (`GET /api/addDoctor`) with the nursing staff list
 * (`GET /api/staff`).
 *
 * The strip is driven by `requestAnimationFrame`, not a CSS keyframe: the track
 * holds N identical copies of the list and is translated by exactly one
 * copy-width before wrapping, so the loop restarts on the identical pixel (no
 * jump) at a constant px/second speed - whatever the number of cards. The copy
 * count is measured from the viewport, so a short roster still fills a wide
 * screen.
 *
 * It pauses while a pointer is over the strip (so a card can be read and "Book
 * Now" clicked), while dragging, when the section is off-screen, and - through
 * CSS - when the visitor asked for reduced motion.
 */
const HealthPathTeam = ({ heading = "Our HealthPath Experts" }) => {
  // The doctor half of the strip comes from the shared redux roster (cache first,
  // the API is only hit when the slice is still empty).
  const { doctors, isLoading: doctorsLoading } = useDoctors();
  const dispatch = useDispatch();
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  // Marquee plumbing. The translation lives in a ref and is written straight to
  // the track's `transform`, so a 60fps tick never re-renders React.
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const firstCopyRef = useRef(null);
  const offsetRef = useRef(0); // current translation, px
  const copyWidthRef = useRef(0); // width of one full copy, px
  const pausedRef = useRef(false); // pointer over the strip / focused inside
  const inViewRef = useRef(true); // section visible on screen
  const dragRef = useRef(null); // active pointer drag
  const hoveringRef = useRef(false); // pointer resting on the strip
  const suppressClickRef = useRef(false); // swallow the click after a drag
  const expandedRef = useRef(false); // a card is showing its full degree
  const [copies, setCopies] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  // Cards whose degree is expanded, keyed by `member.key`: the marquee renders
  // the roster several times, and every copy of the same person has to open and
  // close together (otherwise the identical copies would look different).
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  // Nursing staff list - the doctors come from redux via `useDoctors`.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const staffRes = await fetch(api.staff);
        const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };

        if (!active) return;

        setStaff(Array.isArray(staffData.staff) ? staffData.staff : []);
      } catch (error) {
        console.error("Failed to fetch HealthPath team:", error);
      } finally {
        if (active) setStaffLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  // Merge doctors + nursing staff into a single, normalised card list.
  const team = useMemo(() => {
    const doctorCards = doctors
      .filter((doctor) => doctor?.isActive !== false)
      .map((doctor) => {
        const degree = formatDegree({ ...doctor, type: "doctor" });
        return {
          id: doctor._id,
          type: "doctor",
          // Stable identity for the expand state, shared by the marquee's copies.
          key: `doctor-${doctor._id}`,
          name: doctorDisplayName(doctor.name) || "Doctor",
          serviceLabel: formatServiceOffered({
            type: "doctor",
            serviceOffered: doctor.serviceOffered,
            expertise: doctor.expertise,
          }),
          degreeLabel: degree.label,
          degreeTitle: degree.title,
          profilePictureUrl: doctor.profilePictureUrl,
          // Book this specific doctor (same deep-link as DoctorCard).
          bookNowHref: `/appointment?doctorId=${doctor._id}`,
          // Tapping the card (anywhere but "Book Now") opens the profile. There is
          // no `/doctor/[id]` route: the page renders `state.allDoctorS.doctorInfo`,
          // so the raw document is kept here and dispatched on click - exactly what
          // DoctorCard's "View Profile" does.
          profileHref: "/doctor-info",
          source: doctor,
        };
      });

    const staffCards = staff
      .filter((member) => member?.isActive !== false)
      .map((member) => ({
        id: member._id,
        type: "staff",
        key: `staff-${member._id}`,
        name: doctorDisplayName(member.name) || "Staff",
        serviceLabel: formatServiceOffered({
          type: "staff",
          jobTitle: member.jobTitle,
        }),
        // Nurses carry no degrees, but the slot still renders (nbsp) so every
        // card in the strip keeps the same internal rhythm.
        degreeLabel: "",
        degreeTitle: "",
        profilePictureUrl: member.profilePictureUrl,
        // Nurses are not individually bookable today, so "Book Now" opens the
        // nursing care service page where the booking CTA lives.
        bookNowHref: `/service-details?name=${encodeURIComponent(
          "Nursing Care"
        )}&Service=nursing-services`,
        // Nurses do have a real dynamic profile page, so this link navigates by
        // itself - no redux hop needed.
        profileHref: `/nursing-staff/${member._id}`,
        source: member,
      }));

    return [...doctorCards, ...staffCards];
  }, [doctors, staff]);

  // Open / close the full degree of one card. A Set keeps several cards open at
  // once - collapsing someone else's text when the visitor opens another one
  // would be surprising while the strip is sliding.
  const toggleDegree = useCallback((key) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Card click (anywhere except the "Book Now" CTA) opens the profile. Staff are
  // handled by their Link; a doctor profile is redux driven, so the document has
  // to be dispatched before the push.
  const openDoctorProfile = useCallback(
    (event, member) => {
      if (member.type !== "doctor") return;

      // Keep the native anchor from navigating before the store is filled.
      event.preventDefault();

      // Signatures/stamps never belong on the public profile page.
      const { doctorSignatureUrl, doctorStampUrl, ...profile } =
        member.source || {};
      dispatch(setDoctorInfo(profile));
      router.push(member.profileHref);
    },
    [dispatch, router]
  );

  // Writes the cached offset to the track. Called from the rAF loop and from the
  // drag handlers; kept outside React state so a 60fps tick never re-renders.
  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  }, []);

  // How many copies are needed so that one full copy is at least as wide as the
  // viewport (2 minimum: the wrap needs a second copy to scroll into).
  useLayoutEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const copy = firstCopyRef.current;
      if (!viewport || !copy) return;

      const copyWidth = copy.getBoundingClientRect().width;
      if (!copyWidth) return;

      copyWidthRef.current = copyWidth;
      offsetRef.current = wrapOffset(offsetRef.current, copyWidth);
      paint();

      const needed = Math.max(
        2,
        Math.ceil(viewport.clientWidth / copyWidth) + 1
      );
      setCopies((current) => (current === needed ? current : needed));
    };

    measure();

    const viewport = viewportRef.current;
    let observer;
    if (viewport && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(viewport);
    }
    window.addEventListener("resize", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [team.length, paint]);

  // The continuous scroll itself.
  useEffect(() => {
    if (!team.length) return undefined;
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    let frame = 0;
    let lastTime = 0;

    const step = (time) => {
      frame = window.requestAnimationFrame(step);

      if (!lastTime) {
        lastTime = time;
        return;
      }

      // Clamp the delta: a background tab or one slow frame must not teleport.
      const delta = Math.min(time - lastTime, 64);
      lastTime = time;

      if (pausedRef.current || !inViewRef.current) return;

      const copyWidth = copyWidthRef.current;
      if (!copyWidth) return;

      offsetRef.current = wrapOffset(
        offsetRef.current + (MARQUEE_SPEED * delta) / 1000,
        copyWidth
      );
      paint();
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [team.length, copies, paint]);

  // An expanded degree has to be readable, and a touch screen never fires the
  // "pointer is over the strip" pause - so the strip holds still while any card
  // is open, and resumes with the normal hover rules once it is collapsed again.
  const hasExpandedCard = expandedKeys.size > 0;
  useEffect(() => {
    expandedRef.current = hasExpandedCard;

    if (hasExpandedCard) {
      pausedRef.current = true;
    } else if (!hoveringRef.current && !dragRef.current) {
      pausedRef.current = false;
    }
  }, [hasExpandedCard]);

  // Stop ticking while the strip is off-screen (long homepage, phones).
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [team.length]);

  // Drag / swipe: one pointer path covers mouse, touch and pen.
  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startOffset: offsetRef.current,
      captured: false,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const copyWidth = copyWidthRef.current;
    if (!copyWidth) return;

    const distance = event.clientX - drag.startX;

    // A plain click (no real movement) must stay a click: we only take over the
    // pointer - and only then swallow the upcoming click - after the threshold
    // is crossed. Capturing the pointer on pointerdown would retarget the click
    // to the marquee, so "Book Now" would never follow its link.
    if (!drag.captured && Math.abs(distance) <= DRAG_CLICK_THRESHOLD) return;

    if (!drag.captured) {
      drag.captured = true;
      suppressClickRef.current = true;
      pausedRef.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    offsetRef.current = wrapOffset(drag.startOffset - distance, copyWidth);
    paint();
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (event?.pointerId !== undefined && drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    // Back to "paused only while hovered": after a mouse drag the cursor is often
    // still on the strip, and resuming there would slide the card away from the
    // click the visitor is about to make. A card that is showing its full degree
    // keeps the strip paused.
    pausedRef.current =
      expandedRef.current ||
      (drag.pointerType === "mouse" ? hoveringRef.current : false);
    if (drag.captured) setIsDragging(false);

    if (drag.captured) {
      event?.currentTarget?.releasePointerCapture?.(drag.pointerId);
    }
  };

  // A drag must not end up as a click on the "Book Now" underneath it.
  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  if (staffLoading || doctorsLoading) return null;
  if (!team.length) return null;

  return (
    <section className="services-section pb-70">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <div className="font-weight-bold h1 text-uppercase">{heading}</div>
          </div>
        </div>

        <div className="row">
          <section className="services-wrapper col-lg-12">
            <div
              className={`${styles.marquee} ${isDragging ? styles.dragging : ""}`}
              ref={viewportRef}
              onMouseEnter={() => {
                hoveringRef.current = true;
                pausedRef.current = true;
              }}
              onMouseLeave={() => {
                hoveringRef.current = false;
                if (!dragRef.current) {
                  pausedRef.current = expandedRef.current;
                }
              }}
              onFocusCapture={() => {
                pausedRef.current = true;
              }}
              onBlurCapture={() => {
                pausedRef.current = hoveringRef.current || expandedRef.current;
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={handleClickCapture}
            >
              <div className={styles.track} ref={trackRef}>
                {Array.from({ length: copies }).map((_, copyIndex) => (
                  // Copy 0 is the real list; the others only exist so the strip can
                  // wrap seamlessly, so they stay out of the accessibility tree.
                  <div
                    className={styles.copy}
                    key={`copy-${copyIndex}`}
                    ref={copyIndex === 0 ? firstCopyRef : undefined}
                    aria-hidden={copyIndex > 0 || undefined}
                  >
                    {team.map((member) => (
                      <div
                        className={`${styles.teamCard} ${
                          expandedKeys.has(member.key)
                            ? styles.teamCardExpanded
                            : ""
                        }`}
                        key={member.key}
                      >
                        <div className={styles.teamCardInner}>
                          {/* Everything above "Book Now" opens the profile: the
                              link stretches over the card's free space, so the
                              whole card is the tap target except the CTA. */}
                          <Link
                            href={member.profileHref}
                            className={styles.profileLink}
                            // A native link drag would fight the strip's own
                            // pointer drag.
                            draggable={false}
                            // Clone copies are aria-hidden, so keep them out of
                            // the tab order as well.
                            tabIndex={copyIndex > 0 ? -1 : undefined}
                            onClick={
                              member.type === "doctor"
                                ? (event) => openDoctorProfile(event, member)
                                : undefined
                            }
                          >
                            <div className={styles.avatar}>
                              <MemberAvatar member={member} />
                            </div>

                            <div className={styles.name} title={member.name}>
                              {member.name}
                            </div>
                            <div
                              className={styles.service}
                              title={member.serviceLabel}
                            >
                              {member.serviceLabel}
                            </div>
                            {/* Degree line: always rendered - doctors print their
                                credentials here ("MBBS, MD"), everyone else keeps
                                the slot empty - so a card with degrees and a card
                                without occupy the exact same box. A label that
                                does not fit gets a "More" toggle. */}
                            <TeamCardDegree
                              member={member}
                              expanded={expandedKeys.has(member.key)}
                              onToggle={toggleDegree}
                              inert={copyIndex > 0}
                            />
                          </Link>

                          <div className={styles.bookNowWrap}>
                            <ConsultationButton path={member.bookNowHref}>
                              {booking_btn_txt}
                            </ConsultationButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default HealthPathTeam;

