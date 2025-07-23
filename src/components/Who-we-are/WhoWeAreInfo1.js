import React from "react";
import { ConsultationButton } from "../Common/commonUi";

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
                <h4>Welcome to MedService</h4>
              </span>
              {/* Title */}
              <h3 className="h3-md text-dark">
                Clinic with Innovative Approach to Treatment
              </h3>
              {/* Text */}
              <div className="mb-30">
                An enim nullam tempor sapien gravida donec enim ipsum blandit
                porta justo integer odio velna vitae auctor integer congue magna
                at pretium purus pretium ligula rutrum itae laoreet augue
                posuere and curae integer congue leo metus mollis primis and
                mauris
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
                      Nemo ipsam egestas volute and turpis dolores quaerat
                    </div>
                  </div>
                  {/* Option #2 */}
                  <div className="box-list">
                    <div className="box-list-icon blue-color">
                      <i className="fas fa-angle-double-right" />
                    </div>
                    <div className="p-sm">Magna luctus tempor</div>
                  </div>
                  {/* Option #3 */}
                  <div className="box-list">
                    <div className="box-list-icon blue-color">
                      <i className="fas fa-angle-double-right" />
                    </div>
                    <div className="p-sm">
                      An enim nullam tempor at pretium purus blandit
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
                      Magna luctus tempor blandit a vitae suscipit mollis
                    </p>
                  </div>
                  {/* Option #5 */}
                  <div className="box-list m-top-15">
                    <div className="box-list-icon blue-color">
                      <i className="fas fa-angle-double-right" />
                    </div>
                    <p className="p-sm">
                      Nemo ipsam egestas volute turpis dolores quaerat
                    </p>
                  </div>
                  {/* Option #6 */}
                  <div className="box-list">
                    <div className="box-list-icon blue-color">
                      <i className="fas fa-angle-double-right" />
                    </div>
                    <p className="p-sm">An enim nullam tempor</p>
                  </div>
                </div>
              </div>
              {/* End Options List */}
            </div>
            <div className="mt-2 d-flex justify-content-center mt-5 mb-4">
              <div className="w-50">
                <ConsultationButton path={"/appointment"}>
                  Book Consultation
                </ConsultationButton>
              </div>
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
