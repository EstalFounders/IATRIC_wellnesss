import React, { useState } from "react";
import {
  displayFileNameFromUrl,
  documentKind,
  isPdfUrl,
} from "../../customUtils/imageUpload";

/**
 * A thumbnail for a stored doctor document (profile picture, signature,
 * certificate).
 *
 * A picture is rendered inside an `<img>`; a PDF or any other document - which an
 * `<img>` can never show - becomes a small card that opens the file in a new tab.
 * The same card is used when an image fails to load, which covers the legacy
 * objects stored before the API refused documents in the picture/signature slot
 * (a "Dr. X 8d7d3e13-..." PDF looks exactly like an image URL).
 */
const chipBaseStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  width: "100%",
  minHeight: "110px",
  padding: "10px 8px",
  border: "1px solid #dbe3ea",
  borderRadius: "8px",
  background: "#f7fafc",
  color: "#1d4ed8",
  fontSize: "11px",
  lineHeight: 1.25,
  textAlign: "center",
  textDecoration: "none",
  wordBreak: "break-word",
};

const StoredDocumentThumb = ({
  url,
  alt = "Document",
  label,
  className,
  style,
  chipStyle,
}) => {
  const [broken, setBroken] = useState(false);

  if (!url) return null;

  if (documentKind(url) === "image" && !broken) {
    return (
      <img
        src={url}
        alt={alt}
        className={className}
        style={style}
        onError={() => setBroken(true)}
      />
    );
  }

  const title = label || displayFileNameFromUrl(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={`Open ${title}`}
      style={{ ...chipBaseStyle, ...chipStyle }}
    >
      <i
        className={`fas ${isPdfUrl(url) ? "fa-file-pdf" : "fa-file-alt"}`}
        style={{ fontSize: "20px" }}
        aria-hidden="true"
      />
      <span>{title}</span>
      <small>Open</small>
    </a>
  );
};

export default StoredDocumentThumb;
