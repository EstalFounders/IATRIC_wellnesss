import { useRouter } from "next/router";
import { useState } from "react";

const COMING_SOON_ITEMS = ["/labTest/homepage", "/medicine/homepage"];

const MobileMenu = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const [comingSoon, setComingSoon] = useState(new Set());

  const menuItems = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "About Us", href: "/about-us", icon: "ℹ️" },
    { label: "Services", href: "/all-services", icon: "🏥" },
    { label: "Book Consultation", href: "/appointment", icon: "📅" },
    { label: "Lab Tests", href: "/labTest/homepage", icon: "🧪" },
    { label: "Medicines", href: "/medicine/homepage", icon: "💊" },
    { label: "Blog", href: "/blog/homepage", icon: "📝" },
    { label: "All Doctors", href: "/all-doctors", icon: "👨‍⚕️" },
    { label: "Contact Us", href: "/contacts-2", icon: "☎️" },
    { label: "Join Us", href: "/join-us", icon: "👥" },
  ];

  const handleNavigation = (href) => {
    if (COMING_SOON_ITEMS.includes(href)) {
      setComingSoon((prev) => new Set(prev).add(href));
      return;
    }
    router.push(href);
  };

  const isActive = (href) =>
    router.pathname === href || router.asPath === href;

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
      onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#3b5f1d",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>

        {/* MENU ITEMS */}
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
              return (
                <li
                  key={item.href}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    onClick={() => handleNavigation(item.href)}
                    style={{
                      display: "block",
                      padding: "14px 16px",
                      color: active ? "#3b5f1d" : "#333",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: active ? "700" : "500",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      borderLeft: active ? "4px solid #3b5f1d" : "4px solid transparent",
                      backgroundColor: active ? "#f0f7ee" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.target.style.backgroundColor = "#f5f5f5";
                        e.target.style.borderLeftColor = "#3b5f1d";
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
                    {item.icon} {comingSoon.has(item.href) ? `${item.label} - Coming Soon 🚧` : item.label}
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