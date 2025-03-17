import { price_symbol } from "../../../../constant";
import styles from "../../css/StatsCard.module.css";

const StatsCard = ({ todayBooking, totalEarning, totalBooking, onCardClick }) => {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} clickable-div`}
        onClick={() => onCardClick("today")} // Handle today's booking click
      >
        <h3 className={styles.title}>Today&apos;s Booking</h3>
        <p className={styles.value}>{todayBooking}</p>
      </div>
      <div
        className={`${styles.card} clickable-div`}
        onClick={() => onCardClick("total")} // Handle total booking click
      >
        <h3 className={styles.title}>Total Booking</h3>
        <p className={styles.value}>{totalBooking}</p>
      </div>
      <div className={`${styles.card} clickable-div`} onClick={() => onCardClick("payment")}>
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
