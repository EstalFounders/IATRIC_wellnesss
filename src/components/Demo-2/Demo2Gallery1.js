import React, { useState } from "react";
import Popup from "../Popup";
import Image from "next/image";

const Demo2Gallery1 = () => {
  const [image, setImage] = useState(false);
  const [src, setSrc] = useState(false);
  const onClick = (src) => {
    setImage(true);
    setSrc(src);
  };
  return (
    <div id="gallery-1" className="gallery-section division wide-100">
      {image && <Popup content={{ src, name: "image" }} close={setImage} />}
      {/* SECTION TITLE */}
      <div className="container h5 box-list grey-color">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md text-dark">Your Partner in Health</h3>
            {/* Text */}
            <div>
              At Healthpath, we&apos;re more than just a <strong>healthcare provider</strong>; we&apos;re truly <strong>your partner in health</strong>. We walk alongside you on your entire <strong>wellness journey</strong>, committed to helping you achieve your personal health goals.
            </div><br></br>
            <div>
              We offer <strong>personalized care</strong>, dedicated support, and essential resources every step of the way. With Healthpath, you gain a trusted ally focused on your <strong>long-term well-being</strong>, ensuring you receive the <strong>comprehensive care</strong> and guidance you need to thrive. Choose Healthpath for a collaborative approach to your health, where your success is our shared mission.
            </div>
          </div>
        </div>
      </div>
      {/* GALLERY IMAGES */}
      <div className="row gallery-items-list">
        {/* IMAGE #1 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image  
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-1.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-1.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #2 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-2.jpg"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-2.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #3 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-3.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-3.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #4 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-4.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-4.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #5 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-5.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-5.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #6 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-6.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-6.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #7 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-7.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-7.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
        {/* IMAGE #8 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-8.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <a
                className="image-link"
                href="#"
                onClick={() => onClick("images/gallery/image-8.jpg")}
              >
                <i className="fas fa-search-plus" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* END GALLERY IMAGES */}
    </div>
  );
};

export default Demo2Gallery1;
