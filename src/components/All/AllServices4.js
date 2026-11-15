import Link from "next/link";
import React from "react";
import Image from "next/image";

const AllServices4 = () => {
  return (
    <section id="services-4" className="wide-60 services-section division">
      <div className="container">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md steelblue-color">We Are Here For You</h3>
            {/* Text */}
            <p>
              Aliquam a augue suscipit, luctus neque purus ipsum neque dolor
              primis libero at tempus, blandit posuere ligula varius congue
              cursus porta feugiat
            </p>
          </div>
        </div>
        <div className="row">
          {/* SERVICE BOX #1 */}
          <div className="col-md-6 col-lg-3">
            <div className="sbox-4 wow fadeInUp" data-wow-delay="0.4s">
              {/* Image */}
              <Image src="/images/cardiology_700x700.jpg" alt="content-image" width={400} height={300} priority={false} loading="lazy" className="img-fluid" />
              {/* Text */}
              <div className="sbox-4-txt">
                <h5 className="h5-md steelblue-color">
                  <Link legacyBehavior href="/single-service">
                    <a>Qualified Doctors</a>
                  </Link>
                </h5>
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor at pretium feugiat dolor integer congue
                </p>
              </div>
            </div>
          </div>
          {/* SERVICE BOX #2 */}
          <div className="col-md-6 col-lg-3">
            <div className="sbox-4 wow fadeInUp" data-wow-delay="0.6s">
              {/* Image */}
              <Image src="/images/mri_700x700.jpg" alt="content-image" width={400} height={300} priority={false} loading="lazy" className="img-fluid" />
              {/* Text */}
              <div className="sbox-4-txt">
                <h5 className="h5-md steelblue-color">
                  <Link legacyBehavior href="/single-service">
                    <a>Modern Equipments</a>
                  </Link>
                </h5>
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor at pretium feugiat dolor integer congue
                </p>
              </div>
            </div>
          </div>
          {/* SERVICE BOX #3 */}
          <div className="col-md-6 col-lg-3">
            <div className="sbox-4 wow fadeInUp" data-wow-delay="0.8s">
              {/* Image */}
              <Image src="/images/pediatrics_700x700.jpg" alt="content-image" width={400} height={300} priority={false} loading="lazy" className="img-fluid" />
              {/* Text */}
              <div className="sbox-4-txt">
                <h5 className="h5-md steelblue-color">
                  <Link legacyBehavior href="/single-service">
                    <a>Healthcare for Kids</a>
                  </Link>
                </h5>
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor at pretium feugiat dolor integer congue
                </p>
              </div>
            </div>
          </div>
          {/* SERVICE BOX #4 */}
          <div className="col-md-6 col-lg-3">
            <div className="sbox-4 wow fadeInUp" data-wow-delay="1s">
              {/* Image */}
              <Image src="/images/emergency_help_700x700.jpg" alt="content-image" width={400} height={300} priority={false} loading="lazy" className="img-fluid" />
              {/* Text */}
              <div className="sbox-4-txt">
                <h5 className="h5-md steelblue-color">
                  <Link legacyBehavior href="/single-service">
                    <a>Emergency Help</a>
                  </Link>
                </h5>
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor at pretium feugiat dolor integer congue
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default AllServices4;
