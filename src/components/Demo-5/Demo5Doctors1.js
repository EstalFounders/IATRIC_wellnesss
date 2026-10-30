import Link from "next/link";
import React from "react";
import { DoctorComponent } from "../Common/DoctorComponent";
import { useDoctors } from "../../customUtils/useDoctors";
import DoctorCard from "../Common/DoctorCard";
import { ConsultationButton } from "../Common/commonUi";

const DoctorsSection = () => {
  // Shared redux roster (cache first, API only when empty).
  const { doctors } = useDoctors();

  return (
    <section id="doctors-1" className="wide-40 doctors-section division">
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title */}
            <span className="section-id blue-color">
              <h4>Connect with Expert Online Doctors Anytime</h4>
            </span>
            <h3 className="h3-md text-dark">Our Medical Specialists</h3>
            {/* Text */}
            <div>
              At Healthpath, we believe{" "}
              <strong>expert healthcare guidance</strong> should always be
              within reach. That&apos;s why our team of{" "}
              <strong>highly qualified medical specialists</strong> is available
              to provide you with reliable advice and support,{" "}
              <strong>even beyond traditional office hours</strong>.
            </div>
            <div>
              {" "}
              <br></br>
              We understand life doesn&apos;t follow a 9-to-5 schedule.
              That&apos;s why we offer a range of convenient options to{" "}
              <strong>
                connect with a certified healthcare professional
              </strong>{" "}
              precisely when you need it most. Whether you&apos;re seeking a{" "}
              <strong>virtual consultation</strong>, need urgent advice, or
              simply have a health question, our <strong>online doctors</strong>{" "}
              are here to ensure you receive timely, expert care from the
              comfort of your home. Get peace of mind with Healthpath&apos;s
              accessible and <strong>reliable telemedicine services</strong>.
            </div>
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
            <div className="all-doctors mb-40 w-75 w-md-25 mr-auto ml-auto">
              <ConsultationButton path={"/all-doctors"}>
                Meet the Doctors
              </ConsultationButton>
            </div>
          </div>
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default DoctorsSection;
