import Link from "next/link";
import React, { useState, useEffect } from "react";
import { DoctorComponent } from "../Common/DoctorComponent";
import { api } from "../../constant";
import { useDispatch, useSelector } from "react-redux";
import { setAllDoctor } from "../../store/slices/superAdmin/homepageSlice";
import DoctorCard from "../Common/DoctorCard";

const DoctorsSection = () => {
  const doctors = useSelector((state) => state.allDoctorS.allDoctors);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(api.addDoctor);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const data = await response.json();
        dispatch(setAllDoctor(data));
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
              At Healthpath, we understand the importance of having access to
              reliable healthcare guidance, even beyond traditional office
              hours. That&apos;s why we offer a range of options to connect with
              a qualified healthcare professional, whenever you need it most.
            </p>
          </div>
        </div>
        {/* END SECTION TITLE */}
        <div className="row d-flex justify-content-center">
          {/* Map over the array of doctors to render each doctor component */}
          {doctors.slice(0, 3).map((doctor, index) => (
            <DoctorCard key={index} doctor={doctor} />
          ))}
        </div>
        {/* End row */}
        {/* ALL DOCTORS BUTTON */}
        <div className="row mt-4">
          <div className="col-md-12 text-center">
            <div className="all-doctors mb-40">
              <Link legacyBehavior href="/all-doctors">
                <a
                  className="btn btn-primary"
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
