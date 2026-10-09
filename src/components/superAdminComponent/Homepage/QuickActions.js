// QuickActions.js - the routes a super-admin needs most often, one tap away.
import React from "react";
import { useRouter } from "next/router";
import { FaBookMedical, FaListAlt, FaUserPlus } from "react-icons/fa";
import { ImLab } from "react-icons/im";
import { IoIosPricetags } from "react-icons/io";
import { BiSolidOffer } from "react-icons/bi";
import styles from "../css/Homepage.module.css";

const ACTIONS = [
  {
    label: "Add doctor",
    hint: "Register a new doctor",
    path: "/superAdmin/addDoctor",
    icon: <FaUserPlus />,
  },
  {
    label: "Book consultation",
    hint: "Book a slot for a patient",
    path: "/superAdmin/bookConsultationFromAdmin",
    icon: <FaBookMedical />,
  },
  {
    label: "Add lab",
    hint: "On-board a diagnostic lab",
    path: "/superAdmin/addLab",
    icon: <ImLab />,
  },
  {
    label: "Consultation fee",
    hint: "Set the fee per consultation",
    path: "/superAdmin/consultationFee",
    icon: <IoIosPricetags />,
  },
  {
    label: "Offers",
    hint: "Publish a discount",
    path: "/superAdmin/offers",
    icon: <BiSolidOffer />,
  },
  {
    label: "Logs",
    hint: "Recent activity",
    path: "/superAdmin/logs",
    icon: <FaListAlt />,
  },
];

const QuickActions = () => {
  const router = useRouter();

  return (
    <div className={styles.quickGrid}>
      {ACTIONS.map((action) => (
        <button
          key={action.path}
          type="button"
          className={styles.quickTile}
          onClick={() => router.push(action.path)}
        >
          <span className={styles.quickIcon}>{action.icon}</span>
          <span>
            <span className={styles.quickLabel}>{action.label}</span>
            <span className={styles.quickHint}>{action.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
