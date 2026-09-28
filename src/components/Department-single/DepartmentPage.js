import Link from "next/link";
import React, { useMemo } from "react";
import { servicesData } from "../../../data/services";
import {
  mergeServiceLists,
  slugifyService,
  useGlobalData,
} from "../../customUtils/useGlobalData";

const DepartmentPage = ({ serviceName, id }) => {
  // Single source of truth: globalData slice speciality list (falls back to the
  // static servicesData list), matched by name/slug first, static id second.
  const { speciality } = useGlobalData();
  const serviceInfo = useMemo(
    () => mergeServiceLists(speciality, servicesData, "name"),
    [speciality]
  );

  const departmentDetails = serviceInfo.find((service) => {
    const target = String(serviceName || "").toLowerCase();
    const sameName = String(service.name || "").toLowerCase() === target;
    const sameSlug =
      slugifyService(service.name) === slugifyService(serviceName);
    const sameId =
      id !== undefined &&
      service.id !== undefined &&
      String(service.id) === String(id);
    return sameName || sameSlug || sameId;
  });

  if (!departmentDetails) {
    return (
      <div className="department-page">
        <section
          id="department-page"
          className="wide-60 department-section division"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h3 className="h3-md text-center mb-3">Department Not Found</h3>
                <p className="h5 box-list grey-color text-center">
                  The requested department is no longer available. Please browse
                  our full list of departments.
                </p>
                <div className="d-flex justify-content-center align-items-center p-4">
                  <Link href="/all-departments" className="btn btn-primary">
                    View All Departments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="department-page">
      <section
        id="department-page"
        className="wide-60 department-section division"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3 className="h3-md text-center mb-3">
                {departmentDetails.name}
              </h3>
              <p className="h5 box-list grey-color">
                {departmentDetails.description}
              </p>
              <p className="info">{departmentDetails.info}</p>
              <div className="d-flex justify-content-center align-items-center p-4">
                <Link href="/all-departments" className="btn btn-primary">
                  View All Departments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DepartmentPage;
