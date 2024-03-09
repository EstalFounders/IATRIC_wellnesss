import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Tabs1 = () => {
  const [services] = useState([
    {
      id: 0,
      name: "Pediatrics",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Pediatrics service...",
    },
    {
      id: 1,
      name: "Hematology",
      image: "images/hematology_700x700.jpg",
      description: "Description of Hematology service...",
    },
    {
      id: 2,
      name: "MRI Diagnostic",
      image: "images/hematology_700x700.jpg",
      description: "Description of MRI Diagnostic service...",
    },
    {
      id: 3,
      name: "X-Ray Diagnostic",
      image: "images/hematology_700x700.jpg",
      description: "Description of X-Ray Diagnostic service...",
    },
    {
      id: 4,
      name: "Service 5",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 5...",
    },
    {
      id: 5,
      name: "Service 6",
      image: "images/hematology_700x700.jpg",
      description: "Description of Service 6...",
    },
    {
      id: 6,
      name: "Service 7",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 7...",
    },
    {
      id: 7,
      name: "Service 8",
      image: "images/hematology_700x700.jpg",
      description: "Description of Service 8...",
    },
    {
      id: 8,
      name: "Service 9",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 9...",
    },
    {
      id: 9,
      name: "Service 10",
      image: "images/hematology_700x700.jpg",
      description: "Description of Service 10...",
    },
    {
      id: 10,
      name: "Service 11",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 11...",
    },
    {
      id: 11,
      name: "Service 12",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 12...",
    },
    {
      id: 12,
      name: "Service 13",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 13...",
    },
    {
      id: 13,
      name: "Service 14",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 14...",
    },
    {
      id: 14,
      name: "Service 15",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 15...",
    },
    {
      id: 15,
      name: "Service 16",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 16...",
    },
    {
      id: 16,
      name: "Service 17",
      image: "images/pediatrics_700x700.jpg",
      description: "Description of Service 17...",
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
                <Nav className="nav nav-pills" id="pills-tab" as="ul">
                  {currentServices.map((service, index) => (
                    <Nav.Item className="nav-item icon-xs" key={index} as="li">
                      <Nav.Link className="nav-link" eventKey={`tab-${index}`}>
                        {/* <span> */}
                        <b>{service.name}</b>
                        {/* </span> */}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
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
            <div className="navigation-icons">
              {currentPage > 1 && (
                <FaChevronLeft
                  className="nav-icon"
                  onClick={handlePrevPage}
                  color="#8e8333"
                />
              )}
              {indexOfLastService < services.length && (
                <FaChevronRight
                  className="nav-icon"
                  onClick={handleNextPage}
                  color="#8e8333"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tabs1;
