// StatTiles.js - the four headline numbers of the panel.
// Each tile is a real <button>, so every tile is reachable and activatable
// from the keyboard (the tiles used to be clickable <div> elements).
import React from "react";
import { useRouter } from "next/router";
import { FaMoneyBill, FaStethoscope, FaUser } from "react-icons/fa";
import { GrTest } from "react-icons/gr";
import { price_symbol } from "../../../constant";
import styles from "../css/Homepage.module.css";

const StatTiles = ({
  appointmentCount = 0,
  labTestCount = 0,
  doctorCount = 0,
  totalIncome = 0,
  isLoading,
}) => {
  const router = useRouter();

  const scrollToDoctors = () => {
    const target = document.getElementById("superAdminDoctors");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tiles = [
    {
      key: "consultations",
      label: "Consultation booked",
      value: appointmentCount.toLocaleString("en-IN"),
      hint: "All time",
      icon: <FaUser />,
      onClick: () => router.push("/superAdmin/consultationBooked"),
    },
    {
      key: "labTests",
      label: "LabTest booked",
      value: labTestCount.toLocaleString("en-IN"),
      hint: "All time",
      icon: <GrTest />,
      onClick: () => router.push("/superAdmin/labTestBooked"),
    },
    {
      key: "earnings",
      label: "Total earning",
      value: `${price_symbol}${totalIncome.toLocaleString("en-IN")}`,
      hint: "Consultations + completed lab tests",
      icon: <FaMoneyBill />,
      earning: true,
      onClick: () => router.push("/superAdmin/earnings"),
    },
    {
      key: "doctors",
      label: "Doctors",
      value: doctorCount.toLocaleString("en-IN"),
      hint: "Registered",
      icon: <FaStethoscope />,
      onClick: scrollToDoctors,
    },
  ];

  return (
    <div className={styles.statGrid}>
      {tiles.map((tile) => (
        <button
          key={tile.key}
          type="button"
          className={styles.statCard}
          onClick={tile.onClick}
          aria-controls={tile.key === "doctors" ? "superAdminDoctors" : undefined}
        >
          <span className={styles.statLabel}>
            {tile.icon}
            {tile.label}
          </span>
          <span
            className={`${styles.statValue} ${
              tile.earning ? styles.statValueEarning : ""
            }`}
          >
            {isLoading ? "-" : tile.value}
          </span>
          <span className={styles.statHint}>{tile.hint}</span>
        </button>
      ))}
    </div>
  );
};

export default StatTiles;
