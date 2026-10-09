import styles from "../../css/StatsCard.module.css";

// The home page's stat cards. Three of them select the filter of the
// appointments table below (activeView); the earnings card opens the payments
// page instead, which is the only action that leaves the home page.
const StatsCard = ({
  cards = [],
  activeView,
  onSelect,
  loading = false,
  error = "",
  onRetry,
}) => (
  <>
    <div className={styles.grid} aria-busy={loading}>
      {cards.map((card) => {
        const isFilter = !card.earning;
        const isActive = isFilter && activeView === card.key;

        return (
          <button
            key={card.key}
            type="button"
            className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
            aria-pressed={isFilter ? isActive : undefined}
            onClick={() => onSelect?.(card.key)}
          >
            <span className={styles.label}>{card.label}</span>
            <span
              className={`${styles.value} ${
                card.earning ? styles.valueEarning : ""
              }`}
            >
              {card.value}
            </span>
            <span className={styles.hint}>{card.hint}</span>
          </button>
        );
      })}
    </div>

    {error ? (
      <div className={styles.errorBox} role="alert">
        <span>{error}</span>
        {onRetry ? (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    ) : null}
  </>
);

export default StatsCard;
