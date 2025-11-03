import Link from "next/link";
import React from "react";
import ViewDoctorListComp from "../Common/ViewDoctorListComp";
import { ConsultationButton } from "../Common/commonUi";

const DepartmentDoctors1 = ({ serviceName, doctors }) => {
  console.log("Doctors in DepartmentDoctors1:", doctors);

  return (
    <div>
      <div className="h1 text-center">Our {serviceName} Specialists</div>
      <div className="d-flex justify-content-center align-items-center">
        <ViewDoctorListComp doctors={doctors} />
      </div>
      <div className="d-flex justify-content-center align-items-center p-4">
        <ConsultationButton path={'/all-doctors'}>View All Doctors</ConsultationButton>
      </div>
    </div>
  );
};

export default DepartmentDoctors1;
