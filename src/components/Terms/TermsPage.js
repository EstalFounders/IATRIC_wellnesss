import React from "react";
import { address, contact_no, email } from "../../constant";

const website_url = "https://www.healthpath.co.in";

const TermsPage = () => (
  <div className="container py-5" style={{ maxWidth: 800, margin: "0 auto" }}>
    <h1 className="mb-4">Terms &amp; Conditions</h1>
    <p>
      These terms explain how HealthPath&apos;s WhatsApp-based doctor
      consultation service works and what responsibilities apply when you use
      it.
    </p>
    <p>
      <strong>Effective date:</strong> May 9, 2026
    </p>
    <p>
      This page is intended to provide clear service terms. It does not replace
      medical advice from a qualified doctor or legal advice from a qualified
      professional.
    </p>

    <h2>1. Acceptance of Terms</h2>
    <p>
      By accessing or using HealthPath&apos;s website, WhatsApp consultation
      flow, or related services, you agree to these Terms &amp; Conditions. If
      you do not agree, please do not use our services.
    </p>
    <p>
      These terms apply to patients, caregivers, visitors, and anyone who
      contacts HealthPath for healthcare guidance, consultation booking,
      support, or information.
    </p>

    <h2>2. Healthcare Services</h2>
    <p>
      HealthPath connects users with verified medical professionals for online
      consultations through WhatsApp and related communication channels. The
      consultation may include medical advice, prescriptions where clinically
      appropriate, follow-up guidance, or referral suggestions.
    </p>
    <p>
      HealthPath is not an emergency medical service. If you are experiencing
      chest pain, severe breathing difficulty, loss of consciousness, seizures,
      uncontrolled bleeding, stroke symptoms, poisoning, or any life-threatening
      condition, call 112 or visit the nearest emergency facility immediately.
    </p>

    <h2>3. User Responsibilities</h2>
    <p>
      You agree to provide accurate, complete, and current information about
      your symptoms, medical history, allergies, medications, reports, and any
      other details requested by the doctor.
    </p>
    <p>
      You are responsible for following the doctor&apos;s advice, seeking
      in-person care when recommended, and asking questions if any instruction
      is unclear. Do not share false, misleading, offensive, or unlawful content
      through our services.
    </p>

    <h2>4. Consultations and Prescriptions</h2>
    <p>
      Doctors use their independent clinical judgment during consultations. A
      prescription, medicine recommendation, diagnosis, or referral is not
      guaranteed and will only be provided when the doctor considers it
      appropriate.
    </p>
    <p>
      Online consultation has limitations because the doctor may not be able to
      physically examine you. The doctor may advise diagnostic tests, in-person
      evaluation, specialist care, or emergency care when needed.
    </p>

    <h2>5. Fees, Payments, and Refunds</h2>
    <p>
      Consultation fees are displayed before payment wherever applicable. You
      agree to pay the listed fee and any applicable taxes or payment gateway
      charges before receiving the paid service.
    </p>
    <p>
      Refunds may be considered if a paid consultation could not be delivered
      due to a service-side issue. Refund decisions are reviewed case by case
      and may require verification of payment and consultation records.
    </p>

    <h2>6. Platform Availability</h2>
    <p>
      We aim to keep HealthPath available and responsive, but we do not
      guarantee uninterrupted access. Service may be affected by maintenance,
      internet issues, WhatsApp availability, doctor availability, third-party
      systems, or events beyond our control.
    </p>

    <h2>7. Intellectual Property</h2>
    <p>
      The HealthPath name, website design, text, graphics, branding, and service
      materials are owned by or licensed to HealthPath. You may not copy,
      reproduce, modify, distribute, or commercially exploit them without
      written permission.
    </p>

    <h2>8. Limitation of Liability</h2>
    <p>
      To the fullest extent permitted by law, HealthPath is not liable for
      indirect, incidental, special, consequential, or punitive damages arising
      from use of the service. Nothing in these terms limits liability that
      cannot be excluded under applicable law.
    </p>
    <p>
      Medical outcomes depend on many factors including the accuracy of
      information provided, the nature of the condition, timely follow-up, and
      in-person care where required.
    </p>

    <h2>9. Changes to These Terms</h2>
    <p>
      We may update these Terms &amp; Conditions from time to time. The updated
      version will be posted on this page with a revised effective date.
      Continued use of our services means you accept the updated terms.
    </p>

    <h2>10. Contact</h2>
    <p>
      If you have any questions about these Terms &amp; Conditions, please
      contact us:
    </p>
    <ul>
      <li>
        Phone / WhatsApp:{" "}
        <a
          href={`tel:${contact_no}`}
          style={{ color: "#3b5f1d", fontWeight: 700 }}
        >
          {contact_no}
        </a>
      </li>
      <li>
        Email:{" "}
        <a
          href={`mailto:${email}`}
          style={{ color: "#3b5f1d", fontWeight: 700 }}
        >
          {email}
        </a>
      </li>
      <li>
        Website:{" "}
        <a
          href={website_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#3b5f1d", fontWeight: 700 }}
        >
          www.healthpath.co.in
        </a>
      </li>
      <li>Address: {address}</li>
    </ul>
  </div>
);

export default TermsPage;
