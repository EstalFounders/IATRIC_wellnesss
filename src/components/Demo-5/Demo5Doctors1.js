import Link from "next/link";
import React, { useState, useEffect } from "react";

// Component to represent each doctor
const DoctorComponent = ({ doctor }) => (
  <div className="col-md-6 col-lg-3">
    <div className="doctor-1">
      {/* Doctor Photo */}
      <div className="hover-overlay text-center">
        {/* Photo */}
        <img
          className="img-fluid"
          src={doctor.profilePictureUrl}
          alt="doctor-foto"
        />
        <div className="item-overlay" />
        {/* Profile Link */}
        <div className="profile-link">
          <Link legacyBehavior href={`/doctor/${doctor.id}`}>
            <a
              className="btn btn-sm btn-tra-white black-hover"
              style={{ backgroundColor: "#3b5f1d" }}
              title
            >
              View More Info
            </a>
          </Link>
        </div>
      </div>
      {/* Doctor Meta */}
      <div className="doctor-meta">
        <h5 className="h5-sm steelblue-color">{doctor.name}</h5>
        <span className="blue-color">{doctor.specialization}</span>
        <p className="p-sm grey-color">{doctor.description}</p>
      </div>
    </div>
  </div>
);

const DoctorsSection = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Fetch data from API when component mounts
    const fetchData = async () => {
      try {
        const response = await fetch("/api/addDoctor");
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <section id="doctors-1" className="wide-40 doctors-section division">
      <div className="container">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title */}
            <h3 className="h3-md steelblue-color">Our Medical Specialists</h3>
            {/* Text */}
            <p>
              At Iatric Healthcare, we understand the importance of having
              access to reliable healthcare guidance, even beyond traditional
              office hours. That&apos;s why we offer a range of options to
              connect with a qualified healthcare professional, whenever you
              need it most.
            </p>
          </div>
        </div>
        {/* END SECTION TITLE */}
        <div className="row">
          {/* Map over the array of doctors to render each doctor component */}
          {doctors.map((doctor, index) => (
            <DoctorComponent key={index} doctor={doctor} />
          ))}
        </div>
        {/* End row */}
        {/* ALL DOCTORS BUTTON */}
        <div className="row">
          <div className="col-md-12 text-center">
            <div className="all-doctors mb-40">
              <Link legacyBehavior href="/all-doctors">
                <a
                  className="btn btn-blue blue-hover"
                  style={{ backgroundColor: "#3b5f1d" }}
                >
                  Meet All Doctors
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default DoctorsSection;
