import React, { useState } from "react";
import Dropdown from "./filterDropdown";

const FilterBar = ({ selectFilter }) => {
  const updateSelectedOption = (option) => {
    selectFilter(option);
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-bar">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Doctor Name"
          id="searchInput"
          className="filter-input mr-4 rounded p-1"
        />
        <Dropdown
          label="Sort"
          options={["Experience: High to low", "Earliest Availability"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label="Speciality"
          options={["Option 1", "Option 2", "Option 3"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label="Location"
          options={["Option 1", "Option 2", "Option 3"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label="Availability"
          options={["Today"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label="Consultation Type"
          options={["In Clinic", "Video Consultation"]}
          selectFilter={updateSelectedOption}
        />
        <Dropdown
          label="Gender"
          options={["Female", "Male"]}
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
