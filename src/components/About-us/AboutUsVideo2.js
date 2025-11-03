import React from "react";

const WhoWeAreInfo1 = () => {
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