import React from "react";
import ReviewSlider from "./ReviewSlider";
import styles from "../css/LabTestimonial.module.css"

const LabTestimonial = () => {
  return (
    <section
      id="reviews-2"
      className="bg-lightgrey wide-100 reviews-section division"
    >
      <div className="container">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className={`h3-md ${styles.labTestHeading}`}>Testimonial</h3>
            {/* Text */}
            <div className={styles.labTestHeadingDesc}>
              We use only the best quality materials on the market in order to
              provide the best products to our patients.
            </div>
          </div>
        </div>
        {/* END SECTION TITLE */}
        {/* TESTIMONIALS CONTENT */}
        <ReviewSlider />
        {/* END TESTIMONIALS CONTENT */}
      </div>
      {/* End container */}
    </section>
  );
};

export default LabTestimonial;
