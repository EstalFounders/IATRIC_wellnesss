import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

const ContactsBanner8 = () => {
    const { t } = useLanguage();
    return (
        <section id="banner-8" className="bg-fixed banner-section division">
            <div className="container white-color">
                <div className="row d-flex align-items-center">
                    {/* BANNER TEXT */}
                    <div className="col-lg-8 offset-lg-2">
                        <div className="banner-txt icon-lg text-center">
                            {/* Icon  */}
                            <span className="flaticon-072-hospital-5" />
                            {/* Title  */}
                            <h3 className="h3-sm">
                                {t("contacts8.title")}
                            </h3>
                            <h4 className="h4-lg">
                                {t("contacts8.cta")}
                            </h4>
                            <h2 className="h2-lg">1-800-123-4560</h2>
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
