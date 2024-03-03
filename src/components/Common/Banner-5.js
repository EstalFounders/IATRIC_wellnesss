import React from "react";

const Banner5 = () => {
  return (
    <section id="banner-5" className="pt-100 banner-section division">
      <div className="container">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md steelblue-color">
              Exceptional Care, Delivered by Expert
            </h3>
            {/* Text */}
            <p>
              Start your journey to optimal health. Iatric Healthcare offers
              exceptional care, personalized to your needs, by highly qualified
              experts. We empower you to reach your wellness goals.
            </p>
          </div>
        </div>
        {/* BANNER IMAGE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
            <div className="banner-5-img" data-wow-delay="0.4s">
              <img
                className="img-fluid"
                src="images/image-07.png"
                alt="banner-image"
              />
            </div>
          </div>
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default Banner5;
