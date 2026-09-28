import React, { useState } from "react";
import Popup from "../Popup";
import Image from "next/image";
import { useLanguage } from "../../i18n/LanguageContext";

const Demo2Gallery1 = () => {
  const [image, setImage] = useState(false);
  const [src, setSrc] = useState(false);
  const { t } = useLanguage();
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
            <h3 className="h3-md text-dark">{t("demo2.gallery.title")}</h3>
            {/* Text */}
            <div>
              {t("demo2.gallery.p1a")}{" "}
              <strong>{t("demo2.gallery.p1b")}</strong>
              {t("demo2.gallery.p1c")}{" "}
              <strong>{t("demo2.gallery.p1d")}</strong>.
              <br />
              {t("demo2.gallery.p2a")}{" "}
              <strong>{t("demo2.gallery.p2b")}</strong>
              {t("demo2.gallery.p2c")}{" "}
              <strong>{t("demo2.gallery.p2d")}</strong>
              {t("demo2.gallery.p2e")}
              <br />
              <div className="mt-3">
                {t("demo2.gallery.p3a")}{" "}
                <strong>{t("demo2.gallery.p3b")}</strong>{" "}
                {t("demo2.gallery.p3c")}{" "}
                <strong>{t("demo2.gallery.p3d")}</strong>{" "}
                {t("demo2.gallery.p3e")}
              </div>
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
