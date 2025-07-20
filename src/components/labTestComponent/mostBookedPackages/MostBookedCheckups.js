import React from "react";
import { IoIosBody, IoIosArrowDroprightCircle } from "react-icons/io";
import { PiVirusFill } from "react-icons/pi";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getCategoryCheckup, handleCheckupCateogry } from "../common/CommonMethod";

// Assuming color_schema is defined elsewhere
const color_schema = {
  white: "#FFFFFF",
  // ... other colors
};

export default function MostBookedCheckups() {
  const categoryDetails = useSelector(
    (state) => state.labtestHomepage.categoryDetails
  );
  const healthCheckupData = useSelector(
    (state) => state.labtestHomepage.allCheckUpDetails
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const handleCheckupCateogryLocal = (category) => {
    const viewCheckupData = getCategoryCheckup(
      category,
      healthCheckupData,
      categoryDetails
    );
    handleCheckupCateogry(dispatch, router, viewCheckupData, category);
  };
  const checkups = [
    {
      title: "Full Body Checkup",
      icon: <IoIosBody size={50} />,
      color: "bg-green-gradient",
      height: "",
      onClick: (index) => handleCheckupCateogryLocal("Full Body Checkup", index),
    },
    {
      title: "Sexual Health",
      icon: "", // Assuming you'll add an icon here
      color: "bg-yellow-gradient",
      height: "h-50",
      onClick: (index) => handleCheckupCateogryLocal("Sexual Health", index),
    },
    {
      title: "Women’s Health",
      icon: "", // Assuming you'll add an icon here
      color: "bg-yellow-gradient",
      height: "h-50",
      onClick: (index) => handleCheckupCateogryLocal("Women’s Health", index),
    },
    {
      title: "Allergy Checkup",
      icon: <PiVirusFill size={50} />,
      color: "bg-green-gradient",
      height: "",
      onClick: (index) => handleCheckupCateogryLocal("Allergy Checkup", index),
    },
  ];

  return (
    <section className="container py-5">
      <div className="row align-items-center">
        {/* Left Text Section */}
        <div className="col-lg-6 mb-4 mb-lg-0 text-center text-lg-start">
          <h2 className="fw-bold">Most Booked Checkups</h2>
          <p className="text-muted mt-3">
            India’s fastest AI powered & temperature-controlled supply chain to
            collect and test your blood in freshest state.
          </p>
            <div className="labtest-btn w-50 p-2 ml-auto mr-auto mt-4" onClick={() => router.push('/labTest/viewAllCheckups')}>
              View All Checkups
            </div>
        </div>

        {/* Right Grid Section */}
        <div className="col-lg-6">
          <div className="row">
            {checkups.map((item, index) => (
              <div
                key={index}
                className={`col-5 m-2 p-4 most-booked-checkup-style ${item.color} ${item.height} d-flex justify-content-center align-items-center`}
                onClick={() => item.onClick(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="row w-100">
                  <div className="row">
                    <div className="col text-white h4">{item.title}</div>
                    {/* ADDED CLASS HERE: 'checkup-arrow-col' */}
                    <div className="col checkup-arrow-col">
                      {/* react-icons render SVG elements */}
                      <IoIosArrowDroprightCircle
                        color={color_schema.white}
                        size={30}
                        // No inline className for Tailwind here
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">{item.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}