import Link from "next/link";
import React from "react";

const Demo5Hero5 = () => {
  return (
    <section id="hero-5" className="bg-fixed hero-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* HERO TEXT */}
          <div className="col-md-9 col-lg-7 col-xl-6">
            <div className="hero-5-strip bg-blue white-color">
              <h5>Iatric Healthcare Provides</h5>
            </div>
            <div className="hero-txt">
              {/* Title */}
              <h4 className="steelblue-color">Best Quality</h4>
              <h3 className="steelblue-color">
                Medical treatment for you and your family
              </h3>
              {/* CONTENT BOX #1 */}
              <div className="box-list grey-color">
                <div className="box-list-icon">
                  {/* <i className="fas fa-genderless" /> */}
                </div>
                <p>
                  Get optimal health,{" "}
                  <strong style={{color: ''}}>
                    <b>ANYTIME, ANYWHERE!</b>
                  </strong>{" "}
                  One-stop care: Consult top doctors online, visit our clinic,
                  or get home visits & lab tests. Our pharmacy & rehab experts
                  support your journey to a healthier you.
                </p>
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
              <Link legacyBehavior href="/about-us">
                <a className="btn btn-blue blue-hover">Discover More</a>
              </Link>
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
