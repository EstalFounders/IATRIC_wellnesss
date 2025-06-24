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
            <span className="section-id blue-color">
              <h4>Connect with Expert Online Doctors Anytime</h4>
            </span>
            <h3 className="h3-md steelblue-color">Our Medical Specialists</h3>
            {/* Text */}
            <p>
              At Healthpath, we believe <strong>expert healthcare guidance</strong> should always be within reach. That's why our team of <strong>highly qualified medical specialists</strong> is available to provide you with reliable advice and support, <strong>even beyond traditional office hours</strong>.
            </p>
            <p> <br></br>
              We understand life doesn't follow a 9-to-5 schedule. That's why we offer a range of convenient options to <strong>connect with a certified healthcare professional</strong> precisely when you need it most. Whether you're seeking a <strong>virtual consultation</strong>, need urgent advice, or simply have a health question, our <strong>online doctors</strong> are here to ensure you receive timely, expert care from the comfort of your home. Get peace of mind with Healthpath's accessible and <strong>reliable telemedicine services</strong>.
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
