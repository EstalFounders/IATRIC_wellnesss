// components/MostBookedCheckups.js
import Link from "next/link";
import { FaArrowAltCircleRight } from "react-icons/fa";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
  IoIosBody,
} from "react-icons/io";
import { color_schema, labtestCateogory } from "../../../constant";
import { PiVirusFill } from "react-icons/pi";
import { fetchLabTestsDetails } from "../apiService/HomePageService";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  getCategoryCheckup,
  getHealthCheckupData,
  handleCheckupCateogry,
} from "../common/CommonMethod";

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
      color: "bg-yellow-gradient",
      height: "",
      onClick: () =>
        handleCheckupCateogryLocal(labtestCateogory.fullBodyCheckup),
    },
    {
      title: "Sexual Health",
      icon: "",
      color: "bg-green-gradient",
      height: "h-50",
      onClick: () => handleCheckupCateogryLocal(labtestCateogory.sexualHealth),
    },
    {
      title: "Women’s Health",
      icon: "",
      color: "bg-green-gradient",
      height: "h-50",
      onClick: () => handleCheckupCateogryLocal("Full Body Checkup"),
    },
    {
      title: "Allergy Checkup",
      icon: <PiVirusFill size={50} />,
      color: "bg-yellow-gradient",
      height: "",
      onClick: () =>
        handleCheckupCateogryLocal(labtestCateogory.allergyTestCheckup),
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
          <Link href="/checkups">
            <div className="labtest-btn w-50 p-2 ml-auto mr-auto mt-4">
              View All Checkups
            </div>
          </Link>
        </div>

        {/* Right Grid Section */}
        <div className="col-lg-6">
          <div className="row">
            {checkups.map((item, index) => (
              <div
                className={`col-5 m-2 p-4 most-booked-checkup-style ${item.color} ${item.height} d-flex justify-content-center align-items-center`}
                onClick={() => item.onClick()}
                key={index}
              >
                <div className="row w-100">
                  <div className="row">
                    <div className="col text-white h4">{item.title}</div>
                    <div className="col">
                      {
                        <IoIosArrowDroprightCircle
                          color={color_schema.white}
                          size={30}
                        />
                      }
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
