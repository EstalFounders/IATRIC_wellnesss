import React from "react";
import Image from "next/image";

const HomeHero = () => {
    return (
        <section id="hero" className="bg-scroll hero-section division">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="hero-txt text-center">
                            <Image src="/images/hero-logo.png" alt="title-image" width={1200} height={600} priority={false} loading="lazy" className="img-fluid title-img" />
                            <h3>
                                Complete Medical &amp; Medical Health Landing
                                Page
                            </h3>
                            <p>
                                Premium landing page template created to offer a
                                perfect solution for medical clinics, hospitals,
                                personal doctors and everyone else involved in
                                health services.
                            </p>
                        </div>
                    </div>
                </div>
                {/* End row */}
            </div>
            {/* End container */}
        </section>
    );
};

export default HomeHero;
