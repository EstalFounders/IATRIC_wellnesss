import Image from "next/image";
import React from "react";

const Banner5 = () => {
  return (
    <section id="banner-5" className="pt-100 banner-section division">
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md text-dark">
              Exceptional Care, Delivered by Experts
            </h3>
            {/* Text */}
            <div>
              Start your journey to optimal health with Healthpath. We offer <strong>exceptional medical care</strong>, meticulously <strong>personalized to your unique needs</strong>, and delivered by our team of <strong>highly qualified and compassionate experts</strong>.
            </div>
            <div className="mt-3">
              At Healthpath, we empower you to confidently <strong>reach your wellness goals</strong> through a combination of cutting-edge <strong>telemedicine services</strong> and a steadfast commitment to your well-being. Experience the difference of <strong>expert healthcare</strong> that truly understands and supports you every step of the way.
            </div>
          </div>
        </div>
        {/* BANNER IMAGE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
            <div className="banner-5-img" data-wow-delay="0.4s">
              <Image
                width={800}
                height={600}
                className="img-fluid"
                src="/images/image-07.png"
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
