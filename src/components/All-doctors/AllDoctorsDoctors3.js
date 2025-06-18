import Link from "next/link";
import FilterBar from "../filterbar/filterbar";
import React, { useState, useEffect } from "react";
import { DoctorComponent } from "../Common/DoctorComponent";
import { api } from "../../constant";
import { useDispatch, useSelector } from "react-redux";
import { setAllDoctors } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import DoctorCard from "../Common/DoctorCard";

const AllDoctorsDoctors3 = () => {
  const [doctors, setDoctors] = useState([]);
  const storedDoctors = useSelector((state) => state.allDoctorS.allDoctors);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      // Check if data is stored in session storage
      
      // sessionStorage.getItem("doctors");
      console.log(storedDoctors, "testing in all doctors2");
      if (storedDoctors) {
        setDoctors(storedDoctors); // Parse and set to state
      } else {
        try {
          const response = await fetch(api.addDoctor);
          if (!response.ok) {
            throw new Error("Failed to fetch");
          }
          const data = await response.json();
          // sessionStorage.setItem("doctors", JSON.stringify(data)); // Store fetched data in session storage
          dispatch(setAllDoctors(data));
          setDoctors(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
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
        <div className="row mt-4 d-flex justify-content-center">
          {doctors.map((doctor, index) => (
            <div className="px-2">
            <DoctorCard key={index} doctor={doctor} />
            </div>
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
