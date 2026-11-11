import React, { useState } from "react";
import { healthConcerns } from "../../../data/HealthConcern";
import { HorizontalScrollContainer } from "../labTestComponent/common/HorizontalContainer";
import { ConsultationButton } from "../Common/commonUi";
import { useDoctors } from "../../customUtils/useDoctors";
import { isPreviewableImageUrl } from "../../customUtils/imageUpload";
import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";

const MedicalCertificate = () => {
  const { doctors } = useDoctors();
  // Certificates that could not be loaded. A PDF stored before the API refused
  // documents in the picture slots has no extension in its object name, so it
  // cannot be told apart from a picture up front - it is dropped once the browser
  // reports the failed load instead of leaving an empty tile in the strip.
  const [failedCertificates, setFailedCertificates] = useState([]);

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center text-md-start mb-2">
        Trusted & Verified by Medical Professionals
      </h2>
      <p className="text-muted text-center text-md-start mb-4">
        Validated by Licensed Practitioners
      </p>
      <div className="row bg-muted">
        <HorizontalScrollContainer>
          {doctors.map((doctor, doctorIndex) =>
            // Certificates can be PDFs (stored untouched by the API); an <Image>
            // would show a blank box, so only pictures make it into the strip.
            (doctor.diplomasCertificatesUrls || [])
              .filter(isPreviewableImageUrl)
              .map((certUrl, certIndex) => {
                const key = `${doctorIndex}-${certIndex}`;
                if (failedCertificates.includes(key)) return null;
                return (
                  <div
                    key={key}
                    style={{
                      minWidth: "240px",
                      marginRight: "16px",
                    }}
                  >
                    <Image
                      placeholder="blur"
                      blurDataURL={imageBlurDataUrl}
                      src={certUrl}
                      width={100}
                      height={200}
                      className="card-img-top m-3 p-2"
                      alt={`Certificate ${certIndex + 1}`}
                      onError={() =>
                        setFailedCertificates((previous) =>
                          previous.includes(key)
                            ? previous
                            : [...previous, key]
                        )
                      }
                    />
                  </div>
                );
              })
          )}
        </HorizontalScrollContainer>
      </div>
    </div>
  );
};

export default MedicalCertificate;
