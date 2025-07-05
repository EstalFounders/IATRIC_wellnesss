import React from "react";

const WhoWeAreInfo1 = () => {
    return (
        <section id="info-1" className="wide-60 info-section division">
            <div className="container h5 box-list grey-color">
                <div className="row d-flex align-items-center">
                    {/* IMAGE BLOCK */}
                    <div className="col-lg-6">
                        <div
                            className="info-1-img text-center mb-40 wow fadeInUp"
                            data-wow-delay="0.6s"
                        >
                            <img
                                className="img-fluid"
                                src="images/image-11.png"
                                alt="info-image"
                            />
                        </div>
                    </div>
                    {/* TEXT BLOCK */}
                    <div className="col-lg-6">
                        <div
                            className="txt-block pc-30 mb-40 wow fadeInUp"
                            data-wow-delay="0.4s"
                        >
                            {/* Section ID */}
                            <span className="section-id blue-color">
                                <h4>
                                    Welcome to MedService
                                </h4>
                            </span>
                            {/* Title */}
                            <h3 className="h3-md text-dark">
                                Clinic with Innovative Approach to Treatment
                            </h3>
                            {/* Text */}
                            <div className="mb-30">
                                An enim nullam tempor sapien gravida donec enim
                                ipsum blandit porta justo integer odio velna
                                vitae auctor integer congue magna at pretium
                                purus pretium ligula rutrum itae laoreet augue
                                posuere and curae integer congue leo metus
                                mollis primis and mauris
                            </div>
                            {/* Options List */}
                            <div className="row">
                                <div className="col-xl-6">
                                    {/* Option #1 */}
                                    <div className="box-list m-top-15">
                                        <div className="box-list-icon blue-color">
                                            <i className="fas fa-angle-double-right" />
                                        </div>
                                        <div className="p-sm">
                                            Nemo ipsam egestas volute and turpis
                                            dolores quaerat
                                        </div>
                                    </div>
                                    {/* Option #2 */}
                                    <div className="box-list">
                                        <div className="box-list-icon blue-color">
                                            <i className="fas fa-angle-double-right" />
                                        </div>
                                        <div className="p-sm">
                                            Magna luctus tempor
                                        </div>
                                    </div>
                                    {/* Option #3 */}
                                    <div className="box-list">
                                        <div className="box-list-icon blue-color">
                                            <i className="fas fa-angle-double-right" />
                                        </div>
                                        <div className="p-sm">
                                            An enim nullam tempor at pretium
                                            purus blandit
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-6">
                                    {/* Option #4 */}
                                    <div className="box-list">
                                        <div className="box-list-icon blue-color">
                                            <i className="fas fa-angle-double-right" />
                                        </div>
                                        <p className="p-sm">
                                            Magna luctus tempor blandit a vitae
                                            suscipit mollis
                                        </p>
                                    </div>
                                    {/* Option #5 */}
                                    <div className="box-list m-top-15">
                                        <div className="box-list-icon blue-color">
                                            <i className="fas fa-angle-double-right" />
                                        </div>
                                        <p className="p-sm">
                                            Nemo ipsam egestas volute turpis
                                            dolores quaerat
                                        </p>
                                    </div>
                                    {/* Option #6 */}
                                    <div className="box-list">
                                        <div className="box-list-icon blue-color">
                                            <i className="fas fa-angle-double-right" />
                                        </div>
                                        <p className="p-sm">
                                            An enim nullam tempor
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* End Options List */}
                        </div>
                    </div>
                    {/* END TEXT BLOCK */}
                </div>
                {/* End row */}
  return (
    <section id="info-1" className="wide-60 info-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div
              className="info-1-img text-center mb-40 wow fadeInUp"
              data-wow-delay="0.6s"
            >
              <img
                className="img-fluid"
                src="images/image-11.png"
                alt="info-image"
              />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div
              className="txt-block pc-30 mb-40 wow fadeInUp"
              data-wow-delay="0.4s"
            >
              {/* Section ID */}
              <span className="section-id blue-color">
                <h5>Welcome to HealthPath</h5>
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                Who We Are: Your Pan-India Healthcare Partner
              </h3>
              {/* Text */}
              <p className="h5 box-list grey-color">
                At Health Path, we understand that managing your family&apos;s health
                can be a challenge in today&apos;s fast-paced world. That&apos;s why we&apos;ve
                built a comprehensive healthcare network designed to be your
                trusted partner across <b>all of India.</b> Our dedicated team
                of
                <b>qualified doctors</b> and healthcare professionals is
                committed to making health a priority for you and your loved
                ones, no matter where you are or how busy your schedule.
              </p>
              <h4 className="h3-md steelblue-color">
                Healthcare, Anywhere, Anytime
              </h4>
              <p className="h5 box-list grey-color">
                Gone are the days of hassle and long waits. With Health Path,
                expert <b>medical consultation</b> is just a <b>call away</b>. We provide
                <b>all-India healthcare consultations,</b> bringing quality medical
                advice directly to you, whenever you need it. Our goal is to
                simplify your healthcare journey, ensuring you get the care you
                need without disrupting your hectic life.
              </p>
              {/* End Options List */}
            </div>
          </div>
          {/* END TEXT BLOCK */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default WhoWeAreInfo1;
