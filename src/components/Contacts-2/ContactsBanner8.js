import React from "react";
import Image from "next/image";
import { useLanguage } from "../../i18n/LanguageContext";
import { contact_no, imageBlurDataUrl } from "../../constant";

const ContactsBanner8 = () => {
    const { t } = useLanguage();
    return (
        <section
            id="banner-8"
            className="bg-fixed banner-section division contacts8-banner"
        >
            <div className="container white-color">
                <div className="row d-flex align-items-center">
                    {/* BANNER TEXT */}
                    <div className="col-lg-8 offset-lg-2">
                        <div className="banner-txt icon-lg text-center">
                            {/* Brand symbol (replaces the template's hospital glyph)  */}
                            <Image
                                placeholder="blur"
                                blurDataURL={imageBlurDataUrl}
                                src="/images/invoicelogo.png"
                                alt="HealthPath"
                                width={110}
                                height={156}
                                className="contacts8-symbol"
                            />
                            {/* Title  */}
                            <h3 className="h3-sm">
                                {t("contacts8.title")}
                            </h3>
                            <h4 className="h4-lg">
                                {t("contacts8.cta")}
                            </h4>
                            <h2 className="h2-lg">{contact_no}</h2>
                        </div>
                    </div>
                </div>
                {/* End row */}
            </div>
            {/* End container */}
        </section>
    );
};

export default ContactsBanner8;
