import Link from "next/link";
import React, { useEffect } from "react";
import { color_schema } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useRouter } from "next/router";
import { fetchBasicConfiguration } from "../ApiService/UtilService";
import { useDispatch } from "react-redux";

const Demo5Hero5 = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchBasicConfiguration(dispatch);
  }, []);

  return (
    <section id="hero-5" className="bg-fixed hero-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* HERO TEXT */}
          <div className="col-md-9 col-lg-7 col-xl-6">
            <div
              className="hero-5-strip bg-blue white-color"
              style={{ backgroundColor: `${color_schema.green}` }}
            >
              <div className="h2 m-0 font-weight-bold">HealthPath Provides</div>
            </div>
            <div className="hero-txt">
              {/* Title */}
              <h4
                className="steelblue-color"
                style={{ color: `${color_schema.yellow}` }}
              >
                <div style={{ fontSize: "1.8rem", fontWeight: "600" }}>Best Quality</div>
              </h4>
              <h3 className="steelblue-color">
                Medical treatment for you and your family
              </h3>
              {/* CONTENT BOX #1 */}
              <div className="box-list grey-color">
                <div className="box-list-icon">
                  {/* <i className="fas fa-genderless" /> */}
                </div>
                <div className="h5 mx-auto steelblue-color">
                  Get optimal health ,{" "}
                  <strong style={{ color: `${color_schema.green}` }}>
                    ANYTIME , ANYWHERE !
                  </strong>{" "}
                  <br />
                  <br />
                  <b style={{color: '#3b5f1d'}}>One-stop care:</b> Consult top doctors online, visit our clinic,
                  or get home visits & lab tests. Our pharmacy & rehab experts
                  support your journey to a healthier you.
                </div>
              </div>
              {/* CONTENT BOX #3 */}
              <div className="box-list grey-color mb-15">
                <div className="box-list-icon">
                  {/* <i className="fas fa-genderless" /> */}
                </div>
                <p>
                  {/* Your health is important to us. Whether you have questions,
                  concerns, or need to schedule an appointment, Iatric
                  healthcare is here to help! We're committed to your
                  satisfaction and look forward to partnering with you on your
                  healthcare journey. */}
                </p>
              </div>
              {/* Button */}
              <div className="w-50">
                <ConsultationButton path={"/discover-more"}>
                  Discover More
                </ConsultationButton>
              </div>
            </div>
          </div>
          {/* END HERO TEXT */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5Hero5;
