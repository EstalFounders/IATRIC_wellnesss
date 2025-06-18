import Link from "next/link";
import React from "react";

const DepartmentPage = ({ serviceName }) => {
  const serviceInfo = {
    Cardiology: {
      title: "Cardiology Department",
      description: "Providing expert care for heart-related conditions and treatments.",
      info: "Our cardiology team is equipped with state-of-the-art technology to ensure the best outcomes."
    },
    Neurology: {
      title: "Neurology Department",
      description: "Specialized care for neurological disorders and treatments.",
      info: "We focus on advanced diagnostics and therapies for brain and nervous system health."
    },
    Pediatrics: {
      title: "Pediatrics Department",
      description: "Comprehensive care for children and adolescents.",
      info: "Our pediatricians are dedicated to ensuring the health and well-being of your child."
    }
  };

  const departmentDetails = serviceInfo[serviceName] || {
    title: `${serviceName} Department`,
    description: `Welcome to the ${serviceName} department. Here, we provide specialized care and services tailored to your needs.`,
    info: "Contact us for more information about our services."
  };

  return (
    <div className="department-page">
      <section id="department-page" className="wide-60 department-section division">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h2 className="h2-md">{departmentDetails.title}</h2>
              <p>{departmentDetails.description}</p>
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
