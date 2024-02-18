import React from "react";
import Dropdown from "./filterDropdown";

const FilterBar = () => {
  return (
    <div className="filter-bar-container">
      <div className="filter-bar">

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Doctor Name"
          id="searchInput"
          className="filter-input"
        />
        <Dropdown
          label="Specialty"
          options={["Option 1", "Option 2", "Option 3"]}
        />
        <Dropdown
          label="Location"
          options={["Option 1", "Option 2", "Option 3"]}
        />
        <Dropdown
          label="Availability"
          options={["Option 1", "Option 2", "Option 3"]}
        />
        <Dropdown
          label="Availability"
          options={["Option 1", "Option 2", "Option 3"]}
        />
        <Dropdown
          label="Availability"
          options={["Option 1", "Option 2", "Option 3"]}
        />
        <Dropdown
          label="Availability"
          options={["Option 1", "Option 2", "Option 3"]}
        />
      </div>
      <style jsx>{`
        .filter-bar-container {
          overflow-x: auto;
          white-space: nowrap;
          padding: 10px;
          border: 1px solid #ccc;
          max-width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .filter-bar {
          display: inline-flex;
        }

        @media (max-width: 768px) {
          .filter-bar-container {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
