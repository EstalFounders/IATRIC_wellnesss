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
                Investing in your health shouldn't come at the expense of your
                wallet. At Iatric Healthcare, we understand that financial
                concerns can often be a barrier to prioritizing well-being.
                That's why we offer a variety of affordable options to fit your
                needs and budget. We believe that preventative care and early
                intervention are key to maintaining optimal health, and we're
                committed to making these crucial services accessible for
                everyone. Whether you're looking for routine checkups, chronic
                disease management, or specialized services, we provide
                comprehensive care tailored to your individual circumstances,
                without compromising on quality or breaking the bank. So, take
                the first step towards a healthier you and explore our range of
                budget-friendly healthcare solutions.
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
