import { useSelector } from "react-redux";
import About5 from "../src/components/Common/About-5";
import DepartmentDoctors1 from "../src/components/Department-single/DepartmentDoctors1";
import DepartmentPage from "../src/components/Department-single/DepartmentPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DepartmentSingle = () => {
  const doctors = useSelector((state) => state.allDoctorS.allDoctors);
  let filterDoctors;
  const router = useRouter();
  const { serviceName } = router.query;
  const service = serviceName
    ? serviceName
        .replace(/-/g, " ")
        .replace(/\b\w/, (char) => char.toUpperCase())
    : "Department";

  filterDoctors = doctors.filter((doctor) =>
    doctor.serviceOffered.some((offeredService) =>
      offeredService.toLowerCase().includes(service.toLowerCase())
    )
  );

  useEffect(() => {
    if (!service) {
      console.log("No service name provided in the URL.");
    } else {
      console.log(`Service Name: ${service}`);
    }
  }, [service]);

  console.log("Doctors:", filterDoctors);
  return (
    <Layouts>
      <PageBanner
        pageTitle={service}
        motherTitle="Departments"
        url="departments"
      />
      <DepartmentPage serviceName={service} />
      <DepartmentDoctors1 serviceName={service} doctors={filterDoctors} />
      <About5 />
    </Layouts>
  );
};

export default DepartmentSingle;
