import { useState, useEffect } from "react";
import { api, doctor_info_local_storage, price_symbol } from "../../../constant";
import styles from "../css/DoctorEarnings.module.css"; // Import CSS module
import { BiRupee } from "react-icons/bi";
import { useSelector } from "react-redux";

const DoctorEarnings = () => {
  const initialData = useSelector((state) => state.appointment.doctorEarnings)  
  const [data, setData] = useState(initialData);
  const [timeframe, setTimeframe] = useState("month"); // Default: This month

  const doctorInfo = JSON.parse(sessionStorage.getItem(doctor_info_local_storage));
  const doctorId = doctorInfo?.user?._id;

  const fetchDoctorEarnings = async () => {
    const res = await fetch(`${api.doctorEarning}?doctorId=${doctorId}&timeframe=${timeframe}`);
    return res.json();
  };

  useEffect(() => {
    if (!data || timeframe) { // Run initially if data is missing OR when timeframe changes
      fetchDoctorEarnings().then(setData).catch(console.error);
    }
  }, [timeframe]); 
  


  if (!data) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Earnings</h2>

      {/* Top Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <p className={styles.summaryText}>Total Earnings</p>
          <p className={styles.summaryValue}>{price_symbol}{data.totalEarningsTimeframe.toFixed(2)}</p>
        </div>
        <div className={styles.summaryItem}>
          <p className={styles.summaryText}>Consultations</p>
          <p className={styles.summaryValue}>{price_symbol}{data.totalConsultations}</p>
        </div>
        <div className={styles.summaryItem}>
          <p className={styles.summaryText}>Avg per Consultation</p>
          <p className={styles.summaryValue}>{price_symbol}{data.averagePerConsultation.toFixed(2)}</p>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className={styles.timeframeButtons}>
        {["today", "week", "month", "year"].map((tf) => (
          <button
            key={tf}
            className={`${styles.button} ${timeframe === tf ? styles.buttonActive : ""}`}
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
          {data.earnings.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.consultations}</td>
              <td>{price_symbol}{item.earnings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorEarnings;
