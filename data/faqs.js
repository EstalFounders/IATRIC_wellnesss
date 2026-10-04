import { canonicalServiceKey } from "../src/customUtils/serviceKeys";

/**
 * FAQ content for the /faqs page - grouped by service.
 *
 * Single source of truth: rendered by src/components/Faqs/FaqsPage.js, shown on
 * the matching topic/service pages via getFaqsForTopic(), and reused for the
 * FAQPage JSON-LD in src/components/Common/PageStructuredData.js, so the visible
 * answers and the structured data never drift apart.
 *
 * `service` lists every name/slug/key that maps a page to this group - the
 * lookup goes through canonicalServiceKey(), so "Dermatology", "Dermatologist"
 * and "dermatology" all resolve here. A group without `service` (General
 * Questions) is only shown on /faqs.
 *
 * Keep the answers factual and in sync with the service pages
 * (src/components/serviceDetails/ServiceDetailsComponent.js), data/services.js
 * and src/constant.js.
 */
export const faqIntro = {
  heading: "Frequently Asked Questions",
  text: "Everything you need to know about HealthPath - booking a doctor consultation, our medical specialities, home nursing and home care, physiotherapy, lab tests, medicine delivery, corporate healthcare and health check-up camps. Can't find your answer? Our care desk is happy to help.",
};

export const faqGroups = [
  {
    title: "General Questions",
    items: [
      {
        question: "How do I book a doctor consultation or any other service?",
        answer:
          "Book online from this website - choose your speciality, pick a doctor and select an audio, video or in-clinic slot. If you prefer, our care desk will book it for you over the phone during working hours.",
      },
      {
        question: "What are your working hours?",
        answer:
          "Doctors and our care desk are available from 7:00 AM to 10:00 PM, all 7 days a week, including Sundays and public holidays. Home visits, nursing, physiotherapy, lab sample collection and medicine delivery run in the same window.",
      },
      {
        question: "Which services does HealthPath provide?",
        answer:
          "Online (audio and video) and in-clinic doctor consultations across 11 medical specialities, nursing care and home care at home, physiotherapy, home lab sample collection and diagnostics, medicine delivery, corporate healthcare and OHC programmes, and pan-India health check-up camps.",
      },
      {
        question: "Where are your services available?",
        answer:
          "Online consultations are available anywhere in India. Home-based services - doctor visits, nursing, physiotherapy, lab sample collection and medicine delivery - cover Gurgaon and Delhi NCR, while corporate healthcare and health check-up camps are delivered pan-India. Share your pin code and we will confirm availability for your address.",
      },
      {
        question: "How do I pay for a service?",
        answer:
          "Consultations, home visits, lab tests and medicine orders can be paid online at the time of booking using UPI, credit or debit card and net banking. Corporate contracts and health camps are invoiced separately against a consolidated quotation.",
      },
      {
        question: "Can I cancel or reschedule a booking?",
        answer:
          "Yes. Contact our care desk as early as possible with your booking reference and we will reschedule your appointment, or cancel it and process the refund as per the applicable cancellation policy.",
      },
      {
        question: "How do I reach your support team?",
        answer:
          "Call or WhatsApp our care desk from 7:00 AM to 10:00 PM, all 7 days, or send us a message from the Contact page. For corporate healthcare and health camps one coordinator stays assigned to you from enquiry to completion.",
      },
    ],
  },
  {
    title: "Online & In-Clinic Doctor Consultation",
    service: ["consultation", "doctor consultation", "online consultation", "audio", "video"],
    items: [
      {
        question:
          "What is the difference between an audio, a video and an in-clinic consultation?",
        answer:
          "An audio consultation is a phone call with the doctor, a video consultation is a face-to-face call on your phone or laptop, and an in-clinic consultation is a physical visit at the clinic. All three give you the same medical advice and a digital prescription - choose whichever is most convenient.",
      },
      {
        question: "Do I need to install an app for an online consultation?",
        answer:
          "No. Online consultations run in your browser - we send you a secure joining link before your slot. You only need a stable internet connection and, for a video consultation, a working camera and microphone.",
      },
      {
        question: "How soon do I get my prescription?",
        answer:
          "The doctor issues a digital prescription at the end of your consultation, so you can download it immediately from your account or from the link we send you. You can then have the medicines delivered home or collect them from a pharmacy.",
      },
      {
        question: "Can I choose a specific doctor or speciality?",
        answer:
          "Yes. Browse by speciality and select the doctor and time slot that suit you. If you are unsure which speciality to pick, describe your symptoms to our care desk and we will guide you to the right doctor.",
      },
      {
        question: "Can I take a follow-up for the same health problem?",
        answer:
          "Yes. A follow-up consultation lets the doctor review your progress against the earlier prescription and adjust your treatment. Book a follow-up slot and mention your previous consultation so the doctor can pull up your history.",
      },
    ],
  },
  {
    title: "General Physician",
    service: ["General Physician", "general-physician", "physician"],
    items: [
      {
        question: "What does a General Physician treat?",
        answer:
          "Fever, cold, cough, throat and ear infections, body ache, headache, stomach and digestion problems, weakness, allergies, vitamin deficiencies and routine health concerns. A general physician is also the right first point of contact when your symptoms do not clearly point to one speciality.",
      },
      {
        question:
          "Can I get a prescription for long-term medicines such as BP or diabetes tablets?",
        answer:
          "Yes. Our physicians manage blood pressure, diabetes, thyroid and cholesterol, review your reports, adjust doses and issue prescriptions. For stable long-term medication you can also request a repeat prescription during an online consultation.",
      },
    ],
  },
  {
    title: "Pediatrics",
    service: ["Pediatrics", "Pediatrician", "Paediatrics", "Child Specialist"],
    items: [
      {
        question: "What age group do your pediatricians see?",
        answer:
          "Pediatricians at HealthPath see children from newborn to about 16 years. This covers growth and development, feeding and nutrition, common infections, allergies, immunisation schedules and adolescent health.",
      },
      {
        question: "Can my child be vaccinated at home?",
        answer:
          "Yes - our nursing teams handle vaccination at home in Gurgaon with a proper immunisation record, or you can visit the clinic. Share your child's age and the earlier immunisation card and we will plan the next due dose.",
      },
    ],
  },
  {
    title: "Cardiology",
    service: ["Cardiology", "Cardiologist", "Heart Specialist"],
    items: [
      {
        question: "What heart conditions does a cardiologist treat?",
        answer:
          "High blood pressure, high cholesterol, chest pain, palpitations, shortness of breath, heart-rhythm problems and follow-up after a heart attack or cardiac procedure. The cardiologist also reviews your ECG, echo and other cardiac reports.",
      },
      {
        question: "Which tests are done for chest pain or palpitations?",
        answer:
          "Depending on your symptoms the cardiologist may advise ECG, echocardiography, Holter monitoring, TMT or blood tests, all of which can be arranged for you. If a red-flag symptom is found you are escalated to hospital care without delay.",
      },
    ],
  },
  {
    title: "Dermatology",
    service: ["Dermatology", "Dermatologist", "Skin Specialist"],
    items: [
      {
        question: "What skin, hair and nail problems do you treat?",
        answer:
          "Acne and acne scars, pigmentation, eczema, psoriasis, fungal and bacterial infections, hair fall and dandruff, allergies and nail disorders. Dermatology also covers cosmetic concerns such as dull skin and unwanted hair.",
      },
      {
        question: "Can skin problems be treated through an online consultation?",
        answer:
          "Yes. Most skin, hair and nail concerns are assessed visually, so you can share clear photographs and your history during a video consultation. Treatments that need in-clinic procedures, such as chemical peels, are planned as a clinic visit.",
      },
    ],
  },
  {
    title: "Orthopaedics",
    service: ["Orthopaedics", "Orthopedics", "Orthopaedic Surgeon", "Orthopedic Surgeon"],
    items: [
      {
        question: "What conditions does an orthopaedic specialist treat?",
        answer:
          "Joint and knee pain, back and neck pain, sports and overuse injuries, fractures, ligament and meniscus tears, arthritis, osteoporosis and posture-related problems. The specialist reviews your X-rays, MRI and other imaging and plans conservative or surgical treatment.",
      },
      {
        question: "Do I get physiotherapy after a fracture or joint surgery?",
        answer:
          "Yes. Orthopaedic care at HealthPath combines the specialist's treatment plan with physiotherapy - including home physiotherapy in Gurgaon - to restore movement, strength and function after fractures, joint-replacement, ligament or spine surgery.",
      },
    ],
  },
  {
    title: "Gynaecology & Obstetrics",
    // "Gynaecology Obstetrics" / "Gynecology Obs" also cover the slug the
    // service-details URL builder makes out of the "&" name
    // ("gynaecology-&-obstetrics" -> "gynaecologyobstetrics" once slugified).
    service: [
      "Gynaecology & Obstetrics",
      "Gynecology & Obs",
      "Gynaecology Obstetrics",
      "Gynecology Obs",
      "Gynaecologist",
      "Gynecologist",
      "Obstetrics",
    ],
    items: [
      {
        question: "What does women's health at HealthPath cover?",
        answer:
          "Menstrual problems, PCOS and irregular cycles, white discharge, infections, breast concerns, fertility counselling, contraception and screening for anaemia and cervical or breast cancer. The doctor advises in-clinic tests wherever a physical examination is needed.",
      },
      {
        question: "Do you provide pregnancy (prenatal and postnatal) care?",
        answer:
          "Yes. We support you through pregnancy with scheduled antenatal visits, ultrasound and lab test planning, nutrition and lifestyle guidance, and postnatal follow-up for both mother and baby, including immunisation and nursing support at home.",
      },
    ],
  },
  {
    title: "Ophthalmology",
    service: ["Ophthalmology", "Ophthalmologist", "Eye Specialist"],
    items: [
      {
        question: "What eye tests and treatments do you offer?",
        answer:
          "Vision and refraction testing, spectacle prescription, dry-eye and allergy treatment, infection and injury care, and screening for diabetic retinopathy. Surgical conditions such as cataract are assessed and referred to partner hospitals for the procedure.",
      },
      {
        question: "Can cataract and glaucoma be detected early?",
        answer:
          "Yes - a routine eye check with vision testing and eye-pressure measurement picks up early cataract and glaucoma changes long before vision loss becomes noticeable, which is why an annual check matters after age 40 or if you have diabetes.",
      },
    ],
  },
  {
    title: "Pulmonology",
    service: ["Pulmonology", "Pulmonologist", "Chest Specialist", "Respiratory"],
    items: [
      {
        question: "What lung and breathing problems do you treat?",
        answer:
          "Asthma, persistent cough, wheezing, breathlessness, COPD, allergies, recurrent chest infections and post-COVID breathing issues. The specialist reviews your symptoms, inhaler technique, chest X-ray and other reports before advising treatment.",
      },
      {
        question: "Do you provide lung function tests or sleep apnea assessment?",
        answer:
          "Yes. Spirometry (pulmonary function testing) and related investigations can be arranged on the specialist's advice, and loud snoring or daytime sleepiness is evaluated for obstructive sleep apnea. Severe cases are referred for a sleep study.",
      },
    ],
  },
  {
    title: "Psychiatry & Mental Health",
    service: ["Psychiatry & Mental Health", "Psychiatrist", "Psychiatry", "Mental Health"],
    items: [
      {
        question: "Is mental health support confidential?",
        answer:
          "Yes, completely. Everything you share with the psychiatrist stays confidential and is recorded only in your medical notes, which are visible to your treating doctor. Nothing is shared with family or an employer without your consent, except in an emergency where you or someone else is at risk.",
      },
      {
        question: "What conditions does a psychiatrist help with?",
        answer:
          "Anxiety, depression, stress and burnout, sleep problems, panic attacks, OCD, phobias, mood swings, addiction and attention difficulties, along with counselling and medication follow-up. Both adults and adolescents are supported.",
      },
      {
        question: "Can psychiatry consultations and medication be managed online?",
        answer:
          "Yes. Online psychiatric consultations work well for counselling, initial assessment and regular medication review, and prescriptions are issued digitally. If a physical examination or admission is ever needed, the psychiatrist guides you to in-person care.",
      },
    ],
  },
  {
    title: "Dentistry",
    service: ["Dentistry", "Dentist", "Dental"],
    items: [
      {
        question: "What dental treatments do you provide?",
        answer:
          "Scaling and polishing, fillings, tooth-coloured restorations, root canal treatment, extractions, crowns and bridges, dentures and braces, along with treatment for tooth pain, bleeding gums and sensitivity. Children's dentistry and cosmetic whitening are also available.",
      },
      {
        question: "Do you treat children's teeth?",
        answer:
          "Yes. Pediatric dental care covers cavity prevention, fluoride application, sealants, milk-tooth problems and habit correction, all done gently so that the first dental visits stay positive for your child.",
      },
      {
        question: "Is root canal treatment painful?",
        answer:
          "Root canal treatment is done under local anaesthesia, so the procedure itself is comfortable and relieves the pain rather than causing it. Mild tenderness for a day or two afterwards is normal and settles with the prescribed medication.",
      },
    ],
  },
  {
    title: "Physiotherapy",
    service: ["Physiotherapy", "Physiotherapist", "Physio"],
    items: [
      {
        question: "Can a physiotherapist visit my home?",
        answer:
          "Yes. Our physiotherapists carry their equipment and treat you at home in Gurgaon, which is ideal after surgery or a fracture, for elderly patients and for anyone who finds travel difficult. You can also book physiotherapy sessions at the clinic.",
      },
      {
        question: "What conditions does physiotherapy help with?",
        answer:
          "Post-surgical and post-fracture rehabilitation, knee, shoulder and back pain, cervical and lumbar spondylosis, sciatica, frozen shoulder, sports injuries, stroke and neuro-rehabilitation, and general mobility and balance problems in older adults.",
      },
      {
        question: "How many physiotherapy sessions will I need?",
        answer:
          "It depends on your condition - simple muscle or joint problems may settle in 5 to 10 sessions, while rehabilitation after surgery or a stroke can need several weeks. The physiotherapist assesses you first, sets goals and reviews your plan regularly so you know the expected duration.",
      },
    ],
  },
  {
    title: "Nursing Care at Home",
    service: ["nursing-services", "Nursing Care at Home", "Nursing Care", "Nursing Services", "Nursing"],
    items: [
      {
        question: "What nursing services can I get at home?",
        answer:
          "Injections, IV drips and infusions, dressing and wound care, catheter and tube care, vaccination, vitals and blood-sugar monitoring, nebulisation and general bedside care, along with long-hour shifts for bedridden or recovering patients.",
      },
      {
        question: "Do your nurses give injections, IV drips and dressings at home?",
        answer:
          "Yes. Certified nurses administer injections, set up IV drips and infusions, and carry out routine and post-operative dressings at home using sterile, single-use consumables and a doctor's prescription wherever one is required.",
      },
      {
        question: "Can I book a nurse for elderly or post-operative care?",
        answer:
          "Yes. You can book a single visit or a longer shift - 12 hours or 24 hours - for elderly care, post-operative recovery, palliative support and bedridden patients, so a trained professional stays with the patient through the day or night.",
      },
      {
        question: "Are your nurses qualified and verified?",
        answer:
          "Yes. Every nurse is a qualified, registered professional whose identity, qualifications and experience are verified before deployment. Our nursing teams work to clinical protocols and a supervisor is available for any escalation.",
      },
      {
        question: "How long can a nurse stay at my home?",
        answer:
          "You can book a short visit for a single procedure, or a 12-hour or 24-hour shift. Longer engagements, including daily or round-the-clock duty for a fixed period, are arranged with the same nurse wherever possible for continuity of care.",
      },
    ],
  },
  {
    title: "Home Care",
    service: ["home-care", "Home Care", "Home Healthcare", "Home Visit"],
    items: [
      {
        question: "What is included in a home care visit?",
        answer:
          "A home care visit covers a doctor's or nurse's assessment at your home, treatment and prescriptions as needed, vitals and monitoring, and guidance for the family on medicines, diet and warning signs. Add-on services such as physiotherapy, lab sample collection and medical equipment can be combined in one plan.",
      },
      {
        question: "Can a doctor visit my home?",
        answer:
          "Yes. You can book a doctor home visit for fever, body ache, elderly patients, a post-operative review or mobility issues. The doctor arrives with the required kit and issues a prescription on the spot, in Gurgaon and Delhi NCR.",
      },
      {
        question: "Do you also provide attendants and medical equipment at home?",
        answer:
          "Yes. Along with doctors and nurses we arrange trained caretakers and GDA attendants, physiotherapy and nursing shifts, and basic medical equipment such as hospital beds, oxygen concentrators, wheelchairs and nebulisers on request. Share your requirement and we will quote for the combination you need.",
      },
    ],
  },
  {
    title: "Lab Tests & Diagnostics",
    service: [
      "lab-test",
      "Lab Tests & Diagnostics",
      "Lab Tests",
      "Labtest",
      "Lab Investigation",
      "Blood Test & Diagnostics",
      "Diagnostics",
    ],
    items: [
      {
        question: "Do you collect blood samples at home?",
        answer:
          "Yes. Book a lab test online and a trained phlebotomist reaches your address at the slot you choose, with sterile single-use collection material. Home sample collection is available in Gurgaon and Delhi NCR, and you can also use a partner lab.",
      },
      {
        question: "How soon will I receive my reports?",
        answer:
          "Most routine reports are ready the same day or within 24 hours, and specialised tests take 24 to 72 hours. Reports are delivered digitally with normal and abnormal values flagged, and you can discuss them with a doctor in a follow-up consultation.",
      },
      {
        question: "Do I need to fast before my blood test?",
        answer:
          "Some tests, such as fasting blood sugar and lipid profile, need 8 to 12 hours of fasting, while most others do not. The test details in your booking show whether fasting applies, and our care desk confirms it before your sample collection.",
      },
      {
        question: "Can I consult a doctor about my lab reports?",
        answer:
          "Yes. Once your reports are out you can book a follow-up or online consultation and the doctor will explain the values, compare them with your earlier reports and advise whether any treatment or repeat test is required.",
      },
    ],
  },
  {
    title: "Medicine Delivery",
    service: ["medicine-delivery", "Medicine Delivery", "Medicine", "Pharmacy"],
    items: [
      {
        question: "Do you deliver medicines to my home?",
        answer:
          "Yes. Share or upload your prescription and our pharmacy team dispenses the medicines and delivers them to your address in Gurgaon and Delhi NCR, so you do not have to step out for a refill.",
      },
      {
        question: "Are the medicines genuine?",
        answer:
          "Yes. Medicines are dispensed by a licensed pharmacy from verified suppliers and are checked batch-wise before dispatch, with a proper invoice and batch details so you can always trace what you received.",
      },
      {
        question: "How long does medicine delivery take?",
        answer:
          "Orders placed during working hours are usually delivered the same day, and later orders arrive the next day. For a one-off urgent medicine our care desk will tell you the earliest possible delivery time before you place the order.",
      },
    ],
  },
  {
    title: "Corporate Healthcare",
    service: ["corporate-healthcare", "Corporate Healthcare", "Corporate Health Care", "Corporate"],
    items: [
      {
        question: "Do you provide corporate healthcare services across India?",
        answer:
          "Yes. We run OHC medical rooms, doctors, nursing, emergency support, physiotherapy, employee health packages, camps and training programmes in metro, tier-1, tier-2 and remote locations across India, under a single contract and a single coordination desk.",
      },
      {
        question: "Can you take over our existing onsite clinic or OHC?",
        answer:
          "Yes. We audit the existing facility, equipment, medicine stock and records, then take over staffing and operations - or run a transition plan if you need upgrades, additional equipment or fresh statutory registers.",
      },
      {
        question: "How are employee health packages and checkups priced?",
        answer:
          "Packages are quoted per employee and per location, based on the tests, frequency, eligibility slabs and headcount you choose. Screening can be done onsite in a camp format or through partner labs in each city, and you receive a consolidated quotation before approval.",
      },
      {
        question:
          "Do you provide doctors and nurses for plants and warehouses that run in shifts?",
        answer:
          "Yes. Doctors, nurses, paramedics and physiotherapists are deployed on shift-based rosters that match your operating hours, including round-the-clock requirements, with replacement cover and teleconsultation back-up for any gap.",
      },
      {
        question: "What reporting do HR and EHS teams receive?",
        answer:
          "Monthly MIS covering OHC footfall and consultations, incident and first-aid logs, medicine consumption, camp and screening outcomes, training completion and compliance checklists - plus abnormal-finding follow-up lists for employees who need further care.",
      },
    ],
  },
  {
    title: "Health Camps & Community Care",
    service: [
      "community-care",
      "healthcamp",
      "Health Camps & Community Care",
      "Health Camps",
      "Health Camp",
      "Community Care",
    ],
    items: [
      {
        question: "What is a health check-up camp?",
        answer:
          "A health camp is a short, focused preventive screening event held at your school, office, factory, society, care home or community venue. Our medical team sets up stations on site for registration, vitals, blood collection, doctor consultation and specialist screening, and participants receive reports with referrals for anything abnormal - so nobody has to travel to a clinic for a basic check-up.",
      },
      {
        question:
          "How do I book a health camp for my school, company, society or NGO?",
        answer:
          "Share your city, venue, expected number of participants, preferred date and the screenings you want. We confirm the scope and send a quotation within 24 hours, carry out a site assessment, then mobilise the medical team and equipment. One coordinator stays with you from enquiry to report closure.",
      },
      {
        question: "How many participants do you need for a health camp?",
        answer:
          "Camps normally start at about 50 participants at one site, while larger drives of 500 to 3,000 participants are split into batches or spread across multiple days. For smaller groups we can deliver the same screenings at a partner clinic or through home sample collection.",
      },
      {
        question: "What is covered in a school annual health check-up camp?",
        answer:
          "Height, weight, BMI, vision, dental, ENT, haemoglobin and anaemia screening, skin, posture and a full physician examination, along with immunisation review and nutrition assessment. Each child gets a confidential health card for parents, and the school receives a class-wise summary with referral notes.",
      },
      {
        question: "Do you organise vaccination camps?",
        answer:
          "Yes. We run cold-chain vaccination drives in schools, factories, offices, care homes and communities for tetanus and Td/TT, hepatitis B, influenza, HPV, pneumococcal, rabies and other vaccines, with consent records, an observation area and a dose card for every recipient.",
      },
      {
        question: "Do you run dental, eye and other single-speciality camps?",
        answer:
          "Yes. We organise dental camps with scaling and fluoride application, eye camps with vision and cataract screening plus spectacle referrals, women's health and anaemia camps, general screening camps for BP, sugar and vitals, and blood test camps with on-site sample collection.",
      },
      {
        question: "Do you organise health camps in rural areas and smaller towns?",
        answer:
          "Yes. We run camps in villages, tribal and hill areas (subject to access), tier-2 and tier-3 towns, slums, construction and migrant-worker colonies and industrial belts, working with local NGOs, panchayats, schools and CSR teams for mobilisation.",
      },
      {
        question: "How soon do participants get their reports?",
        answer:
          "BP, sugar, haemoglobin, vision, dental and doctor-consult findings are available on camp day. Lab-based reports are delivered digitally within 24 to 72 hours, with normal and abnormal values flagged and a follow-up list for the cases that need care.",
      },
      {
        question: "Can a health camp be tailored to our needs?",
        answer:
          "Yes - every camp is tailored to the client. You choose the audience, screenings, tests, add-on specialities, staffing strength, camp duration, date and slot timings and the reporting format. We design the camp around that scope and quote only for what you select.",
      },
      {
        question: "How much does a health camp cost?",
        answer:
          "Camps are quoted per participant and depend on the tests and specialities selected, the number of participants, the city and venue, staffing strength and camp duration. Share your requirement and you receive a consolidated quotation within 24 hours, with no hidden charges.",
      },
    ],
  },
];

// Topic index: canonicalServiceKey(alias) -> group. Built once so a topic page can
// find its FAQs by DB name, static name, content key or URL param.
const TOPIC_INDEX = faqGroups.reduce((index, group) => {
  (group.service || []).forEach((alias) => {
    index[canonicalServiceKey(alias)] = group;
  });
  return index;
}, {});

/** Stable anchor id for a group heading, e.g. /faqs#faq-nursing-care-at-home. */
export const faqGroupAnchor = (title) =>
  `faq-${String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

/**
 * FAQs for one service/topic page - null when the topic has no group of its own
 * (General Questions), so the caller can skip the block instead of printing an
 * empty heading.
 */
export const getFaqsForTopic = (topic) => {
  const group = TOPIC_INDEX[canonicalServiceKey(topic)];

  if (!group?.items?.length) return null;

  return { ...group, anchor: faqGroupAnchor(group.title) };
};
