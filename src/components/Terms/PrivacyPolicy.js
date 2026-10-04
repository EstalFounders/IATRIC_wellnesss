import React from "react";
import { contact_no, email, color_schema } from "../../constant";

const PrivacyPolicy = () => (
  <div className="container py-5" style={{ maxWidth: 800, margin: "0 auto" }}>
    <h1 className="mb-4">Privacy Policy</h1>
    <p>
      This policy explains what information HealthPath collects, how we use it,
      and the choices you have when using our consultation service.
    </p>
    <p>
      <strong>Effective date:</strong> May 9, 2026
    </p>
    <p>
      HealthPath handles health-related information with care because it can be
      sensitive. Please read this policy before sharing consultation details,
      reports, images, or payment information.
    </p>

    <h2>1. Information We Collect</h2>
    <p>
      We may collect your name, phone number, age, gender, location, payment
      details, consultation preferences, messages, uploaded reports or images,
      symptoms, medical history, allergies, medication details, and other
      information you choose to share during a consultation.
    </p>
    <p>
      We may also collect technical information such as device details, browser
      type, IP address, website usage data, referral source, and interaction
      logs to keep our website and services reliable.
    </p>

    <h2>2. How We Use Information</h2>
    <p>
      We use your information to connect you with doctors, deliver
      consultations, process payments, share prescriptions or follow-up
      guidance, provide support, improve service quality, prevent misuse, and
      comply with legal or regulatory obligations.
    </p>
    <p>
      We may use non-identifiable, aggregated insights to understand service
      performance, common health queries, response times, and user experience
      trends.
    </p>

    <h2>3. Medical Information</h2>
    <p>
      Medical information you share is used for consultation and care-related
      purposes. It may be viewed by doctors, authorized support staff, and
      service providers who need access to help deliver the consultation.
    </p>
    <p>
      Please avoid sharing information that is not relevant to your
      consultation. If you are contacting us on behalf of another person, make
      sure you have their consent to share their information.
    </p>

    <h2>4. Sharing of Information</h2>
    <p>
      We do not sell your personal information. We may share information with
      doctors, payment providers, technology vendors, communication platforms,
      analytics providers, legal authorities, or professional advisors when
      needed to provide services, operate safely, or comply with law.
    </p>
    <p>
      Because consultations are conducted over WhatsApp, your use of WhatsApp is
      also governed by WhatsApp&apos;s own terms and privacy practices.
    </p>

    <h2>5. Data Security</h2>
    <p>
      We use reasonable administrative, technical, and organizational
      safeguards to protect personal information. However, no digital service
      can guarantee absolute security, especially when information travels
      through third-party networks or messaging platforms.
    </p>

    <h2>6. Data Retention</h2>
    <p>
      We retain information for as long as needed to provide services, maintain
      consultation records, resolve disputes, improve safety, meet legal
      obligations, and support legitimate business purposes. Retention periods
      may vary depending on the type of information and applicable requirements.
    </p>

    <h2>7. Your Choices</h2>
    <p>
      You may contact us to request access, correction, or deletion of your
      personal information, subject to identity verification, medical record
      requirements, legal obligations, and legitimate service needs.
    </p>
    <p>
      You can choose not to provide certain information, but this may limit our
      ability to connect you with a doctor or complete a consultation safely.
    </p>

    <h2>8. Cookies and Analytics</h2>
    <p>
      Our website may use cookies, similar technologies, or analytics tools to
      understand traffic, improve performance, remember preferences, and measure
      service usage. You can manage cookies through your browser settings.
    </p>

    <h2>9. Children&apos;s Privacy</h2>
    <p>
      Consultations for minors should be initiated by a parent or legal
      guardian. We do not knowingly collect information from children without
      appropriate guardian involvement.
    </p>

    <h2>10. Updates to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. The updated version
      will be posted on this page with a revised effective date. Continued use
      of HealthPath after an update means you acknowledge the revised policy.
    </p>

    <h2>11. Contact</h2>
    <p>
      For privacy questions or requests, contact us at{" "}
      <a href={`mailto:${email}`} style={{ color: color_schema.green, fontWeight: 700 }}>
        {email}
      </a>{" "}
      or through WhatsApp at{" "}
      <a href={`tel:${contact_no}`} style={{ color: color_schema.green, fontWeight: 700 }}>
        {contact_no}
      </a>
      .
    </p>
  </div>
);

export default PrivacyPolicy;
