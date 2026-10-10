import { useRouter } from "next/router";
import { useState } from "react";
import { useGlobalData } from "../customUtils/useGlobalData";
import { serviceDetailsPath, isComingSoonService, isConsultationService, isLabService, LAB_SERVICE_KEY, LAB_SERVICE_NAME } from "../customUtils/serviceLinks";
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
  const serviceItems = (services || [])
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
                      style={{
                        maxHeight: servicesOpen
                          ? `${
                              serviceItems.length * 46 +
                              108 +
                              46 +
                              DOCTOR_CONSULTATION_LINKS.length * 46
                            }px`
                          : 0,
                        overflow: "hidden",
                        transition: "max-height 0.35s ease",
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
                          style={{
                            padding: "12px 16px 12px 30px",
                            fontSize: "15px",
                            color: "#333",
                            cursor: "pointer",
                            borderBottom: "1px solid #f4f5f2",
                          }}
                        >
                          {service.label}
                          {service.comingSoon ? (
                            <span
                              className="service-coming-soon"
                              style={{ marginLeft: 8 }}
                            >
                              Coming Soon
                            </span>
                          ) : null}
                        </div>
                      ))}

                      <div
                        onClick={() =>
                          handleNavigation(BOOK_CONSULTATION_HREF)
                        }
                        style={{
                          padding: "12px 16px 12px 30px",
                          fontSize: "15px",
                          fontWeight: "600",
                          color: color_schema.green,
                          cursor: "pointer",
                          borderBottom: "1px solid #f4f5f2",
                        }}
                      >
                        Book Doctor Consultation
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
                            padding: "12px 16px 12px 46px",
                            fontSize: "14px",
                            color: "#333",
                            cursor: "pointer",
                            borderBottom: "1px solid #f4f5f2",
                          }}
                        >
                          {service.label}
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
