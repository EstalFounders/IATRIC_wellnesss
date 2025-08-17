import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { testimonial2Props } from "../../sliderProps";
import { Autoplay } from "swiper";
import { getInitials } from "../Common/commonMethod";
import { testimonials } from "../../../data/services";


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
            <SwiperSlide className="review-2" key={i}>
              <div className="review-txt text-center">
                {/* Quote */}
                <div className="quote">
                  <Image
                    width={200}
                    height={200}
                    src="/images/quote.png"
                    alt="quote-img"
                  />
                </div>

                {/* Author Avatar */}
                <div className="testimonial-avatar">
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

                {/* Testimonial Text */}
                <p>{t.text}</p>

                {/* Testimonial Author */}
                <div className="review-author">
                  <h5 className="h5-sm">{t.name}</h5>
                  <span>{t.role}</span>
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
