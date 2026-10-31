// StatTiles.js - the four headline numbers of the panel.
// Each tile is a real <button>, so every tile is reachable and activatable
// from the keyboard (the tiles used to be clickable <div> elements). The
// "Total earning" tile is display-only - the earnings page it used to open was
// removed, the home page is the only place that reports that total.
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
      // Display only: there is no earnings page to open any more.
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
      {tiles.map((tile) => {
        // A tile without an `onClick` is a plain card: rendering it as a <button>
        // would put a focus stop and a pointer cursor on something inert.
        const isInteractive = typeof tile.onClick === "function";
        const Tile = isInteractive ? "button" : "div";

        return (
          <Tile
            key={tile.key}
            type={isInteractive ? "button" : undefined}
            className={`${styles.statCard} ${
              isInteractive ? "" : styles.statCardStatic
            }`}
            onClick={tile.onClick}
            aria-controls={
              tile.key === "doctors" ? "superAdminDoctors" : undefined
            }
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
          </Tile>
        );
      })}
    </div>
  );
};

export default StatTiles;
