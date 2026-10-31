import React, { useRef } from "react";
import { healthConcerns } from "../../../data/HealthConcern";
import { HorizontalScrollContainer } from "../labTestComponent/common/HorizontalContainer";
import { ConsultationButton } from "../Common/commonUi";
import { useDoctors } from "../../customUtils/useDoctors";
import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";

const MedicalCertificate = () => {
  const { doctors } = useDoctors();
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
            doctor.diplomasCertificatesUrls?.map((certUrl, certIndex) => (
              <div
                key={`${doctorIndex}-${certIndex}`}
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
                />
              </div>
            ))
          )}
        </HorizontalScrollContainer>
      </div>
    </div>
  );
};

export default MedicalCertificate;
