import React from "react";

const Demo5Pricing3 = () => {
  return (
    <section id="pricing-3" className="wide-60 pricing-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* PRICING TABLE */}
          <div className="col-lg-6">
            <div className="txt-block pc-30 mb-40" data-wow-delay="0.4s">
              {/* Section ID */}
              <span className="section-id blue-color">Iatric Pricing</span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                Invest in Your Health, Affordably
              </h3>
              {/* Text */}
              <p>
                Iatric Healthcare prioritizes affordable &amp; accessible
                healthcare. We offer budget-friendly options for checkups,
                chronic care, &amp; specialized services, allowing you to invest
                in your health without breaking the bank.
              </p>
              <div className="pricing-table mb-40">
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
              <img
                className="img-fluid"
                src="images/image-04.png"
                alt="pricing-image"
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
