import Link from "next/link";
import React from "react";
import FilterBar from "../filterbar/filterbar";

const AllDoctorsDoctors3 = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr Alex Barnes D.M.",
      specialization: "Chief Medical Officer",
      gender: "Male",
      experience: "27+ year",
      image: "images/doctor-1.jpg",
      link: "/doctor-1",
    },
    {
      id: 2,
      name: "Hannah Harper D.M.",
      specialization: "Anesthesiologist",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-2.jpg",
      link: "/doctor-2",
    },
    {
      id: 3,
      name: "Matthew Anderson D.M.",
      specialization: "Cardiology",
      gender: "Mame",
      experience: "27+ year",
      image: "images/doctor-3.jpg",
      link: "/doctor-3",
    },
    {
      id: 4,
      name: "Megan Coleman D.M.",
      specialization: "Neurosurgeon",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-4.jpg",
      link: "/doctor-4",
    },
    {
      id: 4,
      name: "Megan Coleman D.M.",
      specialization: "Neurosurgeon",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-4.jpg",
      link: "/doctor-4",
    },
    {
      id: 4,
      name: "Megan Coleman D.M.",
      specialization: "Neurosurgeon",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-4.jpg",
      link: "/doctor-4",
    },
    {
      id: 1,
      name: "Dr Alex Barnes D.M.",
      specialization: "Chief Medical Officer",
      gender: "Male",
      experience: "27+ year",
      image: "images/doctor-1.jpg",
      link: "/doctor-1",
    },
    {
      id: 2,
      name: "Hannah Harper D.M.",
      specialization: "Anesthesiologist",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-2.jpg",
      link: "/doctor-2",
    },
    {
      id: 3,
      name: "Matthew Anderson D.M.",
      specialization: "Cardiology",
      gender: "Male",
      experience: "27+ year",
      image: "images/doctor-3.jpg",
      link: "/doctor-3",
    },
    {
      id: 4,
      name: "Megan Coleman D.M.",
      specialization: "Neurosurgeon",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-4.jpg",
      link: "/doctor-4",
    },
    {
      id: 4,
      name: "Megan Coleman D.M.",
      specialization: "Neurosurgeon",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-4.jpg",
      link: "/doctor-4",
    },
    {
      id: 4,
      name: "Megan Coleman D.M.",
      specialization: "Neurosurgeon",
      gender: "Female",
      experience: "27+ year",
      image: "images/doctor-4.jpg",
      link: "/doctor-4",
    },
  ];

  const getSelectedFilter = (option) => {
    console.log(option, "testing in all doctors3");
};

  return (
    <section
      id="doctors-3"
      className="bg-lightgrey wide-60 doctors-section division"
    >
      <FilterBar selectFilter={getSelectedFilter} />
      <div className="container">
        <div className="row mt-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="col-md-6 col-lg-4">
              <div className="doctor-2">
                {/* Doctor Photo */}
                <div className="hover-overlay">
                  <img
                    className="img-fluid"
                    src={doctor.image}
                    alt="doctor-foto"
                  />
                </div>
                {/* Doctor Meta */}
                <div className="doctor-meta">
                  <h5 className="h5-xs blue-color">{doctor.name}</h5>
                  <span>{doctor.specialization}</span>
                  <span>{doctor.experience}</span>
                  <span>{doctor.gender}</span>
                  {/* Button */}
                  <Link legacyBehavior href={doctor.link}>
                    <a className="btn btn-sm btn-blue blue-hover mt-15" title>
                      View Profile
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {/* END DOCTOR #9 */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default AllDoctorsDoctors3;
