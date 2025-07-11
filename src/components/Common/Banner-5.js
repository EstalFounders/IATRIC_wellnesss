import Image from "next/image";
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
              Exceptional Healthcare Across India: Expert Care, Tailored to You
            </h3>
            {/* Text */}
            <div className="h5 box-list grey-color">
              Start your journey to optimal health with <b>Healthpath,</b> your
              trusted partner for <b>exceptional medical care.</b> We believe
              healthcare should be as unique as you are, which is why we offer
              meticulously <b>personalized treatment plans</b> designed to meet
              your specific needs. Every service is delivered by our team of{" "}
              <b>highly qualified and and compassionate healthcare experts.</b>
            </div>
            <div className="h5 box-list grey-color">
              At Healthpath, we empower you to confidently{" "}
              <b>reach your wellness goals.</b> We achieve this through a
              powerful combination of <b>cutting-edge telemedicine services</b>{" "}
              and an unwavering commitment to your overall well-being. Whether
              you&apos;re seeking online consultations or comprehensive home care,
              our experts are dedicated to providing the highest standard of
              medical support.
            </div>
            <div className="h5 box-list grey-color">
              Experience the Healthpath difference:{" "}
              <b>
                expert healthcare that truly understands and supports you every
                step of the way
              </b>{" "}
              on your path to optimal health, wherever you are in India.
            </div>
          </div>
        </div>
        {/* BANNER IMAGE */}
        <div className="row ml-5 mb-5">
          <div className="col-lg-10 offset-lg-1">
            <div className="banner-5-img wow fadeInUp" data-wow-delay="0.4s">
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