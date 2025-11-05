import Link from "next/link";
import React from "react";

const TermsPage = () => (
  <div className="container py-5" style={{ maxWidth: 800, margin: "0 auto" }}>
    <h1 className="mb-4">Terms of Service</h1>
    <p>
      <strong>Last Updated:</strong> November 4, 2025
    </p>
    <h2>Agreement to Terms</h2>
    <p>
      By accessing or using our website and medical services
      (&quot;Service&quot;), you agree to be bound by these Terms of Service. If
      you do not accept all the terms, please do not use the Service.
    </p>
    <h2>Use of Our Services</h2>
    <ul>
      <li>
        Our services are intended for individuals who are at least 18 years old.
        By using our Service, you represent that you satisfy this age
        requirement and have the legal capacity to enter into this agreement.
      </li>
      <li>
        You agree to provide accurate and complete information when registering
        or booking services with us.
      </li>
      <li>
        You may not use the Service for any unlawful or unauthorized purpose.
      </li>
    </ul>
    <h2>Medical Information Disclaimer</h2>
    <p>
      Information provided on the website is for informational purposes only and
      is not a substitute for professional medical advice, diagnosis, or
      treatment. You should consult your healthcare provider before making any
      medical decisions.
    </p>
    <h2>Privacy Policy</h2>
    <p>
      Your use of our Service is also governed by our{" "}
      <Link href="/privacy-policy">Privacy Policy</Link>, which explains how we
      collect, use, and protect your personal data.
    </p>
    <h2>Intellectual Property</h2>
    <ul>
      <li>
        All content, trademarks, logos, and intellectual property displayed on
        the website are owned by our company or its licensors.
      </li>
      <li>
        You may not reproduce, distribute, or otherwise use the content unless
        expressly authorized by us.
      </li>
    </ul>
    <h2>Third-Party Links</h2>
    <p>
      Our website may contain links to third-party websites. We are not
      responsible for the content or privacy practices of those sites.
    </p>
    <h2>Limitation of Liability</h2>
    <ul>
      <li>
        We do not guarantee the accuracy, completeness, or usefulness of any
        information on the Service.
      </li>
      <li>
        To the maximum extent permitted by law, our company shall not be liable
        for any errors, omissions, or damages arising from your use of the
        Service.
      </li>
    </ul>
    <h2>Modifications to Terms</h2>
    <p>
      We reserve the right to update these Terms at any time. Changes will be
      posted on this page, with the effective date noted at the top. Continued
      use of the Service indicates acceptance of the revised Terms.
    </p>
    <h2>Contact Us</h2>
    <p>
      If you have any questions about these Terms, please email us at{" "}
      <a href="mailto:support@yourwebsite.com">customercare@healthpath.co.in</a>
      .
    </p>
  </div>
);

export default TermsPage;
