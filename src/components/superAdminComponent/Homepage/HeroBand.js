// HeroBand.js - who is signed in, plus the two actions a super-admin uses most.
// Create doctor slots runs a slow server job, so the button disables itself
// while it runs and reports the result inline (it used to call window.alert).
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaEdit, FaPlus } from "react-icons/fa";
import { super_admin_info_local_sotrage } from "../../../constant";
import styles from "../css/Homepage.module.css";

const HeroBand = () => {
  const [admin, setAdmin] = useState(null);
  const [today, setToday] = useState("");
  const [slotState, setSlotState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    try {
      setAdmin(
        JSON.parse(sessionStorage.getItem(super_admin_info_local_sotrage))
      );
    } catch (error) {
      console.error("Could not read the stored super-admin session:", error);
    }

    setToday(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const user = admin && admin.user;
  const name = [user && user.fname, user && user.lname]
    .filter(Boolean)
    .join(" ");
  const roleLabel = Array.isArray(user && user.role)
    ? user.role.join(", ")
    : user && user.role;

  const createDoctorSlots = async () => {
    setSlotState({ status: "busy", message: "" });
    try {
      const response = await fetch("/api/lib/runCronJob", { method: "POST" });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      setSlotState({
        status: "ok",
        message: "Slots created for the next 7 days.",
      });
    } catch (error) {
      console.error("Error creating doctor slots:", error);
      setSlotState({
        status: "error",
        message: "Could not create the slots. Please try again.",
      });
    }
  };

  const busy = slotState.status === "busy";

  return (
    <section className={styles.hero}>
      <div className={styles.heroInfo}>
        <p className={styles.heroEyebrow}>Super Admin</p>
        <h1 className={styles.heroName}>{name || "Super Admin"}</h1>
        <div className={styles.heroMeta}>
          {today ? <span className={styles.metaItem}>{today}</span> : null}
          {roleLabel ? (
            <span className={styles.metaItem}>
              Role: <strong>{roleLabel}</strong>
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.heroActions}>
        <Link className={styles.primaryBtn} href="/superAdmin/addDoctor">
          <FaPlus />
          Add doctor
        </Link>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={createDoctorSlots}
          disabled={busy}
        >
          <FaEdit />
          {busy ? "Creating slots..." : "Create doctor slots"}
        </button>
      </div>
      {slotState.status === "ok" || slotState.status === "error" ? (
        <p
          className={`${styles.note} ${
            slotState.status === "ok" ? styles.noteOk : styles.noteErr
          }`}
          role="status"
        >
          {slotState.message}
        </p>
      ) : null}
    </section>
  );
};

export default HeroBand;
