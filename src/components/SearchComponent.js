import { createPortal } from "react-dom";
import { Padding } from "@mui/icons-material";
import { useEffect, useRef } from "react";

const SearchDropdown = ({
  results,
  searchQuery,
  showResults,
  dropdownPosition,
  onResultClick,
  onClose,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResults, onClose]);

  if (!showResults) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        background: "white",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 9999,
        marginTop: "8px",
        maxHeight: "400px",
        overflowY: "auto",
        border: "1px solid #e0e0e0",
      }}
    >
      {results.length > 0 ? (
        results.map((result, index) => (
          <div
            key={result.item.id}
            className="search-result-item"
            style={{
              padding: "15px 20px",
              borderBottom:
                index < results.length - 1 ? "1px solid #f0f0f0" : "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onClick={() => onResultClick(result.item)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
            }}
          >
            <div
              className="fw-bold text-dark mb-1"
              style={{ fontSize: "1.1rem" }}
            >
              {result.item.title}
            </div>
            <div
              className="small mb-2"
              style={{ fontSize: "0.85rem", fontColor: "#8e8333" }}
            >
              {result.item.category}
            </div>
            <div className="text-muted small" style={{ fontSize: "0.8rem" }}>
              By {result.item.author} • {result.item.readTime}
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: "25px 20px", textAlign: "center" }}>
          <div className="text-muted" style={{ fontSize: "1rem" }}>
            No articles found matching &quot;<strong>{searchQuery}</strong>
            &quot;
          </div>
          <div className="text-muted small mt-1">
            Try different keywords or browse our categories
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default SearchDropdown;
