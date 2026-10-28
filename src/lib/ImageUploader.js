// ImageUploader.js
//
// Drag-and-drop image picker used by the Add Doctor form. Each selected file is
// stored together with the object URL created exactly once for it, so the
// preview <img> keeps a stable src across re-renders (previously the URL was
// recreated in render, causing flicker and a blob memory leak). URLs are revoked
// when a file is removed and when the component unmounts.

import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";
import styles from "./ImageUploader.module.css"; // Import the CSS module

const ImageUploader = ({ id, multiple, onImagesChange }) => {
  // Each entry is { file, url } so the object URL is created once, not per render.
  const [images, setImages] = useState([]);

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
    const imageFiles = acceptedFiles.filter((file) =>
      (file.type || "").startsWith("image/")
    );
    if (imageFiles.length === 0) return;

    const entries = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const current = imagesRef.current;
    if (multiple) {
      emit([...current, ...entries]);
    } else {
      // Signature / stamp are single-image slots: keep only the first file.
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
    accept: { "image/*": [] },
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ""}`}
      >
        <input {...getInputProps()} />
        <p>Drag & drop some files here, or click to select files</p>
      </div>
      <div className={styles.imageContainer}>
        {images.map((entry, index) => (
          <div key={entry.url} className={styles["image-preview"]}>
            <img src={entry.url} alt={`Preview ${index}`} />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className={styles.removeButton}
              aria-label="Remove image"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
