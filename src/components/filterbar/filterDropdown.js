import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { BiCheck, BiChevronDown } from "react-icons/bi";
import styles from "./css/filterDropdown.module.css";

/**
 * Single-select dropdown for the doctor filter bar.
 *
 * A native <select> cannot carry the active/hover states the design needs, so
 * the trigger is a button that opens a listbox panel. The component is fully
 * controlled (`value` + `onChange`) and closes on outside click and Escape.
 *
 * Options: [{ value, label }] - `value: ""` is the "no filter" entry.
 */
const FilterDropdown = ({ label, value = "", options = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);
  const isActive = Boolean(value);
  // Collapsed state shows the field name ("Speciality") so six pills stay
  // distinguishable; an applied filter shows its own label instead.
  const displayLabel = isActive && selected ? selected.label : label;
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) close();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    close();
  };

  const triggerClass = [
    styles.trigger,
    isActive ? styles.triggerActive : "",
    isOpen ? styles.triggerOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.dd} ref={rootRef}>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-label={isActive && selected ? `${label}: ${selected.label}` : label}
        title={isActive && selected ? `${label}: ${selected.label}` : label}
      >
        <span className={styles.label}>{displayLabel}</span>
        <BiChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={styles.panel} role="listbox" id={listId} aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value || "__all"}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${
                  isSelected ? styles.optionSelected : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span className={styles.optionText}>{option.label}</span>
                {isSelected && <BiCheck className={styles.check} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
