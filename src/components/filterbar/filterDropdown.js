import React, { useState } from "react";

const Dropdown = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        {label}
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleOptionSelect(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .dropdown {
          position: relative;
          margin-right: 20px;
        }

        .dropdown-toggle {
          background-color: #f0f0f0;
          color: #333;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%; /* Center horizontally */
          transform: translateX(-50%);
          background-color: #fff;
          border: 1px solid #ccc;
          border-top: none;
          list-style: none;
          padding: 0;
          margin: 0;
          width: 200px; /* Set width as needed */
        }

        .dropdown-menu li {
          padding: 10px 20px;
          cursor: pointer;
        }

        .dropdown-menu li:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default Dropdown;
