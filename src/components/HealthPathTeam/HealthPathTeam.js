import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { api, booking_btn_txt } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import styles from "./HealthPathTeam.module.css";

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
    return offered || member.expertise || "Doctor Consultation";
  }
  return member.jobTitle || "Nursing Care";
};

/**
 * HealthPathTeam
 *
 * One horizontal, auto-scrolling strip of team cards that merges the doctor
 * roster (`GET /api/addDoctor`) with the nursing staff list (`GET /api/staff`).
 * The marquee container, drag/touch behaviour and pause-on-hover replicate the
 * exact implementation in Demo5Services1 (`.services-marquee` +
 * `.services-track-rtl`), only the card body is custom.
 */
const HealthPathTeam = ({ heading = "Our HealthPath Experts" }) => {
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const marqueeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Fetch both lists once and keep only active members.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [doctorsRes, staffRes] = await Promise.all([
          fetch(api.addDoctor),
          fetch(api.staff),
        ]);

        const doctorsData = doctorsRes.ok ? await doctorsRes.json() : [];
        const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };

        if (!active) return;

        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        setStaff(Array.isArray(staffData.staff) ? staffData.staff : []);
      } catch (error) {
        console.error("Failed to fetch HealthPath team:", error);
      } finally {
        if (active) setLoading(false);
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
        name: doctor.name,
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
        name: member.name,
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

  // Doubled list: the second half is the seamless-loop clone the -50% marquee
  // animation needs (identical to Demo5Services1).
  const combinedTeam = useMemo(() => [...team, ...team], [team]);

  // Touch drag support, mirroring Demo5Services1. Re-run when the list first
  // loads so the listeners attach to the now-rendered marquee element.
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    let touchStartX;
    let touchScrollLeft;

    const onTouchStart = (e) => {
      touchStartX = e.touches[0].pageX - el.offsetLeft;
      touchScrollLeft = el.scrollLeft;
    };

    const onTouchMove = (e) => {
      const x = e.touches[0].pageX - el.offsetLeft;
      const walk = (x - touchStartX) * 1.5;
      el.scrollLeft = touchScrollLeft - walk;
    };

    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [team.length]);

  // Mouse drag, mirroring Demo5Services1.
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) return null;
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
              className="services-marquee"
              ref={marqueeRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={(e) => {
                setIsPaused(false);
                handleMouseLeave(e);
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <div className={`services-track-rtl ${isPaused ? "paused" : ""}`}>
                {combinedTeam.map((member, index) => {
                  // Second half = the marquee clone. Keep it out of the
                  // accessibility tree, exactly like Demo5Services1.
                  const isClone = index >= team.length;

                  return (
                    <div
                      key={`${member.type}-${member.id}-${index}`}
                      className={styles.teamCard}
                      aria-hidden={isClone || undefined}
                    >
                      <div className={styles.teamCardInner}>
                        <div className={styles.avatar}>
                          {member.profilePictureUrl ? (
                            <Image
                              src={member.profilePictureUrl}
                              alt={member.name}
                              fill
                              sizes="(max-width: 767px) 96px, 120px"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <span className={styles.avatarFallback}>
                              {(member.name || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className={styles.name}>{member.name}</div>
                        <div className={styles.service}>
                          {member.serviceLabel}
                        </div>

                        <div className={styles.bookNowWrap}>
                          <ConsultationButton path={member.bookNowHref}>
                            {booking_btn_txt}
                          </ConsultationButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default HealthPathTeam;

