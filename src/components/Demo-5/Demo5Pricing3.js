import Image from "next/image";
import React from "react";

const Demo5Pricing3 = () => {
  return (
    <section id="pricing-3" className="wide-60 pricing-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* PRICING TABLE */}
          <div className="col-lg-6">
            <div className="txt-block pc-30 mb-40 data-wow-delay" data-wow-delay="0.4s">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>Healthpath pricing</h4>
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                Invest in Your Health, Affordably
              </h3>
              {/* Text */}
              <p class="h5 box-list grey-color">
                At Healthpath, we believe{" "}
                <strong>high-quality healthcare</strong> should be accessible
                and <strong>affordable</strong> for everyone. Discover how
                Healthpath makes{" "}
                <strong>affordable healthcare accessible</strong> by all in
                reality. We&apos;re committed to providing{" "}
                <strong>value-driven medical care</strong> that empowers you to
                take control of your health journey, affordably.
              </p>
              <p class="h5 box-list grey-color">
                Explore our plans and find the perfect fit for your needs today.
              </p>
              <div className="pricing-table mb-40 h5 box-list grey-color">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Service</th>
                      <th scope="col">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>X-Ray</td>
                      <td>
                        From <span>$325.00</span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Magnetic Resonance Imaging</td>
                      <td>
                        From <span>$435.00</span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Computer Tomography</td>
                      <td>
                        From <span>$315.00</span>
                      </td>
                    </tr>
                    <tr className="last-tr">
                      <th scope="row">4</th>
                      <td>Laboratory Tests</td>
                      <td>
                        From <span>$90.00</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* END PRICING TABLE */}
          {/* PRICING IMAGE */}
          <div className="col-lg-6">
            <div className="pricing-img">
              <Image
                width={600}
                height={550}
                className="img-fluid"
                src="/images/image-04.png"
                alt="pricing-image"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5Pricing3;
