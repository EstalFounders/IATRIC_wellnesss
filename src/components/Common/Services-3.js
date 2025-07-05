import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { service3Props } from "../../sliderProps";
import { services } from "../../constant";

const Services3 = () => {
  return (
    <section
      id="services-3"
      className="bg-lightgrey wide-100 services-section division"
    >
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md text-dark">
              Total Health Care Solutions
            </h3>
            {/* Text */}
            <div>
            <p className="h5 box-list grey-color">
              Aliquam a augue suscipit, luctus neque purus ipsum neque dolor
              primis libero at tempus, blandit posuere ligula varius congue
              cursus porta feugiat
            </div>
          </div>
        </div>
        {/* SERVICES CONTENT */}
        <div className="row h5 box-list">
          <div className="col-md-12">
            <Swiper
              {...service3Props}
              className="owl-carousel owl-theme services-holder"
            >
              {/* SERVICE BOX #1 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-083-stethoscope" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[0]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #2 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-047-head" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[1]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #3 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-015-blood-donation-1" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[2]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #4 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-048-lungs" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[3]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #5 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-060-cardiogram-4" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[4]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #6 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-031-scanner" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[5]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #7 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-076-microscope" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[6]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #8 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[7]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #9 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[8]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #10 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[9]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #11 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[10]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #12 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[11]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #13 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[12]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #14 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[13]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #15 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[14]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #16 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[15]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              {/* SERVICE BOX #17 */}
              <SwiperSlide className="sbox-3 icon-sm">
                {/* Icon */}
                <div className="sbox-3-icon">
                  <span className="flaticon-068-ambulance-3" />
                </div>
                {/* Title */}
                <h5 className="h5-xs steelblue-color">{services[1]}</h5>
                {/* Text */}
                <p>
                  Porta semper lacus cursus, feugiat primis ultrice in ligula
                  risus auctor tempus feugiat dolor lacinia cubilia curae
                  integer congue leo metus
                </p>
              </SwiperSlide>
              <div className="owl-dots"></div>
            </Swiper>
            
          </div>
        </div>
        {/* END SERVICES CONTENT */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Services3;
