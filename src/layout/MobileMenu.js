import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalData, mergeServiceLists } from "../customUtils/useGlobalData";
import { serviceDetailsPath, isComingSoonService, isConsultationService, isLabService, LAB_SERVICE_KEY, LAB_SERVICE_NAME } from "../customUtils/serviceLinks";
import { demo5ServiceHighlights } from "../../data/services";
import { resolveNavServiceIcon } from "../../public/svgIcon/nav-service-icons";
import { color_schema } from "../constant";

const COMING_SOON_ITEMS = ["/labTest/homepage"];

// Quick Links > "Book Doctor Consultation": the three pointers open the booking
// form with the consultation type preselected (AppointmentPage reads ?type=...).
const BOOK_CONSULTATION_HREF = `/appointment?service=${encodeURIComponent(
  "Book_Consultation"
)}`;
const DOCTOR_CONSULTATION_LINKS = [
  { type: "Audio", label: "Audio Consultation" },
  { type: "Video", label: "Video Consultation" },
  { type: "Clinic", label: "Clinic Visit" },
];

const MobileMenu = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const { services } = useGlobalData();
  const [servicesOpen, setServicesOpen] = useState(false);

  // Merge with the static service highlights exactly like the desktop Services
  // mega-menu (Header1) so every entry carries its canonical title + content key.
  // Without this the raw DB row is slugified (e.g. "Nursing Care" -> "nursing-care")
  // and opens the generic fallback page instead of the rich "nursing-services" page.
  const navServices = useMemo(
    () => mergeServiceLists(services, demo5ServiceHighlights),
    [services]
  );

  const menuItems = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "About Us", href: "/about-us", icon: "ℹ️" },
    // "Services" expands in place instead of navigating (see the accordion below).
    { label: "Services", href: "/all-services", icon: "🏥", expandable: true },
    { label: "Book Consultation", href: "/appointment", icon: "📅" },
    { label: "Lab Tests", href: "/labTest/homepage", icon: "🧪" },
    { label: "FAQ", href: "/faqs", icon: "❓" },
    { label: "All Doctors", href: "/all-doctors", icon: "👨‍⚕️" },
    { label: "Contact Us", href: "/contacts-2", icon: "☎️" },
    { label: "Join Us", href: "/join-us", icon: "👥" },
    { label: "Privacy Policy", href: "/privacy-policy", icon: "🔒" },
  ];

  // Services shown inside the drawer (DB list when available, static fallback
  // otherwise), each with a clean name-only URL. The merged lab service shows one
  // name plus the Coming Soon tag, whatever alias its DB row carries, and the
  // standalone "Audio" / "Video" rows are dropped: they are shown once, as
  // sub-pointers of "Book Doctor Consultation".
  const serviceItems = navServices
    .filter(
      (service) =>
        !isConsultationService(service.service || service.name || service.title)
    )
    .map((service) => {
      const lab = isLabService(service.service || service.name || service.title);
      const comingSoon =
        lab ||
        isComingSoonService(service.service || service.name || service.title);

      return {
        key: lab ? LAB_SERVICE_KEY : service.service || service.name,
        label: lab ? LAB_SERVICE_NAME : service.title || service.name,
        comingSoon,
        href: serviceDetailsPath(
          lab ? { name: LAB_SERVICE_NAME, service: LAB_SERVICE_KEY } : service
        ),
      };
    })
    .filter((service) => service.label)
    .slice(0, 12);

  // Accordion height is measured from the rendered list instead of guessed with
  // a per-row constant: rows now carry an icon swatch, long names wrap to a
  // second line and the font scales on smaller phones, so a fixed `rows * 46px`
  // either clipped the last entry or left a visible gap under it.
  const servicesListRef = useRef(null);
  const [servicesListHeight, setServicesListHeight] = useState(0);

  useEffect(() => {
    const node = servicesListRef.current;
    if (!node) return undefined;

    const measure = () => setServicesListHeight(node.scrollHeight);
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [serviceItems.length, servicesOpen]);

  const comingSoon = new Set(COMING_SOON_ITEMS);

  const closeMenu = () => setIsOpen(false);

  const handleNavigation = (href) => {
    router.push(href);
    closeMenu();
  };

  const isActive = (href) => router.pathname === href || router.asPath === href;

  const rowStyle = (active) => ({
    display: "block",
    padding: "14px 16px",
    color: active ? color_schema.green : "#333",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: active ? "700" : "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    borderLeft: active ? `4px solid ${color_schema.green}` : "4px solid transparent",
    backgroundColor: active ? "#f0f7ee" : "transparent",
  });

  // Same custom medical glyphs as the desktop mega-menu, in a rounded swatch.
  const ServiceIcon = ({ label }) => {
    const Icon = resolveNavServiceIcon(label);
    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 30px",
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: "rgba(59, 95, 29, 0.08)",
          color: color_schema.green,
        }}
      >
        <Icon width={18} height={18} />
      </span>
    );
  };

  // One icon + label row inside the accordion. `minWidth: 0` on the label lets a
  // long DB name wrap to a second line instead of pushing past the drawer edge.
  const serviceRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "9px 16px 9px 18px",
    fontSize: "14.5px",
    lineHeight: 1.3,
    color: "#333",
    cursor: "pointer",
    borderBottom: "1px solid #f4f5f2",
  };

  const serviceLabelStyle = {
    flex: 1,
    minWidth: 0,
    overflowWrap: "anywhere",
  };

  return (
    <div
      className="d-block d-lg-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 400,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: isOpen ? "flex" : "none",
        flexDirection: "column",
      }}
      onClick={closeMenu}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "85%",
          maxWidth: "320px",
          height: "100vh",
          backgroundColor: "#ffffff",
          overflowY: "auto",
          zIndex: 401,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <button
            onClick={closeMenu}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: color_schema.green,
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {menuItems.map((item) => {
              const active = isActive(item.href);

              if (item.expandable) {
                return (
                  <li key={item.href} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {/* Tap toggles the nested list - it never navigates or closes. */}
                    <div
                      role="button"
                      aria-expanded={servicesOpen}
                      aria-controls="mobile-services-list"
                      aria-label="Toggle the services list"
                      onClick={() => setServicesOpen((previous) => !previous)}
                      style={{
                        ...rowStyle(active),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {item.icon} {item.label}
                      </span>
                      <span
                        style={{
                          transition: "transform 0.3s ease",
                          transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)",
                          fontSize: "12px",
                          color: color_schema.green,
                        }}
                      >
                        ▼
                      </span>
                    </div>

                    {/* Nested services (smooth accordion) */}
                    <div
                      id="mobile-services-list"
                      ref={servicesListRef}
                      style={{
                        maxHeight: servicesOpen ? `${servicesListHeight}px` : 0,
                        overflow: "hidden",
                        transition: "max-height 0.35s ease, opacity 0.3s ease",
                        opacity: servicesOpen ? 1 : 0,
                        backgroundColor: "#fafbf8",
                      }}
                    >
                      <div
                        onClick={() => setServicesOpen(false)}
                        style={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: color_schema.green,
                          cursor: "pointer",
                          borderBottom: "1px solid #eef0ea",
                        }}
                      >
                        ← Back to main menu
                      </div>

                      {serviceItems.map((service) => (
                        <div
                          key={service.key}
                          onClick={() => handleNavigation(service.href)}
                          style={serviceRowStyle}
                        >
                          <ServiceIcon label={service.label} />
                          <span style={serviceLabelStyle}>
                            {service.label}
                            {service.comingSoon ? (
                              <span
                                className="service-coming-soon"
                                style={{ marginLeft: 8 }}
                              >
                                Coming Soon
                              </span>
                            ) : null}
                          </span>
                        </div>
                      ))}

                      <div
                        onClick={() =>
                          handleNavigation(BOOK_CONSULTATION_HREF)
                        }
                        style={{
                          ...serviceRowStyle,
                          fontWeight: "600",
                          color: color_schema.green,
                        }}
                      >
                        <ServiceIcon label="Doctor Consultation" />
                        <span style={serviceLabelStyle}>
                          Book Doctor Consultation
                        </span>
                      </div>

                      {DOCTOR_CONSULTATION_LINKS.map((service) => (
                        <div
                          key={`consultation-${service.type}`}
                          onClick={() =>
                            handleNavigation(
                              `${BOOK_CONSULTATION_HREF}&type=${service.type}`
                            )
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px 10px 60px",
                            fontSize: "14px",
                            color: "#333",
                            cursor: "pointer",
                            borderBottom: "1px solid #f4f5f2",
                          }}
                        >
                          <span aria-hidden="true" style={{ color: color_schema.green }}>
                            •
                          </span>
                          <span style={serviceLabelStyle}>{service.label}</span>
                        </div>
                      ))}

                      <div
                        onClick={() => handleNavigation("/all-services")}
                        style={{
                          padding: "12px 16px 12px 30px",
                          fontSize: "15px",
                          fontWeight: "700",
                          color: color_schema.green,
                          cursor: "pointer",
                        }}
                      >
                        All Services →
                      </div>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.href} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <div
                    onClick={() => handleNavigation(item.href)}
                    style={rowStyle(active)}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.target.style.backgroundColor = "#f5f5f5";
                        e.target.style.borderLeftColor = color_schema.green;
                        e.target.style.paddingLeft = "20px";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.borderLeftColor = "transparent";
                        e.target.style.paddingLeft = "16px";
                      }
                    }}
                  >
                    {item.icon}{" "}
                    {comingSoon.has(item.href)
                      ? `${item.label} - Coming Soon 🚧`
                      : item.label}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
