import Link from "next/link";
import React from "react";
import ViewDoctorListComp from "../Common/ViewDoctorListComp";
import { ConsultationButton } from "../Common/commonUi";

const DepartmentDoctors1 = ({ serviceName, doctors }) => {
  const doctorCount = doctors?.length || 0;

  return (
    <div>
      {/* The count makes the roster unmistakable: a speciality staffed by 7
          doctors must read 7 here, not one card that lazily hid the rest. */}
      <div className="h1 text-center">
        Our {serviceName} Specialists
        {doctorCount ? ` (${doctorCount})` : ""}
      </div>
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
