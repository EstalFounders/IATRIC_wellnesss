import { price_symbol } from "../../../../constant";
import styles from "../../css/StatsCard.module.css";

const StatsCard = ({ todayBooking, totalEarning }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 className={styles.title}>Today's Booking</h3>
        <p className={styles.value}>{todayBooking}</p>
      </div>
      <div className={styles.card}>
        <h3 className={styles.title}>Total Earning</h3>
        <p className={styles.value}>
          {price_symbol}
          {totalEarning}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
