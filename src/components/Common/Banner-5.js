import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import React from "react";
import { ConsultationButton } from "./commonUi";

const Banner5 = () => {
  return (
    <section id="banner-5" className="banner-section division">
      <div className="">
        {/* SECTION TITLE */}
        {/* BANNER IMAGE */}
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-lg-12 d-flex justify-content-center align-items-center">
            {/* <div className="banner-5-img"> */}
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                width={1150}
                height={600}
                className="img-fluid"
                src="/images/image-07.png"
                alt="banner-image"
              />
            {/* </div> */}
          </div>
        </div>
      </div>

      {/* End container */}
    </section>
  );
};

export default Banner5;
