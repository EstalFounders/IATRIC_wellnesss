// Navbar.js - the super-admin drawer.
//
// The hamburger is a real <button> with aria-expanded/aria-controls, the panel
// only exists while it is open (so nothing off-screen can be tabbed into),
// Escape and the scrim close it, body scroll is locked while it is open and the
// current route is highlighted. The entries come from SideBarData (grouped).
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconContext } from "react-icons";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SideBarData";
import styles from "./Navbar.module.css";

const MENU_ID = "superAdminMainMenu";

const Navbar = () => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(false);
  const closeButtonRef = useRef(null);

  const openSidebar = () => setSidebar(true);
  const closeSidebar = () => setSidebar(false);

  useEffect(() => {
    if (!sidebar) return undefined;

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebar]);

  const currentPath = router.asPath.split("?")[0];
  const isActive = (path) =>
    currentPath === path ||
    (path !== "/superAdmin/homepage" && currentPath.startsWith(path));

  return (
    <>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={openSidebar}
        aria-label="Open main menu"
        aria-expanded={sidebar}
        aria-controls={MENU_ID}
      >
        <FaIcons.FaBars size={22} />
      </button>

      {sidebar ? (
        <>
          <div
            className={styles.scrim}
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <nav
            id={MENU_ID}
            className={styles.navMenu}
            aria-label="Super admin sections"
          >
            <div className={styles.navHeader}>
              <span className={styles.navTitle}>Menu</span>
              <button
                type="button"
                ref={closeButtonRef}
                className={styles.menuBtn}
                onClick={closeSidebar}
                aria-label="Close main menu"
              >
                <AiIcons.AiOutlineClose size={22} />
              </button>
            </div>
            <IconContext.Provider value={{ color: "#4f6628" }}>
              <ul className={styles.navMenuItems}>
                {SidebarData.map((item) => (
                  <React.Fragment key={item.path}>
                    {item.group ? (
                      <li className={styles.group}>{item.group}</li>
                    ) : null}
                    <li className={styles.navItem}>
                      <Link
                        href={item.path}
                        className={
                          isActive(item.path)
                            ? `${styles.navLink} ${styles.navLinkActive}`
                            : styles.navLink
                        }
                        aria-current={isActive(item.path) ? "page" : undefined}
                        onClick={closeSidebar}
                      >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.title}</span>
                      </Link>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            </IconContext.Provider>
          </nav>
        </>
      ) : null}
    </>
  );
};

export default Navbar;
