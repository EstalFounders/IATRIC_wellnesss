import React from "react";
import ReviewSlider from "./ReviewSlider";

const Demo2Reviews2 = () => {
  return (
    <section
      id="reviews-2"
      className="bg-lightgrey wide-100 reviews-section division"
    >
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md text-dark">What Our Patients Say</h3>
            {/* Text */}
            <div>
            <div className="h5 box-list grey-color">
              At Healthpath, the heart of our success lies in the positive experiences of our patients. We&apos;re incredibly proud of the trust placed in us and the real difference we make in people&apos;s lives. Here&apos;s what some of our patients have to say about their Healthpath experience:
            </div>
          </div>
          
        </div>
        {/* END SECTION TITLE */}
        {/* TESTIMONIALS CONTENT */}
         
        {/* END TESTIMONIALS CONTENT */}
      </div>
      <ReviewSlider />
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo2Reviews2;
