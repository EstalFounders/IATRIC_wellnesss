import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { api, booking_btn_txt, imageBlurDataUrl } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useDoctors } from "../../customUtils/useDoctors";
import { doctorDisplayName } from "../../utils/doctorName";
import styles from "./HealthPathTeam.module.css";

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
  const [copies, setCopies] = useState(2);
  const [isDragging, setIsDragging] = useState(false);

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
      .map((doctor) => ({
        id: doctor._id,
        type: "doctor",
        name: doctorDisplayName(doctor.name) || "Doctor",
        serviceLabel: formatServiceOffered({
          type: "doctor",
          serviceOffered: doctor.serviceOffered,
          expertise: doctor.expertise,
        }),
        profilePictureUrl: doctor.profilePictureUrl,
        // Book this specific doctor (same deep-link as DoctorCard).
        bookNowHref: `/appointment?doctorId=${doctor._id}`,
      }));

    const staffCards = staff
      .filter((member) => member?.isActive !== false)
      .map((member) => ({
        id: member._id,
        type: "staff",
        name: doctorDisplayName(member.name) || "Staff",
        serviceLabel: formatServiceOffered({
          type: "staff",
          jobTitle: member.jobTitle,
        }),
        profilePictureUrl: member.profilePictureUrl,
        // Nurses are not individually bookable today, so "Book Now" opens the
        // nursing care service page where the booking CTA lives.
        bookNowHref: `/service-details?name=${encodeURIComponent(
          "Nursing Care"
        )}&Service=nursing-services`,
      }));

    return [...doctorCards, ...staffCards];
  }, [doctors, staff]);

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
    // click the visitor is about to make.
    pausedRef.current =
      drag.pointerType === "mouse" ? hoveringRef.current : false;
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
                if (!dragRef.current) pausedRef.current = false;
              }}
              onFocusCapture={() => {
                pausedRef.current = true;
              }}
              onBlurCapture={() => {
                pausedRef.current = hoveringRef.current;
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
                        className={styles.teamCard}
                        key={`${member.type}-${member.id}`}
                      >
                        <div className={styles.teamCardInner}>
                          <div className={styles.avatar}>
                            {member.profilePictureUrl ? (
                              <Image
                                placeholder="blur"
                                blurDataURL={imageBlurDataUrl}
                                src={member.profilePictureUrl}
                                alt={member.name}
                                fill
                                draggable={false}
                                sizes="(max-width: 575px) 92px, (max-width: 991px) 104px, 120px"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <span className={styles.avatarFallback}>
                                {(member.name || "?").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className={styles.name} title={member.name}>
                            {member.name}
                          </div>
                          <div className={styles.service} title={member.serviceLabel}>
                            {member.serviceLabel}
                          </div>

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

