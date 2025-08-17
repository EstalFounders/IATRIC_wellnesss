import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { testimonial2Props } from "../../sliderProps";
import { Autoplay } from "swiper";
import { getInitials } from "../Common/commonMethod";
import { testimonials } from "../../../data/services";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { color_schema } from "../../constant";

const Testimonials = testimonials;

const ReviewSlider = () => {
  return (
    <div className="row">
      <div className="col-md-12">
        <Swiper
          {...testimonial2Props}
          modules={[Autoplay]}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 20 },
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
          }}
          className="owl-carousel owl-theme reviews-holder"
        >
          {Testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div
                className="review-card position-relative p-4 d-flex flex-column justify-content-between text-center my-5"
              >
                {/* Quote Icons */}
                <FaQuoteLeft
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    fontSize: "20px",
                    color: `${color_schema.green}`,
                    opacity: 0.6,
                  }}
                />
                <FaQuoteRight
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    fontSize: "20px",
                    color: `${color_schema.green}`,
                    opacity: 0.6,
                  }}
                />

                {/* Avatar */}
                <div className="testimonial-avatar mb-3">
                  {t.image ? (
                    <Image
                      width={100}
                      height={100}
                      src={t.image}
                      alt={`${t.name}-avatar`}
                      className="testimonial-avatar"
                    />
                  ) : (
                    <div className="initials-avatar mx-auto">
                      {getInitials(t.name)}
                    </div>
                  )}
                </div>

                {/* Text */}
                <p className="testimonial-text flex-grow-1 fst-italic">
                  {t.text}
                </p>

                {/* Author */}
                <div className="review-author mt-3">
                  <h5 className="h5-sm mb-1">{t.name}</h5>
                  {/* <span className="text-muted">{t.role}</span> */}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewSlider;
