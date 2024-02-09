// ImageUploader.js

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaTrash } from 'react-icons/fa';
import styles from './ImageUploader.module.css'; // Import the CSS module

const ImageUploader = ({ id,multiple,onImagesChange }) => {
  const [images, setImages] = useState([]);

  const handleImagesChange = (newImages) => {
    setImages(newImages);
    if (onImagesChange) {
        onImagesChange(id, newImages);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (multiple) {
      handleImagesChange([...images, ...acceptedFiles]);
    } else {
      handleImagesChange(acceptedFiles);
    }
  };

  const removeImage = (index) => {
    handleImagesChange(images.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple });

  return (
    <div>
      <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
        <input {...getInputProps()} />
        <p>Drag & drop some files here, or click to select files</p>
      </div>
      <div className={styles.imageContainer}>
        {images.map((image, index) => (
          <div key={index} className={styles['image-preview']}>
            <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
            <button onClick={() => removeImage(index)} className={styles.removeButton}>
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
