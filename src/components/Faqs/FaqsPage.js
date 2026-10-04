import Link from "next/link";
import React from "react";
import { contact_no, email } from "../../constant";
import { faqGroups, faqGroupAnchor, faqIntro } from "../../../data/faqs";
import FaqSection from "../Common/FaqSection";

const FaqsPage = () => {
  return (
    <section id="faqs-page" className="wide-80 faqs-section division">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
            <div className="questions-holder">
              {/* Title + intro */}
              <h3 className="h3-md steelblue-color">{faqIntro.heading}</h3>
              <p>{faqIntro.text}</p>

              {/* QUESTIONS ACCORDION - one block per service/topic. The cards are
                  rendered by the same FaqSection the topic pages use, so the
                  answers here and on a service page can never drift apart.
                  wrapperId/accordionId are null: this page owns the single
                  #faqs-page / #accordion wrappers that the accordion CSS needs. */}
              <div id="accordion">
                {faqGroups.map((group, groupIndex) => (
                  <FaqSection
                    key={group.title}
                    items={group.items}
                    title={group.title}
                    headingId={faqGroupAnchor(group.title)}
                    headingPrefix={`${groupIndex + 1}. `}
                    wrapperId={null}
                    accordionId={null}
                  />
                ))}
              </div>
              {/* END QUESTIONS ACCORDION */}

              {/* CONTACT CTA */}
              <div className="faqs-cta mt-50">
                <h5 className="h5-md">Still have a question?</h5>
                <p className="p-sm">
                  Our care desk is available from 7:00 AM to 10:00 PM, all 7
                  days. Call or WhatsApp <b>{contact_no}</b> or write to{" "}
                  <b>{email}</b> and we will get back to you.
                </p>
                <Link legacyBehavior href="/contacts-2">
                  <a className="btn btn-blue blue-hover mt-10">Contact Us</a>
                </Link>
              </div>
              {/* END CONTACT CTA */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqsPage;
