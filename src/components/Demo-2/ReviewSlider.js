import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { testimonial2Props } from "../../sliderProps";
import { Autoplay } from "swiper";
import { getInitials } from "../Common/commonMethod";
import { testimonials } from "../../../data/services";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { color_schema } from "../../constant";

const Testimonials = testimonials;

const avatarColors = ["#8e8333", "#3b5f1d"];

const ReviewSlider = () => {
  return (
    <div className="row">
      <div className="col-md-12">
        <style jsx>{`
          .review-card {
            min-height: 320px;
            border: 1px solid #e8e8e8;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            transition: box-shadow 0.3s ease;
          }
          .review-card:hover {
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          }
          .testimonial-text {
            max-height: 120px;
            overflow-y: auto;
            line-height: 1.6;
            padding-right: 4px;
          }
          .testimonial-text::-webkit-scrollbar {
            width: 4px;
          }
          .testimonial-text::-webkit-scrollbar-track {
            background: transparent;
          }
          .testimonial-text::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
          }
          .testimonial-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            object-fit: cover;
          }
          .initials-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 600;
          }
        `}</style>
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
              <div className="review-card position-relative p-4 d-flex flex-column justify-content-between text-center my-5">
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
                      width={70}
                      height={70}
                      src={t.image}
                      alt={`${t.name}-avatar`}
                      className="testimonial-avatar"
                    />
                  ) : (
                    <div
                      className="initials-avatar mx-auto"
                      style={{
                        backgroundColor: avatarColors[i % 2],
                        color: "#fff",
                      }}
                    >
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
