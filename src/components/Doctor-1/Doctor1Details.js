import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

import { formatEducationTrainingLabel } from "../../customUtils/educationTraining";
import { formatWorkExperienceLabel } from "../../customUtils/workExperience";
import { formatLanguagesLabel } from "../../customUtils/languages";
import { formatWorkDaysLabel } from "../../customUtils/workDays";
import { doctorDisplayName } from "../../utils/doctorName";

const Doctor1Details = () => {
  const doctorInfo = useSelector((state) => state.allDoctorS.doctorInfo) || {};
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
                  src={profilePictureUrl || "images/doctor-1.jpg"}
                  alt="doctor-foto"
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
                    {/* Certificate Image */}
                    {diplomasCertificatesUrls.map((url, index) => (
                      <div className="col-md-4" key={index}>
                        <div className="certificate-preview mb-30">
                          <Image
                            placeholder="blur"
                            blurDataURL={imageBlurDataUrl}
                            width={300}
                            height={200}
                            className="img-fluid"
                            src={url}
                            alt={`Certificate ${index + 1}`}
                          />
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
