import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ViewDoctorListModel from "../model/ViewDoctorListModel";
import ViewDoctorListComp from "./ViewDoctorListComp";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";

const Tabs1 = () => {
  const [showDoctor, setShowDoctor] = useState(false);
  const doctors = useSelector((state) => state.allDoctorS.allDoctors);
  let filteredDoctors = null;
  // Initialize services with a list of services
  const [services] = useState([
    {
      id: 0,
      name: "General Physician",
      image: "/images/general_physicians.jpg",
      description:
        "General Physician: Your Health Partner.Feel better, faster. Our General Physicians provide trusted care for all your health needs. Choose between a convenient online consultation or an in-person visit. We're committed to reaching patients everywhere, making quality healthcare truly accessible. Receive your prescription instantly on your phone after your consultation.",
    },
    {
      id: 1,
      name: "Pediatrics",
      image: "/images/pediatrics.jpg",
      description: "Description of Pediatrics service...",
    },
    {
      id: 2,
      name: "Cardiology",
      image: "/images/Cardiology_700x700.jpeg",
      description: "Description of Cardiology service...",
    },
    {
      id: 3,
      name: "Dermatologist",
      image: "/images/dermalogist.jpg",
      description: "Description of Dermatologist service...",
    },
    {
      id: 4,
      name: "Orthopaedics",
      image: "/images/orthopedics.jpg",
      description: "Description of Orthopaedics...",
    },
    {
      id: 5,
      name: "Gynaecology",
      image: "/images/gynecologist.jpg",
      description: "Description of Gynaecology...",
    },
    {
      id: 6,
      name: "Ophthalmology",
      image: "/images/ophthalmology.jpg",
      description: "Description of Ophthalmology...",
    },
    {
      id: 7,
      name: "Pulmonology",
      image: "/images/pulmonology.jpg",
      description: "Description of Pulmonology...",
    },
    {
      id: 8,
      name: "Psychiatrist",
      image: "/images/Psychiatrist.jpg",
      description: "Description of Psychiatrist...",
    },
    {
      id: 9,
      name: "Dentistry",
      image: "/images/dentistry.jpg",
      description: "Description of Dentistry...",
    },
    {
      id: 10,
      name: "Physiotherapy",
      image: "/images/Physiotherapy.jpg",
      description: "Description of Physiotherapy...",
    },
    {
      id: 11,
      name: "Nursing care",
      image: "/images/nursing-care.png",
      description: "Description of Nursing care...",
    },
    {
      id: 12,
      name: "Home care",
      image: "/images/home-care.jpeg",
      description: "Description of Home care...",
    },
    {
      id: 13,
      name: "Medicine Delivery",
      image: "/images/medicine-delivery.jpg",
      description: "Description of Medicine Delivery...",
    },
    {
      id: 14,
      name: "Lab Investigation",
      image: "/images/lab-investigation.jpg",
      description: "Description of Lab Investigation...",
    },
    {
      id: 15,
      name: "Corporate Healthcare",
      image: "/images/corporate-healthcamp.jpg",
      description: "Description of Corporate Healthcare...",
    },
    {
      id: 16,
      name: "Healthcamp",
      image: "/images/heatlhcamp.jpg",
      description: "Description of Healthcamp...",
    },
    {
      id: 17,
      name: "Obstetrics",
      image: "/images/Obstetrics.jpg",
      description: "Description of Obstetrics...",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4;

  const router = useRouter();

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;

  // Slice the services array to get the services for the current page
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const handleServiceClick = (serviceName) => {
    filteredDoctors = doctors.filter((doctor) =>
      doctor.serviceOffered.some(
      (service) => service.toLowerCase() === serviceName.toLowerCase()
      )
    );
    console.log(
      `Filtered doctors for service ${serviceName}:`,
      filteredDoctors
    );
    router.push(
      `/department-single?serviceName=${serviceName
        .toLowerCase()
        .replace(/\s+/g, "-")}`
    );
    // setShowDoctor(true);
    // ${serviceName.toLowerCase().replace(/\s+/g, '-')}
    // Add your logic here for handling the service click
  };

  return (
    <section id="tabs-1" className="wide-100 tabs-section division">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <Tab.Container defaultActiveKey={`tab-${services[0].id}`}>
              <div id="tabs-nav" className="list-group text-center">
                <Nav
                  className="nav nav-pills justify-content-center"
                  id="pills-tab"
                  as="ul"
                >
                  {currentPage > 1 && (
                    <FaChevronLeft
                      className="nav-icon mt-3 mr-4"
                      onClick={handlePrevPage}
                      color="#8e8333"
                      size={30}
                    />
                  )}
                  {currentServices.map((service, index) => (
                    <Nav.Item className="nav-item icon-xs" key={index} as="li">
                      <Nav.Link className="nav-link" eventKey={`tab-${index}`}>
                        <b>{service.name}</b>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                  {indexOfLastService < services.length && (
                    <FaChevronRight
                      className="nav-icon mt-3 mr-4"
                      onClick={handleNextPage}
                      color="#8e8333"
                      size={30}
                    />
                  )}
                </Nav>
              </div>
              <Tab.Content className="tab-content" id="pills-tabContent">
                {currentServices.map((service, index) => (
                  <Tab.Pane
                    className="tab-pane fade"
                    key={index}
                    eventKey={`tab-${index}`}
                  >
                    <div className="row d-flex align-items-center">
                      <div className="col-lg-6">
                        <div className="tab-img">
                          <Image
                            width={500}
                            height={550}
                            src={service.image}
                            alt="tab-image"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="txt-block pc-30">
                          <h3
                            className="h3-md text- clickable-div"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={(e) =>
                              (e.target.style.color = "#0056b3")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.color = "black")
                            }
                            onClick={() => handleServiceClick(service.name)}
                          >
                            {service.name}
                          </h3>
                          <div className="h5 box-list grey-color">{service.description}</div>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
      <ViewDoctorListModel
        isOpen={showDoctor}
        onClose={() => {
          setShowDoctor(false);
        }}
      >
        <ViewDoctorListComp doctors={filteredDoctors} />
      </ViewDoctorListModel>
    </section>
  );
};

export default Tabs1;
