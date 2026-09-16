import React, { useState } from "react";
import Dropdown from "./filterDropdown";
import { useLanguage } from "../../i18n/LanguageContext";

const FilterBar = ({ selectFilter }) => {
  const { t } = useLanguage();
  const updateSelectedOption = (option) => {
    selectFilter(option);
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-bar">
        {/* Search Input */}
        <input
          type="text"
          placeholder={t("doctors.searchPlaceholder")}
          id="searchInput"
          className="filter-input mr-4 rounded p-1"
        />
        <Dropdown
          label={t("doctors.filterSort")}
          options={[t("doctors.optExperience"), t("doctors.optEarliest")]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label={t("doctors.filterSpeciality")}
          options={["Option 1", "Option 2", "Option 3"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label={t("doctors.filterLocation")}
          options={["Option 1", "Option 2", "Option 3"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label={t("doctors.filterAvailability")}
          options={[t("doctors.optToday")]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label={t("doctors.filterConsultationType")}
          options={[t("doctors.optInClinic"), t("doctors.optVideo")]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label={t("doctors.filterGender")}
          options={[t("doctors.optFemale"), t("doctors.optMale")]}
          selectFilter={updateSelectedOption}
        />
      </div>
      <style jsx>{`
        .filter-bar-container {
          padding: 10px;
          border: 1px solid #ccc;
          max-width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-bar > * {
          margin: 5px;
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
