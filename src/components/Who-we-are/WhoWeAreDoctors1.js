import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import DoctorCard from "../Common/DoctorCard";
import { ConsultationButton } from "../Common/commonUi";

const WhoWeAreDoctors1 = () => {
  const doctors = useSelector((state) => state.allDoctorS.allDoctors);
  return (
    <section id="doctors-1" className="wide-40 doctors-section division">
      <div className="container">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md steelblue-color">Our Medical Specialists</h3>
            {/* Text */}
            <p className="h5 box-list grey-color">
              Aliquam a augue suscipit, luctus neque purus ipsum neque dolor
              primis libero at tempus, blandit posuere ligula varius congue
              cursus porta feugiat
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
        {/* END DOCTOR #2 */}
        {/* DOCTOR #3 */}

        {/* END DOCTOR #3 */}
        {/* DOCTOR #4 */}

        {/* END DOCTOR #4 */}
      </div>
      {/* End row */}
      {/* ALL DOCTORS BUTTON */}
      <div className="row mt-4">
        <div className="col-md-12 text-center">
          <div className="all-doctors mb-40 w-25 mr-auto ml-auto">
            <ConsultationButton
              path={"/all-doctors"}
            >
              MEET THE DOCTORS
            </ConsultationButton>
          </div>
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default WhoWeAreDoctors1;
