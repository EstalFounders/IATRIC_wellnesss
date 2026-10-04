import React, { useState } from "react";
import { color_schema } from "../../constant";

const Dropdown = ({ label, options, selectFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    const index = selectedOptions.indexOf(option);
    if (index === -1) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    }
    selectFilter(option);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        {label}
      </button>
      <ul className={`dropdown-menu ${isOpen ? "open" : ""}`}>
        {options.map((option) => (
          <li key={option} onClick={() => handleOptionSelect(option)}>
            <input
              type="checkbox"
              value={option}
              checked={selectedOptions.includes(option)}
              readOnly
            />
            <label>{option}</label>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .dropdown {
          position: relative;
          margin-right: 20px;
        }

        .dropdown-toggle {
          background-color: #f0f0f0;
          color: ${color_schema.green};
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          z-index: 100; /* Ensure the dropdown toggle is above other elements */
        }

        .dropdown-toggle:hover {
          background-color: ${color_schema.green};
          color: #ffffff;
        }

        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background-color: #fff;
          border: 1px solid #ccc;
          border-top: none;
          z-index: 99;
        }

        .dropdown-menu.open {
          display: block;
        }

        .dropdown-menu li {
          padding: 10px 20px;
          cursor: pointer;
        }

        .dropdown-menu li:hover {
          background-color: #f0f0f0;
        }
        .dropdown-menu li input[type="checkbox"] {
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default Dropdown;
