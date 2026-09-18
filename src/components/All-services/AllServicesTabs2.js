import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { servicesData } from "../../../data/services";
import { ConsultationButton } from "../Common/commonUi";
import { VscCircleSmallFilledCompact } from "react-icons/vsc";

const AllServicesTabs2 = () => {
  const [services] = useState(servicesData);
  return (
    <section id="tabs-2" className="wide-100 tabs-section division">
      <div className="container">
        <Tab.Container defaultActiveKey={services[0].key}>
          <div className="row">
            {/* TABS NAVIGATION */}
            <div className="col-lg-4">
              <div
                className="list-group text-center clearfix"
                style={{
                  maxHeight: "800px",
                  overflowY: "auto",
                  minHeight: "300px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "10px",
                  background: "#fff",
                }}
              >
                <Nav className="nav nav-pills" id="pills-tab" as="ul">
                  {services.map((service) => (
                    <Nav.Item
                      className="nav-item icon-xs"
                      as="li"
                      key={service.key}
                    >
                      <Nav.Link eventKey={service.key} href={`#${service.key}`}>
                        {service.name}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>
            </div>
            {/* END TABS NAVIGATION */}
            {/* TABS CONTENT */}
            <div className="col-lg-8 h5 box-list grey-color">
              <Tab.Content className="tab-content" id="pills-tabContent">
                {services.map((service) => (
                  <Tab.Pane
                    className="tab-pane fade"
                    eventKey={service.key}
                    role="tabpanel"
                    aria-labelledby={`${service.key}-list`}
                    key={service.key}
                  >
                    {/* Title */}
                    <h3 className="h3-md text-dark">{service.name}</h3>
                    {/* Text */}
                    <div>{service.content[0]}</div>
                    {/* Image */}
                    <div className="tab-img">
                      <Image
                        className="img-fluid"
                        src={service.image}
                        width={800}
                        height={200}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "280px",
                        }}
                        alt="tab-image"
                      />
                    </div>
                    {/* Text */}
                    <div>{service.content[1]}</div>
                    {/* Options List */}
                    <div className="row">
                      {[0, 1, 2].map((col) => (
                        <div className="col-xl-6" key={col}>
                          {[0, 1, 2].map((row) => {
                            const idx = col * 3 + row;
                            if (service.options[idx]) {
                              return (
                                <div className="box-list" key={idx}>
                                  <div className="box-list-icon blue-color">
                                    <VscCircleSmallFilledCompact />
                                  </div>
                                  <div>{service.options[idx]}</div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ))}
                    </div>
                    {/* End Options List */}
                    {/* Button */}
                    <div className="mt-5 d-flex justify-content-center">
                      <div className="w-50">
                        <ConsultationButton path={"/appointment"}>
                          Book Consultation
                        </ConsultationButton>
                      </div>
                    </div>
                  </Tab.Pane>
                ))}
              </Tab.Content>
              {/* END TABS CONTENT */}
            </div>
          </div>
        </Tab.Container>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default AllServicesTabs2;
