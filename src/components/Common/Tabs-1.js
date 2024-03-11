import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Tabs1 = () => {
  const [services] = useState([
    {
      id: 0,
      name: "General Physician",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of General Physician service...",
    },
    {
      id: 1,
      name: "Pediatrics",
      image: "images/hematology_700x700.jpg",
      description: "Description of Pediatrics service...",
    },
    {
      id: 2,
      name: "Cardiology",
      image: "images/hematology_700x700.jpg",
      description: "Description of Cardiology service...",
    },
    {
      id: 3,
      name: "Dermatologist",
      image: "images/hematology_700x700.jpg",
      description: "Description of Dermatologist service...",
    },
    {
      id: 4,
      name: "Orthopaedics",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Orthopaedics...",
    },
    {
      id: 5,
      name: "Gynaecology",
      image: "images/hematology_700x700.jpg",
      description: "Description of Gynaecology...",
    },
    {
      id: 6,
      name: "Ophthalmology",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Ophthalmology...",
    },
    {
      id: 7,
      name: "Pulmonology",
      image: "images/hematology_700x700.jpg",
      description: "Description of Pulmonology...",
    },
    {
      id: 8,
      name: "Psychiatrist",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Psychiatrist...",
    },
    {
      id: 9,
      name: "Dentistry",
      image: "images/hematology_700x700.jpg",
      description: "Description of Dentistry...",
    },
    {
      id: 10,
      name: "Physiotherapy",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Physiotherapy...",
    },
    {
      id: 11,
      name: "Nursing care",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Nursing care...",
    },
    {
      id: 12,
      name: "Home care",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Home care...",
    },
    {
      id: 13,
      name: "Medicine Delivery",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Medicine Delivery...",
    },
    {
      id: 14,
      name: "Lab Investigation",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Lab Investigation...",
    },
    {
      id: 15,
      name: "Corporate Healthcare",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Corporate Healthcare...",
    },
    {
      id: 16,
      name: "Healthcamp",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Healthcamp...",
    },
    {
      id: 17,
      name: "Obstetrics",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Obstetrics...",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4;

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
                          <img
                            className="img-fluid"
                            src={service.image}
                            alt="tab-image"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="txt-block pc-30">
                          <h3 className="h3-md steelblue-color">
                            {service.name}
                          </h3>
                          <p className="mb-30">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Tab.Container>
            {/* <div className="navigation-icons text-center mt-1">
              {currentPage > 1 && (
                <FaChevronLeft
                  className="nav-icon"
                  onClick={handlePrevPage}
                  color="#8e8333"
                  size={30}
                />
              )}
              {indexOfLastService < services.length && (
                <FaChevronRight
                  className="nav-icon"
                  onClick={handleNextPage}
                  color="#8e8333"
                  size={30}
                />
              )}
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tabs1;
