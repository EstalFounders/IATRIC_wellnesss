import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { testimonial2Props } from "../../sliderProps";

const ReviewSlider = () => {
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
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={300}
                  height={300}
                  quality={100} // Ensures max quality
                  src="/images/review-author-1.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;Healthpath has truly changed how I manage my health. <strong>Booking an online consultation was incredibly easy</strong>, and I spoke to a doctor within minutes. No more waiting rooms!&quot;              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Shrey Johri</h5>
                <span>Software Engineer</span>
              </div>
            </div>
          </SwiperSlide>
          {/*END  TESTIMONIAL #1 */}
          {/* TESTIMONIAL #2 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-2.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;The convenience is unmatched. I got expert medical advice from my living room, <strong>saving me so much time and hassle</strong>. Highly recommend their virtual consultations.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Adhira Saxena</h5>
                <span>Brand Manager</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #2 */}
          {/* TESTIMONIAL #3 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-3.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;I love that I can <strong>securely share my medical history</strong> with my family and specialists. It makes coordinating care so much simpler and less stressful.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Jayant Bhatia</h5>
                <span>Businessman</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #3 */}
          {/* TESTIMONIAL #4 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-4.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;The doctors at Healthpath are so understanding and thorough, even online. I felt genuinely heard and received <strong>excellent, personalized care</strong>.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Akhand Seth</h5>
                <span>Engineer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #4 */}
          {/* TESTIMONIAL #5 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-5.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;Finally, a healthcare service that fits my busy schedule! Being able to <strong>connect with a doctor anytime, anywhere</strong> has been a game-changer for my well-being.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Vaishali Singh</h5>
                <span>Photographer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #5 */}
          {/* TESTIMONIAL #6 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-6.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;The peace of mind knowing I can get <strong>reliable medical guidance instantly</strong> is invaluable. Healthpath has become my go-to for all my health concerns.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Mohit Arora</h5>
                <span>Cloud Engineer</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #6 */}
          {/* TESTIMONIAL #7 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-7.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;I was hesitant about online consultations, but Healthpath made it so seamless and professional. It&apos;s truly an <strong>innovative approach to healthcare</strong>.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Saksham Gaur</h5>
                <span>Student</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #7 */}
          {/* TESTIMONIAL #8 */}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-8.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;From skipping traffic to avoiding long queues, Healthpath has <strong>made healthcare accessible and stress-free</strong>. My health journey feels much more manageable now.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Kajol Wadhwani</h5>
                <span>Chartered Accountant</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #8 */}
          {/* TESTIMONIAL #9*/}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-9.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;The platform is incredibly user-friendly, and the support team is fantastic. It&apos;s clear that <strong>patient well-being is their top priority</strong>.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Anjali Srivastava</h5>
                <span>Housewife</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #9 */}
          {/* TESTIMONIAL #10*/}
          <SwiperSlide className="review-2">
            <div className="review-txt text-center">
              {/* Quote */}
              <div className="quote">
                <Image width={200} height={200} src="/images/quote.png" alt="quote-img" />
              </div>
              {/* Author Avatar */}
              <div className="testimonial-avatar">
                <Image
                  width={100}
                  height={100}
                  src="/images/review-author-10.jpg"
                  alt="testimonial-avatar"
                />
              </div>
              {/* Testimonial Text */}
              <p>
                &quot;Healthpath has empowered me to take control of my health. The ability to <strong>connect with specialists and manage my records from home</strong> is revolutionary.&quot;
              </p>
              {/* Testimonial Author */}
              <div className="review-author">
                <h5 className="h5-sm">Divansh Arora</h5>
                <span>Chef</span>
              </div>
            </div>
          </SwiperSlide>
          {/* END TESTIMONIAL #10 */}
          <div className="owl-dots"></div>
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewSlider;
