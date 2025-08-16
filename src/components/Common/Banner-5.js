import Image from "next/image";
import React from "react";
import { ConsultationButton } from "./commonUi";

const Banner5 = () => {
  return (
    <section id="banner-5" className="banner-section division">
      <div className="">
        {/* SECTION TITLE */}
        {/* BANNER IMAGE */}
        <div className="row">
          <div className="col-lg-12">
            <div className="banner-5-img">
              <Image
                width={1000}
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
