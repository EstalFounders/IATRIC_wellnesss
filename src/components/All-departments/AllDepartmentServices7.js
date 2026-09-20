import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { HorizontalScrollContainer } from "../Common/HorizontalContainer";
import { callToBook, color_schema } from "../../constant";
import { handleServiceClick } from "../Common/commonMethod";
import { useRouter } from "next/router";
import { AllDepartmentService } from "../../../data/services";
import { GeneralPhysician } from "../../../public/svgIcon/all-department-svg-icon";
import { ConsultationButton } from "../Common/commonUi";
import { mergeServiceLists, useGlobalData } from "../../customUtils/useGlobalData";

const AllDepartmentServices7 = () => {
  // Single source of truth: globalData slice speciality list; icon/description
  // presentation comes from the static list, keyed by name.
  const { speciality } = useGlobalData();
  const services = useMemo(
    () => mergeServiceLists(speciality, AllDepartmentService),
    [speciality]
  );

  const router = useRouter();
  const handleClickService = (serviceName, index) => {
    handleServiceClick(serviceName, index, router);
  };

  return (
    <section
      id="services-7"
      className="bg-lightgrey py-5 servicess-section division"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <h3 className="h3-md">Our Medical Services</h3>
          <div className="blue-color text-uppercase mt-4">
            <h4>Comprehensive, Specialized & Caring</h4>
          </div>

          <div className="h5 box-list grey-color ml-auto mr-auto">
            Explore our range of expert medical services tailored to meet the
            health needs of you and your family. From diagnostics to specialist
            care — we’ve got you covered.
          </div>
        </div>

        {/* Services Cards */}
        <div className="row">
          <HorizontalScrollContainer>
            {services.map((service, idx) => (
              <div
                key={idx}
                className="col-md-4 col-sm-6"
                style={{ minWidth: "500px" }}
                onClick={() => handleClickService(service.title, idx)}
              >
                <div
                  className="bg-white p-4 shadow-sm mb-4 h-100 d-flex flex-column align-items-center text-center"
                  style={{ borderRadius: "10px" }}
                >
                  <Link legacyBehavior href="">
                    <a className="text-decoration-none text-dark w-100">
                      {/* Icon in Circle */}
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                        style={{
                          width: "120px",
                          height: "120px",
                          // backgroundColor: `${color_schema.yellow}`,
                        }}
                      >
                        {service.icon || <GeneralPhysician />}
                      </div>

                      {/* Text content with hover-only effect */}
                      <div
                        className="p-3 rounded"
                        style={{
                          transition: "all 0.3s ease-in-out",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.boxShadow =
                            "0 8px 20px rgba(0, 0, 0, 0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.boxShadow = "none")
                        }
                      >
                        <h5 className="fw-bold text-dark mb-2">
                          {service.title}
                        </h5>
                        <p
                          className="text-muted"
                          style={{
                            lineHeight: "1.6",
                            fontSize: "0.95rem",
                          }}
                        >
                          {service.description}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </HorizontalScrollContainer>
          <div className="mt-5 mr-auto ml-auto">
            <div className="">
              <ConsultationButton path={"/appointment"}>
                {callToBook}
              </ConsultationButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllDepartmentServices7;
