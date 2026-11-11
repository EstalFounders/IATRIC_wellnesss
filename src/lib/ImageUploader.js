// ImageUploader.js
//
// Drag-and-drop upload picker used by the Add Doctor form. Each selected file is
// stored together with the object URL created exactly once for it, so the
// preview <img> keeps a stable src across re-renders (previously the URL was
// recreated in render, causing flicker and a blob memory leak). URLs are revoked
// when a file is removed and when the component unmounts.
//
// ANY file type is accepted by default (a PDF certificate is fine). Images get a
// thumbnail; anything else is listed by file name, because it cannot be previewed
// in an <img>. Resizing happens on the server and only for images.
//
// `imagesOnly` is for the slots that are always rendered inside an <img> (the
// doctor picture and the signature): a dropped document is refused here with the
// reason, instead of failing the whole form with a 400 from the API.

import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";
import styles from "./ImageUploader.module.css"; // Import the CSS module
import { isPreviewableImage } from "../customUtils/imageUpload";

const ImageUploader = ({ id, multiple, onImagesChange, imagesOnly = false }) => {
  // Each entry is { file, url } so the object URL is created once, not per render.
  const [images, setImages] = useState([]);
  // Names of the documents refused by an image-only slot, shown under the preview.
  const [refusedNames, setRefusedNames] = useState([]);

  // Latest entries, so the unmount cleanup revokes every URL still held.
  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(
    () => () => {
      imagesRef.current.forEach((entry) => URL.revokeObjectURL(entry.url));
    },
    []
  );

  const emit = (entries) => {
    setImages(entries);
    if (onImagesChange) {
      onImagesChange(
        id,
        entries.map((entry) => entry.file)
      );
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const usable = imagesOnly
      ? acceptedFiles.filter((file) => isPreviewableImage(file))
      : acceptedFiles;

    setRefusedNames(
      acceptedFiles
        .filter((file) => !usable.includes(file))
        .map((file) => file.name)
    );

    if (usable.length === 0) return;

    const entries = usable.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const current = imagesRef.current;
    if (multiple) {
      emit([...current, ...entries]);
    } else {
      // Signature / stamp are single-file slots: keep only the first file.
      emit(entries.slice(0, 1));
    }
  };

  const removeImage = (index) => {
    const current = imagesRef.current;
    const removed = current[index];
    if (removed) URL.revokeObjectURL(removed.url);
    emit(current.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ""}`}
      >
        <input {...getInputProps()} />
        <p>Drag &amp; drop some files here, or click to select files</p>
      </div>
      <div className={styles.imageContainer}>
        {images.map((entry, index) => (
          <div key={entry.url} className={styles["image-preview"]}>
            {isPreviewableImage(entry.file) ? (
              <img src={entry.url} alt={`Preview ${index}`} />
            ) : (
              // A PDF / document has no thumbnail - show its name instead.
              <p className={styles.fileName}>{entry.file.name}</p>
            )}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className={styles.removeButton}
              aria-label="Remove file"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      {refusedNames.length > 0 && (
        <p className={styles.fileName}>
          Only an image (JPG, PNG or WEBP) can go in this slot:{" "}
          {refusedNames.join(", ")}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;


