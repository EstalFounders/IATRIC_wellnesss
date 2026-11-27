// steps/Step5Documents.js
//
// Step 5 of 6 - the three uploads. All optional: certificates, the picture and
// the signature improve the prescription and the public profile, but a doctor can
// be registered without any of them and the files added later.

import React from "react";
import { Col, Row } from "react-bootstrap";
import { FaFileUpload } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import StepHeader from "../components/StepHeader";
import ImageUploader from "../../../../lib/ImageUploader";

const Step5Documents = ({ handleImagesChange, uploaderKey }) => (
  <section className={styles.card}>
    <StepHeader
      icon={FaFileUpload}
      title="Documents & pictures"
      description="Optional, but a picture and a signature make the profile and the prescription look right."
    >
      <p className={styles.stepHeaderNote}>
        Any file type is accepted for the certificates. The picture and the
        signature must be an image (JPG, PNG or WEBP) - a PDF cannot be shown as a
        picture.
      </p>
    </StepHeader>

    <Row key={uploaderKey}>
      <Col md={4}>
        <div className={styles.field}>
          <span className={styles.label}>Diplomas and certificates</span>
          <ImageUploader
            id="diplomasCertificates"
            multiple={true}
            onImagesChange={handleImagesChange}
          />
          <span className={styles.hint}>
            Multiple files allowed - PDF scans are fine.
          </span>
        </div>
      </Col>
      <Col md={4}>
        <div className={styles.field}>
          <span className={styles.label}>Doctor picture</span>
          <ImageUploader
            id="profilePicture"
            multiple={false}
            imagesOnly={true}
            onImagesChange={handleImagesChange}
          />
          <span className={styles.hint}>
            Shown on the listing card and the profile page.
          </span>
        </div>
      </Col>
      <Col md={4}>
        <div className={styles.field}>
          <span className={styles.label}>Digital signature</span>
          <ImageUploader
            id="doctorSignature"
            multiple={false}
            imagesOnly={true}
            onImagesChange={handleImagesChange}
          />
          <span className={styles.hint}>Used on prescriptions.</span>
        </div>
      </Col>
    </Row>
  </section>
);

export default Step5Documents;
