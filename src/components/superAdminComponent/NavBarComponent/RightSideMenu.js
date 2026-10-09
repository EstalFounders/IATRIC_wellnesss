// RightSideMenu.js - the account menu in the top bar.
//
// It used to be three placeholder rows (Item 1..3). It now lists the two
// request queues - with their pending counts, read from the same slices the
// home page uses - plus Logout, closes on Escape, on an outside click and on
// navigation, and is wired as a button plus menu for screen readers.
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { FaAngleDown } from "react-icons/fa";
import { super_admin_info_local_sotrage } from "../../../constant";
import styles from "./RightSideMenu.module.css";

const NO_REQUESTS = [];

const RightSideMenu = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const containerRef = useRef(null);

  const { doctorUpdateRequest = NO_REQUESTS, doctorLeaveRequest = NO_REQUESTS } =
    useSelector((state) => state.notificationData || {});

  useEffect(() => {
    try {
      setAdminInfo(
        JSON.parse(sessionStorage.getItem(super_admin_info_local_sotrage))
      );
    } catch (error) {
      console.error("Could not read the stored super-admin session:", error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const onPointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const closeOnRouteChange = () => setIsOpen(false);
    router.events.on("routeChangeStart", closeOnRouteChange);
    return () => router.events.off("routeChangeStart", closeOnRouteChange);
  }, [router.events]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      // redirect: false stops next-auth from sending the browser to the
      // absolute callbackUrl it builds server-side (a stale NEXTAUTH_URL used
      // to make that http://localhost:3000/superAdmin/onload).
      await signOut({ redirect: false });
      sessionStorage.removeItem(super_admin_info_local_sotrage);
      // Always a *relative* path: the browser resolves it against the domain
      // that is actually serving the panel.
      window.location.replace("/superAdmin/onload");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const queues = [
    {
      label: "Update requests",
      count: doctorUpdateRequest.length,
      path: "/superAdmin/viewAllDoctorUpdateRequest",
    },
    {
      label: "Leave requests",
      count: doctorLeaveRequest.length,
      path: "/superAdmin/viewAllDoctorLeaveRequest",
    },
  ];

  return (
    <div className={styles.dropdown} ref={containerRef}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span className={styles.adminName}>
          {adminInfo?.user?.fname || "Admin"}
        </span>
        <FaAngleDown className={styles.arrow} />
      </button>

      {isOpen ? (
        <div className={styles.menu} role="menu">
          <p className={styles.menuLabel}>Signed in</p>
          <Link
            href="/superAdmin/homepage"
            role="menuitem"
            className={`${styles.item} ${styles.itemLink}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {queues.map((queue) => (
            <Link
              key={queue.path}
              href={queue.path}
              role="menuitem"
              className={`${styles.item} ${styles.itemLink}`}
              onClick={() => setIsOpen(false)}
            >
              {queue.label}
              <span
                className={`${styles.itemCount} ${
                  queue.count === 0 ? styles.itemCountZero : ""
                }`}
              >
                {queue.count}
              </span>
            </Link>
          ))}
          <div className={styles.divider} />
          <button
            type="button"
            role="menuitem"
            className={`${styles.item} ${styles.itemBtn}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default RightSideMenu;
