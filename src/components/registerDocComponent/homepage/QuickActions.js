// QuickActions.js
// The places a doctor leaves the home page for. Tiles, not a menu: each one says
// what it is for. Nothing here duplicates the header menu - leaves and slot
// changes stay in the header that owns their dialogs.
import React from "react";
import { useRouter } from "next/router";
import { FaPen, FaUser } from "react-icons/fa";
import { IoIosPaper, IoIosWallet, IoMdClipboard } from "react-icons/io";
import styles from "../css/HomePage.module.css";

const ACTIONS = [
  {
    key: "prescription",
    label: "Write prescription",
    hint: "Print for a patient",
    Icon: IoIosPaper,
    href: "/registerDoc/prescription",
  },
  {
    key: "earnings",
    label: "Payments & earnings",
    hint: "Consultation-wise payouts",
    Icon: IoIosWallet,
    href: "/registerDoc/doctorEarnings",
  },
  {
    key: "contract",
    label: "Your contract",
    hint: "Hire details and documents",
    Icon: IoMdClipboard,
    href: "/registerDoc/contract",
  },
  {
    key: "profile",
    label: "Your profile",
    hint: "Changes go for approval",
    Icon: FaUser,
    href: "/registerDoc/profile",
  },
];

const QuickActions = () => {
  const router = useRouter();

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>
        <FaPen /> Quick actions
      </h2>

      <div className={styles.quickGrid}>
        {ACTIONS.map(({ key, label, hint, Icon, href }) => (
          <button
            key={key}
            type="button"
            className={styles.quickTile}
            onClick={() => router.push(href)}
          >
            <span className={styles.quickIcon} aria-hidden="true">
              <Icon />
            </span>
            <span>
              <span className={styles.quickLabel}>{label}</span>
              <span className={styles.quickHint}>{hint}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
