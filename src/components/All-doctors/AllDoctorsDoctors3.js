import React, { useCallback, useMemo, useState } from "react";
import FilterBar from "../filterbar/filterbar";
import listStyles from "../filterbar/css/filterBar.module.css";
import DoctorCard from "../Common/DoctorCard";
import { useDoctors } from "../../customUtils/useDoctors";
import { useGlobalData } from "../../customUtils/useGlobalData";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  EMPTY_FILTERS,
  buildFilterOptions,
  filterAndSortDoctors,
} from "../filterbar/filterDoctors";

const AllDoctorsDoctors3 = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Redux first: the shared slice paints instantly and only calls the API when
  // it holds no list yet (see `fetchAllDoctors`).
  const { doctors, isLoading } = useDoctors();
  const { specialityNames } = useGlobalData();
  const { t } = useLanguage();

  // Only doctors still marked active belong on the public listing.
  const visibleDoctors = useMemo(
    () => doctors.filter((doctor) => doctor && doctor.isActive !== false),
    [doctors]
  );

  // Speciality options are the curated SUB services (redux `globalData.speciality`)
  // - the same names a doctor's `serviceOffered` holds. Locations come from the
  // loaded doctors.
  const { specialities, locations } = useMemo(
    () => buildFilterOptions(visibleDoctors, specialityNames),
    [visibleDoctors, specialityNames]
  );

  const filteredDoctors = useMemo(
    () => filterAndSortDoctors(visibleDoctors, filters),
    [visibleDoctors, filters]
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilters((previous) =>
      previous[key] === value ? previous : { ...previous, [key]: value }
    );
  }, []);

  const handleReset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return (
    <section
      id="doctors-3"
      className="bg-lightgrey wide-60 doctors-section division"
    >
      <div className="container">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          specialities={specialities}
          locations={locations}
          resultCount={filteredDoctors.length}
          totalCount={visibleDoctors.length}
        />
      </div>

      <div className="container">
        <div className="row mt-4 d-flex justify-content-center">
          {filteredDoctors.map((doctor, index) => (
            <DoctorCard
              key={doctor._id || doctor.email || index}
              doctor={doctor}
              index={index}
            />
          ))}

          {!isLoading && filteredDoctors.length === 0 && (
            <div className={listStyles.empty}>
              <strong>
                {visibleDoctors.length === 0
                  ? t("doctors.noneAvailable", "No doctors available right now")
                  : t("doctors.noMatch", "No doctors match your filters")}
              </strong>
              <span>
                {visibleDoctors.length === 0
                  ? t("doctors.noneAvailableHint", "Please check back soon.")
                  : t(
                      "doctors.noMatchHint",
                      "Try a different search, or clear the filters to see everyone."
                    )}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AllDoctorsDoctors3;
