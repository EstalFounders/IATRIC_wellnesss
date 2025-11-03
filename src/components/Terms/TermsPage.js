import React from "react";

const TermsPage = () => (
  <div className="container py-5" style={{ maxWidth: 800, margin: "0 auto" }}>
    <h1 className="mb-4">Privacy Policy</h1>
    <p>
      <strong>Effective Date:</strong> November 3, 2025
    </p>
    <p>
      This Privacy Policy describes how our medical service (&quot;we&quot;,
      &quot;us&quot;, &quot;our&quot;) collects, uses, and protects your
      personal and health information when you use our website and services.
    </p>

    <h2>Information We Collect</h2>
    <ul>
      <li>
        Personal information: name, date of birth, address, email, phone number
      </li>
      <li>
        Medical information: medical history, medications, allergies, test
        results, symptoms, and consultation details
      </li>
      <li>Payment and billing information when you use paid services</li>
      <li>
        Technical data: device information, IP address, cookies, and usage logs
      </li>
    </ul>
    <h2>How We Use Your Information</h2>
    <ul>
      <li>To deliver medical advice, consultations, and healthcare services</li>
      <li>Appointment scheduling, reminders, and follow-ups</li>
      <li>Improve our website and service offerings</li>
      <li>Communicate with you regarding services and important updates</li>
      <li>
        Comply with laws and regulations governing medical information (such as
        HIPAA, GDPR, or similar)
      </li>
    </ul>
    <h2>Information Sharing & Disclosure</h2>
    <ul>
      <li>
        We do <strong>not</strong> sell or rent your data
      </li>
      <li>
        Your data may be shared with healthcare professionals who serve you
      </li>
      <li>
        Third-party vendors (like payment processors or analytics platforms) may
        access limited data only to provide specific services, and are
        contractually obligated to maintain confidentiality
      </li>
      <li>
        We may disclose information if required by law, regulation, court order,
        or to protect our rights
      </li>
    </ul>
    <h2>Protecting Your Information</h2>
    <ul>
      <li>
        We implement industry standard security measures, including encryption
        for transmission and storage (TLS 1.2+)
      </li>
      <li>
        Access to health information is strictly limited to authorized staff
      </li>
      <li>
        We regularly update our data protection policies and provide staff
        training
      </li>
    </ul>
    <h2>Your Rights</h2>
    <ul>
      <li>
        You may request access to, correction, or deletion of your personal data
      </li>
      <li>
        Patients have the right to limit how their health data is used and
        shared
      </li>
      <li>
        If you have questions, or wish to exercise your rights, contact our
        Privacy Officer at:{" "}
        <a href="mailto:privacy@yourwebsite.com">privacy@yourwebsite.com</a>
      </li>
    </ul>
    <h2>Cookies & Tracking</h2>
    <p>
      We may use essential and analytics cookies to help enhance your user
      experience. You can adjust your browser settings to manage cookie
      preferences.
    </p>
    <h2>Data Breach & Complaints</h2>
    <p>
      In case of any data breach, we will notify affected users according to
      applicable laws. You can report complaints to our Privacy Officer or to
      relevant regulatory authorities.
    </p>
    <h2>Updates to this Policy</h2>
    <p>
      We may update this Privacy Policy as needed to reflect changes in our
      practices or regulations. We encourage you to review this page regularly.
    </p>
    <p>
      <strong>Contact Us:</strong> If you have questions about this Privacy
      Policy, email us at{" "}
      <a href="mailto:privacy@yourwebsite.com">privacy@yourwebsite.com</a>
    </p>
  </div>
);

export default TermsPage;
