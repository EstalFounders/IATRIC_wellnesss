import React from "react";
import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageContext";

// Every photo in this gallery is an entry point into the booking flow, so a click
// anywhere on a tile navigates there.
//
// NOTE: the path this section was specified with, `/bookappointment`, does not
// exist in this app (the only booking route is `/appointment`). We therefore point
// at the exact URL the header "Book Now" button opens - the consultation flow with
// the service preselected. When the dedicated `/bookappointment` page/route lands,
// this single constant is the only line that has to change.
export const BOOK_APPOINTMENT_PATH = "/appointment?service=Book_Consultation";

const Demo2Gallery1 = () => {
  const { t } = useLanguage();
  return (
    <div id="gallery-1" className="gallery-section division wide-100">
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
      {/* GALLERY IMAGES - one link per tile. The magnifier stays as the hover /
          focus affordance; its ::after stretches the hit area over the whole photo
          (see customStyle.css), so a click anywhere on the image routes to the
          booking page. */}
      <div className="row gallery-items-list">
        {/* IMAGE #1 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-1.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #2 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-2.jpg"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #3 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-3.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #4 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-4.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #5 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-5.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #6 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-6.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #7 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-7.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {/* IMAGE #8 */}
        <div className="col-md-6 col-lg-3 gallery-item">
          <div className="hover-overlay">
            {/* Gallery Image */}
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              width={500}
              height={500}
              className="img-fluid"
              src="/images/gallery/image-8.png"
              alt="gallery-image"
            />
            <div className="item-overlay" />
            {/* Image Zoom */}
            <div className="image-zoom">
              <Link
                className="image-link"
                href={BOOK_APPOINTMENT_PATH}
                aria-label={t("common.bookNow")}
              >
                <i className="fas fa-search-plus" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* END GALLERY IMAGES */}
    </div>
  );
};

export default Demo2Gallery1;
