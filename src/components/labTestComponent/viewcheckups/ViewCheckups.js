// components/ViewCheckupsPage.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import HealthCheckupCard from "../common/HealthCheckupCard";
import { ConsultationButton } from "../../Common/commonUi";

const ViewCheckupsPage = () => {
  const router = useRouter();
  const { category } = router.query;
  console.log(category, 'category in vie wcheckip page')

  const healthCheckupData = useSelector(
    (state) => state.labtestHomepage.viewCheckups
  );

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <h1 className="text-dark">{category}</h1>
        <p className="lead text-muted">
          Explore our curated range of {category} health packages.
        </p>
      </header>

      <div className="row gy-4">
        {healthCheckupData?.length > 0 ? (
          healthCheckupData.map((checkup) => (
            <div key={checkup.id} className="col-12 col-md-6 col-lg-4">
              <HealthCheckupCard healthCheckupData={checkup} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              No health checkups found in this category. Try another.
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 text-center">
        <div
          className="labtest-btn w-25 font-weight-bold mr-auto ml-auto py-3"
          onClick={() => router.back()}
        >
          ← Back
        </div>
      </div>
    </div>
  );
};

export default ViewCheckupsPage;
