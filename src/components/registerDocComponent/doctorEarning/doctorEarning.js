import { useState, useEffect } from "react";
import {
  api,
  doctor_info_local_storage,
  price_symbol,
} from "../../../constant";
import styles from "../css/DoctorEarnings.module.css"; // Import CSS module
import { BiRupee } from "react-icons/bi";
import { useSelector } from "react-redux";

// The redux slice starts as an empty array and the earnings endpoint answers
// with an object (or `{ error }` when it fails), so "has the summary fields"
// is what decides whether a payload may be rendered as numbers.
const EMPTY_EARNINGS = {
  totalEarningsTimeframe: 0,
  totalConsultations: 0,
  averagePerConsultation: 0,
  earnings: [],
};

const hasEarningsSummary = (value) =>
  Boolean(
    value &&
      !Array.isArray(value) &&
      !value.error &&
      typeof value.totalEarningsTimeframe === "number" &&
      Array.isArray(value.earnings)
  );

const DoctorEarnings = () => {
  const initialData = useSelector((state) => state.appointment.doctorEarnings);
  const [data, setData] = useState(
    hasEarningsSummary(initialData) ? initialData : null
  );
  const [timeframe, setTimeframe] = useState("month"); // Default: This month

  const doctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage) || "{}"
  );
  const doctorId = doctorInfo?.user?._id;

  useEffect(() => {
    // No session yet (or a failed call): show the empty state instead of the
    // numbers blowing up the screen on a hard reload or a direct link.
    if (!doctorId) {
      setData({ ...EMPTY_EARNINGS });
      return undefined;
    }

    let active = true;

    fetch(`${api.doctorEarning}?doctorId=${doctorId}&timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        setData(hasEarningsSummary(payload) ? payload : { ...EMPTY_EARNINGS });
      })
      .catch((error) => {
        console.error(error);
        if (active) setData({ ...EMPTY_EARNINGS });
      });

    return () => {
      active = false;
    };
  }, [doctorId, timeframe]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Earnings</h2>

      {/* Top Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <p className={styles.summaryText}>Total Earnings</p>
          <p className={styles.summaryValue}>
            {price_symbol}
            {data.totalEarningsTimeframe.toFixed(2)}
          </p>
        </div>
        <div className={styles.summaryItem}>
          <p className={styles.summaryText}>Consultations</p>
          {/* A count, not money - it used to print a stray "₹". */}
          <p className={styles.summaryValue}>{data.totalConsultations}</p>
        </div>
        <div className={styles.summaryItem}>
          <p className={styles.summaryText}>Avg per Consultation</p>
          <p className={styles.summaryValue}>
            {price_symbol}
            {data.averagePerConsultation.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className={styles.timeframeButtons}>
        {["today", "week", "month", "year"].map((tf) => (
          <button
            key={tf}
            className={`${styles.button} ${
              timeframe === tf ? styles.buttonActive : ""
            }`}
            onClick={() => setTimeframe(tf)}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      {/* Earnings Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Consultations</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {data.earnings.length > 0 ? data.earnings.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.consultations}</td>
                  <td>
                    {price_symbol}
                    {item.earnings}
                  </td>
                </tr>
              ))
            : "No data available"}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorEarnings;
