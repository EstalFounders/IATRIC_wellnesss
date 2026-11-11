import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import Link from "next/link";
import React, { useState } from "react";
import { useSelector } from "react-redux";

import { formatEducationTrainingLabel } from "../../customUtils/educationTraining";
import {
  documentKind,
  isPdfUrl,
  isPreviewableImageUrl,
} from "../../customUtils/imageUpload";
import { formatWorkExperienceLabel } from "../../customUtils/workExperience";
import { formatLanguagesLabel } from "../../customUtils/languages";
import { formatWorkDaysLabel } from "../../customUtils/workDays";
import { doctorDisplayName } from "../../utils/doctorName";

/** Missing / unreadable picture: the bundled avatar instead of a broken image. */
const FALLBACK_PHOTO = "images/doctor-1.jpg";

/**
 * A certificate stored as a PDF (or any other document) cannot be rendered by
 * `next/image`, so it becomes a card that opens the file in a new tab. The link
 * is the whole card, so nothing is hidden behind a tiny target.
 */
const documentCardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  minHeight: "200px",
  padding: "18px 14px",
  border: "1px solid #dbe3ea",
  borderRadius: "10px",
  background: "#f7fafc",
  color: "#1d4ed8",
  textAlign: "center",
  textDecoration: "none",
};

const Doctor1Details = () => {
  const doctorInfo = useSelector((state) => state.allDoctorS.doctorInfo) || {};
  // A stored object can still be a document (legacy records uploaded before the
  // API refused them) or fail to load, so the <img> needs a fallback.
  const [photoFailed, setPhotoFailed] = useState(false);
  const [brokenCertificates, setBrokenCertificates] = useState([]);
  const {
    name,
    expertise,
    overview,
    educationTraining,
    workExperience,
    diplomasCertificatesUrls,
    language,
    workDays,
    doctorRegistrationNo,
    price,
    profilePictureUrl,
    serviceOffered,
    slotStartTime,
    slotEndTime,
  } = doctorInfo;

  console.log("Doctor Info: in doctor details page", doctorInfo);

  // Opening the page directly (refresh, bookmark) leaves no doctor in the store.
  if (!name) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <p>This doctor profile could not be found.</p>
        <Link href="/all-doctors">View all doctors</Link>
      </div>
    );
  }

  return (
    <>
      <section
        id="doctor-breadcrumbs"
        className="bg-fixed doctor-details-section division"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-7 offset-md-5">
              <div className="doctor-data white-color">
                {/* Name */}
                <h2 className="h2-xs">{doctorDisplayName(name)}</h2>
                <h5 className="h5-md">{expertise}</h5>
              </div>
            </div>
          </div>
          {/* End row */}
        </div>
        {/* End container */}
      </section>
      <section
        id="doctor-1-details"
        className="doctor-details-section division"
      >
        <div className="container">
          <div className="row">
            {/* DOCTOR PHOTO */}
            <div className="col-md-5">
              <div className="doctor-photo mb-40">
                {/* Photo */}
                <Image
                  placeholder="blur"
                  blurDataURL={imageBlurDataUrl}
                  width={300}
                  height={300}
                  className="img-fluid rounded-circle"
                  src={
                    isPreviewableImageUrl(profilePictureUrl) && !photoFailed
                      ? profilePictureUrl
                      : FALLBACK_PHOTO
                  }
                  alt="doctor-foto"
                  onError={() => setPhotoFailed(true)}
                />
                {/* Doctor Info */}
                <div className="doctor-info">
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <td>Areas of Expertise</td>
                        <td>
                          {serviceOffered.map((service, index) => (
                            <span key={index}>
                              <i className="fas fa-angle-double-right" />
                              {service}
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td>Language(s)</td>
                        <td>{formatLanguagesLabel(language)}</td>
                      </tr>
                      <tr>
                        <td>Registration No.</td>
                        <td>{doctorRegistrationNo || "Not provided"}</td>
                      </tr>
                      <tr className="last-tr">
                        <td>Work Days</td>
                        <td>{formatWorkDaysLabel(workDays) || "Not specified"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* End Doctor Info */}
                {/* Doctor Contacts */}

                {/* Buttons */}
                <div className="doctor-photo-btn text-center">
                  <Link
                    legacyBehavior
                    href={`/appointment?doctorId=${doctorInfo._id || ""}`}
                  >
                    <a className="btn btn-md btn-blue blue-hover">
                      Book an Appointment
                    </a>
                  </Link>
                  <Link
                    legacyBehavior
                    href={`/timetable?doctorId=${doctorInfo._id || ""}`}
                  >
                    <a className="btn btn-md btn-tra-grey grey-hover">
                      View Available Slot
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            {/* END DOCTOR PHOTO */}
            {/* DOCTOR'S BIO */}
            <div className="col-md-7">
              <div className="doctor-bio">
                {/* Title */}
                <h5 className="h5-md blue-color">Overview</h5>
                {/* Text - doctor's overview from the API response */}
                <p>{overview || "Not provided"}</p>

                {/* Title */}
                <h5 className="h5-md blue-color">Education + Trainings</h5>
                {/* Text - `educationTraining` is an array of entries */}
                <p>{formatEducationTrainingLabel(educationTraining)}</p>

                <h5 className="h5-md blue-color">Work Experience</h5>
                {/* Text - `workExperience` is an array of entries */}
                <p>{formatWorkExperienceLabel(workExperience)}</p>

                {/* CERTIFICATES */}
                <div className="certificates">
                  {/* Title */}
                  <h5 className="h5-md blue-color">
                    Diplomas and Certificates
                  </h5>
                  {/* Certificate Preview */}
                  <div className="row">
                    {/* Certificate Image, or a card for a PDF/document */}
                    {(diplomasCertificatesUrls || []).map((url, index) => (
                      <div className="col-md-4" key={index}>
                        <div className="certificate-preview mb-30">
                          {documentKind(url) === "image" &&
                          !brokenCertificates.includes(index) ? (
                            <Image
                              placeholder="blur"
                              blurDataURL={imageBlurDataUrl}
                              width={300}
                              height={200}
                              className="img-fluid"
                              src={url}
                              alt={`Certificate ${index + 1}`}
                              onError={() =>
                                setBrokenCertificates((previous) =>
                                  previous.includes(index)
                                    ? previous
                                    : [...previous, index]
                                )
                              }
                            />
                          ) : (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={documentCardStyle}
                            >
                              <i
                                className={`fas ${
                                  isPdfUrl(url)
                                    ? "fa-file-pdf"
                                    : "fa-file-alt"
                                }`}
                                style={{ fontSize: "34px" }}
                              />
                              <span className="fw-semibold">
                                Certificate {index + 1}
                              </span>
                              <small>
                                {isPdfUrl(url) ? "PDF document" : "Document"} -
                                open in a new tab
                              </small>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* END CERTIFICATES */}
              </div>
            </div>
            {/* END DOCTOR BIO */}
          </div>
          {/* End row */}
        </div>
        {/* End container */}
      </section>
    </>
  );
};

export default Doctor1Details;
