import Link from "next/link";
import FilterBar from "../filterbar/filterbar";
import React, { useState, useEffect } from "react";
import { DoctorComponent } from "../Common/DoctorComponent";
import { api } from "../../constant";

const AllDoctorsDoctors3 = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Fetch data from API when component mounts
    const fetchData = async () => {
      try {
        const response = await fetch(api.addDoctor);
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array ensures the effect runs only once

  const getSelectedFilter = (option) => {
    console.log(option, "testing in all doctors3");
  };

  return (
    <section
      id="doctors-3"
      className="bg-lightgrey wide-60 doctors-section division"
    >
      <FilterBar selectFilter={getSelectedFilter} />
      <div className="container">
        <div className="row mt-4">
          {doctors.map((doctor, index) => (
            <DoctorComponent key={index} doctor={doctor} />
          ))}
          {/* END DOCTOR #9 */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default AllDoctorsDoctors3;
