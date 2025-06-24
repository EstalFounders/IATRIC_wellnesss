import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const Doctor1Details = () => {
  const doctorInfo = useSelector((state) => state.allDoctorS.doctorInfo);
  const {
    name,
    degree,
    expertise,
    educationTraining,
    diplomasCertificatesUrls,
    language,
    workDays,
    price,
    profilePictureUrl,
    serviceOffered,
    slotStartTime,
    slotEndTime,
  } = doctorInfo;

  console.log("Doctor Info: in doctor details page", doctorInfo);
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
                <h2 className="h2-xs">Dr. {name}</h2>
                <h5 className="h5-md">
                  {degree} | {expertise}
                </h5>
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
                        <td>Degrees</td>
                        <td>{degree}</td>
                      </tr>
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
                        <td>English / Spanish / German</td>
                      </tr>
                      <tr className="last-tr">
                        <td>Work Days</td>
                        <td>Tuesday - Thursday</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* End Doctor Info */}
                {/* Doctor Contacts */}

                {/* Buttons */}
                <div className="doctor-photo-btn text-center">
                  <Link legacyBehavior href="/appointment">
                    <a className="btn btn-md btn-blue blue-hover">
                      Book an Appointment
                    </a>
                  </Link>
                  <Link legacyBehavior href="/timetable">
                    <a className="btn btn-md btn-tra-grey grey-hover">
                      View Timetable
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            {/* END DOCTOR PHOTO */}
            {/* DOCTOR'S BIO */}
            <div className="col-md-7">
              <div className="doctor-bio">
                {/* Text */}
                <p>DOCTOR BIO</p>
                {/* Title */}
                <h5 className="h5-md blue-color">Education + Trainings</h5>
                {/* Text */}
                <p>{educationTraining}</p>

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
