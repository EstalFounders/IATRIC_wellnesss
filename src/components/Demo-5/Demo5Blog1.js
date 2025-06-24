import Link from "next/link";
import React from "react";

const Demo5Blog1 = () => {
  return (
    <section id="blog-1" className="wide-60 blog-section division">
      <div className="container">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md steelblue-color">
              Our Stories, Tips &amp; Latest News
            </h3>
            <span className="section-id blue-color">
              <h4>Your Hub for Health & Wellness Insights</h4>
            </span>
            {/* Text */}
            <p>
              Welcome to Healthpath's dynamic content hub! This is where we share <strong>compelling patient success stories</strong>, provide <strong>actionable health tips</strong>, and keep you informed with the <strong>latest healthcare news and updates</strong>. We're dedicated to empowering you with valuable information to support your well-being journey.
            </p>
          </div>
        </div>
        {/* BLOG POSTS HOLDER */}
        <div className="row">
          {/* BLOG POST #1 */}
          <div className="col-lg-4">
            <div className="blog-post">
              {/* BLOG POST IMAGE */}
              <div className="blog-post-img">
                <img
                  className="img-fluid"
                  src="images/blog/post-1-img.jpg"
                  alt="blog-post-image"
                />
              </div>
              {/* BLOG POST TITLE */}
              <div className="blog-post-txt">
                {/* Post Title */}
                <h5 className="h5-sm steelblue-color">
                  <Link legacyBehavior href="/single-post">
                    <a>5 Benefits Of Integrative Medicine</a>
                  </Link>
                </h5>
                {/* Post Data */}
                <span>
                  May 03, 2019 by
                  <span>Dr.Jeremy Smith</span>
                </span>
                {/* Post Text */}
                <p>
                  Quaerat neque purus ipsum neque dolor primis libero tempus
                  impedit tempor blandit sapien at gravida donec ipsum, at porta
                  justo...
                </p>
              </div>
            </div>
          </div>
          {/* END  BLOG POST #1 */}
          {/* BLOG POST #2 */}
          <div className="col-lg-4">
            <div className="blog-post">
              {/* BLOG POST IMAGE */}
              <div className="blog-post-img">
                <img
                  className="img-fluid"
                  src="images/blog/post-2-img.jpg"
                  alt="blog-post-image"
                />
              </div>
              {/* BLOG POST TEXT */}
              <div className="blog-post-txt">
                {/* Post Title */}
                <h5 className="h5-sm steelblue-color">
                  <Link legacyBehavior href="/single-post">
                    <a>Your Health Is In Your Hands</a>
                  </Link>
                </h5>
                {/* Post Data */}
                <span>
                  Apr 28, 2019 by
                  <span>Dr.Jonathan Barnes</span>
                </span>
                {/* Post Text */}
                <p>
                  Quaerat neque purus ipsum neque dolor primis libero tempus
                  impedit tempor blandit sapien at gravida donec ipsum, at porta
                  justo...
                </p>
              </div>
            </div>
          </div>
          {/* END  BLOG POST #2 */}
          {/* BLOG POST #3 */}
          <div className="col-lg-4">
            <div className="blog-post">
              {/* BLOG POST IMAGE */}
              <div className="blog-post-img">
                <img
                  className="img-fluid"
                  src="images/blog/post-3-img.jpg"
                  alt="blog-post-image"
                />
              </div>
              {/* BLOG POST TEXT */}
              <div className="blog-post-txt">
                {/* Post Title */}
                <h5 className="h5-sm steelblue-color">
                  <Link legacyBehavior href="/single-post">
                    <a>How Weather Impacts Your Health</a>
                  </Link>
                </h5>
                {/* Post Data */}
                <span>
                  Apr 17, 2019 by
                  <span>Dr.Megan Coleman</span>
                </span>
                {/* Post Text */}
                <p>
                  Quaerat neque purus ipsum neque dolor primis libero tempus
                  impedit tempor blandit sapien at gravida donec ipsum, at porta
                  justo...
                </p>
              </div>
            </div>
          </div>
          {/* END  BLOG POST #3 */}
        </div>
        {/* END BLOG POSTS HOLDER */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5Blog1;
