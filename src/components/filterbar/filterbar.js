import React, { useEffect, useMemo, useState } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import FilterDropdown from "./filterDropdown";
import styles from "./css/filterBar.module.css";
import { useLanguage } from "../../i18n/LanguageContext";
import { fmt } from "../../i18n/format";
import { color_schema } from "../../constant";
import {
  CONSULTATION_FILTERS,
  EMPTY_FILTERS,
  countActiveFilters,
} from "./filterDoctors";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Search + filter bar for the public doctor listing.
 *
 * Fully controlled: it renders `filters` and reports every change through
 * `onChange(key, value)`, so the parent owns the state and filters the list
 * instantly. Typing is debounced (300ms) so a keystroke does not re-filter a
 * long list on every character.
 */
const FilterBar = ({
  filters = EMPTY_FILTERS,
  onChange,
  onReset,
  specialities = [],
  locations = [],
  resultCount = 0,
  totalCount = 0,
}) => {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState(filters.search || "");

  // "Clear all" / an external reset must also empty the input.
  useEffect(() => {
    setSearchText(filters.search || "");
  }, [filters.search]);

  // Debounced push of the typed text into the shared filter state.
  useEffect(() => {
    const applied = filters.search || "";
    if (searchText === applied) return undefined;

    const timer = setTimeout(
      () => onChange("search", searchText),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText, filters.search, onChange]);

  const handleClearSearch = () => {
    setSearchText("");
    onChange("search", "");
  };

  const sortOptions = useMemo(
    () => [
      { value: "", label: t("doctors.allSort", "Recommended") },
      { value: "price_asc", label: t("doctors.optPriceLow", "Price: Low to High") },
      { value: "price_desc", label: t("doctors.optPriceHigh", "Price: High to Low") },
      {
        value: "experience_desc",
        label: t("doctors.optExperience", "Experience: High to low"),
      },
      { value: "rating_desc", label: t("doctors.optRating", "Rating: High to Low") },
    ],
    [t]
  );

  const specialityOptions = useMemo(
    () => [
      { value: "", label: t("doctors.allSpecialities", "All specialities") },
      ...specialities.map((name) => ({ value: name, label: name })),
    ],
    [specialities, t]
  );

  const locationOptions = useMemo(
    () => [
      { value: "", label: t("doctors.allLocations", "All locations") },
      ...locations.map((name) => ({ value: name, label: name })),
    ],
    [locations, t]
  );

  const availabilityOptions = useMemo(
    () => [
      { value: "", label: t("doctors.allAvailability", "Any availability") },
      { value: "today", label: t("doctors.optToday", "Today") },
      { value: "tomorrow", label: t("doctors.optTomorrow", "Tomorrow") },
      { value: "this_week", label: t("doctors.optThisWeek", "This week") },
    ],
    [t]
  );

  const consultationOptions = useMemo(() => {
    const labels = {
      audio: t("doctors.optAudio", "Audio Consultation"),
      video: t("doctors.optVideo", "Video Consultation"),
      clinic: t("doctors.optInClinic", "In Clinic"),
      home_visit: t("doctors.optHomeVisit", "Home Visit"),
    };

    return [
      { value: "", label: t("doctors.allConsultations", "Any consultation") },
      ...CONSULTATION_FILTERS.map((key) => ({ value: key, label: labels[key] })),
    ];
  }, [t]);

  const genderOptions = useMemo(
    () => [
      { value: "", label: t("doctors.allGenders", "All genders") },
      { value: "Male", label: t("doctors.optMale", "Male") },
      { value: "Female", label: t("doctors.optFemale", "Female") },
      { value: "Other", label: t("doctors.optOtherGender", "Other") },
    ],
    [t]
  );

  const activeCount = countActiveFilters(filters);

  const countLabel =
    activeCount > 0
      ? fmt(t("doctors.filteredCount", "{n} of {total} doctors"), {
          n: resultCount,
          total: totalCount,
        })
      : resultCount === 1
      ? t("doctors.resultCountOne", "1 doctor available")
      : fmt(t("doctors.resultCount", "{n} doctors available"), { n: resultCount });

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar} style={{ "--fb-primary": color_schema.green }}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <BiSearch aria-hidden="true" />
            </span>
            <input
              id="searchInput"
              type="text"
              className={styles.searchInput}
              placeholder={t("doctors.searchPlaceholder", "Search by Doctor Name")}
              aria-label={t("doctors.searchPlaceholder", "Search by Doctor Name")}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              autoComplete="off"
            />
            {searchText !== "" && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={handleClearSearch}
                aria-label={t("doctors.clearSearch", "Clear search")}
                title={t("doctors.clearSearch", "Clear search")}
              >
                <BiX aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          <FilterDropdown
            label={t("doctors.filterSort", "Sort")}
            value={filters.sort}
            options={sortOptions}
            onChange={(value) => onChange("sort", value)}
          />
          <FilterDropdown
            label={t("doctors.filterSpeciality", "Speciality")}
            value={filters.speciality}
            options={specialityOptions}
            onChange={(value) => onChange("speciality", value)}
          />
          <FilterDropdown
            label={t("doctors.filterLocation", "Location")}
            value={filters.location}
            options={locationOptions}
            onChange={(value) => onChange("location", value)}
          />
          <FilterDropdown
            label={t("doctors.filterAvailability", "Availability")}
            value={filters.availability}
            options={availabilityOptions}
            onChange={(value) => onChange("availability", value)}
          />
          <FilterDropdown
            label={t("doctors.filterConsultationType", "Consultation Type")}
            value={filters.consultation}
            options={consultationOptions}
            onChange={(value) => onChange("consultation", value)}
          />
          <FilterDropdown
            label={t("doctors.filterGender", "Gender")}
            value={filters.gender}
            options={genderOptions}
            onChange={(value) => onChange("gender", value)}
          />
        </div>

        {totalCount > 0 && (
          <div className={styles.meta}>
            <p className={styles.count}>{countLabel}</p>
            {activeCount > 0 && (
              <button type="button" className={styles.clearAll} onClick={onReset}>
                <BiX aria-hidden="true" />
                {t("doctors.clearAll", "Clear all filters")}
                <span className={styles.badge}>{activeCount}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
