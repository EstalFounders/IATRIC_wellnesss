import { Swiper, SwiperSlide } from "swiper/react";
import { testimonial2Props } from "../../../sliderProps";
import { Image } from "react-bootstrap";
import styles from "../css/ReviewSlider.module.css";

const ReviewSlider = () => {
  const quote_img_path = "/images/quote.png";
  return (
    <div className="row">
      <div className="col-md-12">
        <Swiper
          {...testimonial2Props}
          className="owl-carousel owl-theme reviews-holder"
        >
          {/* TESTIMONIAL #1 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/*END  TESTIMONIAL #1 */}
          {/* TESTIMONIAL #2 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #2 */}
          {/* TESTIMONIAL #3 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #3 */}
          {/* TESTIMONIAL #4 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #4 */}
          {/* TESTIMONIAL #5 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #5 */}
          {/* TESTIMONIAL #6 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #6 */}
          {/* TESTIMONIAL #7 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #7 */}
          {/* TESTIMONIAL #8 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #8 */}
          {/* TESTIMONIAL #9*/}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image src={quote_img_path} alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  src="/images/labtest/review/review1.png"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <div className={styles.testimonialDesc}>
                I will let my mum know about this, she could really make use of
                software! Very easy to use. Since I invested in software I made
                over 100,000 dollars profits. I just can&apos;t get enough of
                software. I want to get a T-Shirt with software on it so I can
                show it off to everyone
              </div>
              {/* Testimonial Author */}
              <div className="review-author">
                <div className={`h5-sm ${styles.reviewerName}`}>
                  Sophia Anderson
                </div>
                <span className={styles.reviewerProfession}>Programmer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #9 */}
          <div className="owl-dots"></div>
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewSlider;
