import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import Link from "next/link";
import React, { useMemo } from "react";
import { Nav, Tab } from "react-bootstrap";
import { servicesData } from "../../../data/services";
import { ConsultationButton } from "../Common/commonUi";
import { VscCircleSmallFilledCompact } from "react-icons/vsc";
import {
  mergeServiceLists,
  slugifyService,
  useGlobalData,
} from "../../customUtils/useGlobalData";

// Fallback artwork for items that exist in the DB but not in the static list yet.
const DEFAULT_SERVICE_IMAGE = "/images/general_physicians.jpg";

const AllServicesTabs2 = () => {
  // Single source of truth: globalData slice speciality list (falls back to the
  // static servicesData list until the API has answered).
  const { speciality } = useGlobalData();
  const services = useMemo(() => {
    const merged = mergeServiceLists(speciality, servicesData, "name");
    // Static services that ship their own detail page (the `service` key maps to a
    // ServiceDetailsComponent block) are always listed, even when the API's
    // speciality list does not carry them yet.
    const missing = servicesData.filter(
      (item) =>
        item.service &&
        !merged.some(
          (service) =>
            String(service.name || "").toLowerCase() ===
            String(item.name || "").toLowerCase()
        )
    );

    return [...merged, ...missing].map((item) => ({
      ...item,
      key: item.key || slugifyService(item.name),
      content: item.content || [item.description || "", ""],
      options: item.options || [],
      image: item.image || DEFAULT_SERVICE_IMAGE,
    }));
  }, [speciality]);

  return (
    <section id="tabs-2" className="wide-100 tabs-section division">
      <div className="container">
        <Tab.Container defaultActiveKey={services[0]?.key}>
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
                        placeholder="blur"
                        blurDataURL={imageBlurDataUrl}
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
                        {/* Services with their own detail page (e.g. Corporate
                            Healthcare) link there; everything else keeps booking. */}
                        <ConsultationButton
                          path={service.detailsLink || "/appointment"}
                        >
                          {service.detailsLink ? "View Details" : "Book Consultation"}
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
