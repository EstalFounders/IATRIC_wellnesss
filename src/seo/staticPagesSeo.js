/**
 * SEO copy for every standalone (non-speciality) route.
 *
 * Keyed by `router.pathname`, so dynamic templates keep their bracket form
 * ("/our-blog/[slug]") and are matched without a lookup table per slug.
 *
 * `canonicalPath` points a leftover template page at the page that should rank
 * for that intent (/doctor-2 -> /all-doctors). `noindex` covers app screens,
 * staff profiles and internal tools that must never appear in search.
 */
export const ROUTE_SEO = {
  "/": {
    title: "HealthPath | Doctors, Nursing, Lab Tests & Home Care",
    description:
      "Book doctor consultations online or at home, nursing care, lab tests at home, physiotherapy and medicine delivery across Gurgaon, Delhi NCR and India.",
    keywords:
      "online doctor consultation, home healthcare, nursing at home, lab test at home, home care Gurgaon",
  },
  "/about-us": {
    title: "About HealthPath | Home Healthcare & Doctor Network",
    description:
      "HealthPath is a home healthcare and doctor consultation network serving Gurgaon, Delhi NCR and pan-India corporates. Meet our team, doctors and care model.",
    keywords:
      "about healthpath, home healthcare company, doctor network India, healthpath team",
  },
  "/all-departments": {
    title: "All Departments & Specialities | HealthPath",
    description:
      "Browse every HealthPath speciality - general medicine, cardiology, dermatology, gynaecology, paediatrics, orthopaedics, psychiatry, dentistry and more.",
    keywords:
      "medical departments, specialities, doctors by speciality, healthpath departments",
  },
  "/all-doctors": {
    title: "Our Doctors | Verified Specialists Online | HealthPath",
    description:
      "Meet verified HealthPath doctors and specialists. Check experience, languages and consultation fees, then book an online or in-clinic appointment.",
    keywords:
      "doctors near me, verified doctors, specialist doctors, book doctor appointment",
  },
  "/all-services": {
    title: "All Healthcare Services | HealthPath",
    description:
      "Doctor consultation, home nursing, lab tests at home, physiotherapy, medicine delivery, home care, corporate healthcare and health camps - all in one place.",
    keywords:
      "healthcare services, doctor consultation service, home nursing service, diagnostic services",
  },
  "/appointment": {
    title: "Book a Doctor Appointment Online | HealthPath",
    description:
      "Book an online video or audio consultation, or an in-clinic visit, with a verified doctor in minutes. Same-day slots and digital prescriptions.",
    keywords:
      "book doctor appointment, online consultation booking, video doctor consultation, clinic appointment",
  },
  "/faqs": {
    title: "FAQs | Doctor Consultation, Nursing & Lab Tests | HealthPath",
    description:
      "Answers on online consultation, home nursing, lab sample collection, physiotherapy, medicine delivery, payments, prescriptions and reports.",
    keywords:
      "healthpath faqs, online consultation questions, home nursing faq, lab test faq",
  },
  "/gallery": {
    title: "HealthPath Gallery | Clinics, Camps & Home Care",
    description:
      "Photos from HealthPath clinics, home care visits, nursing teams, corporate medical rooms and community health camps across India.",
    keywords:
      "healthpath gallery, home care photos, health camp photos, clinic photos",
  },
  "/join-us": {
    title: "Careers at HealthPath | Doctors, Nurses & Support",
    description:
      "Join HealthPath as a doctor, nurse, physiotherapist or operations team member. Explore open roles across Gurgaon, Delhi NCR and pan-India sites.",
    keywords:
      "healthpath careers, doctor jobs, nurse jobs Gurgaon, healthcare jobs India",
  },
  "/our-blog": {
    title: "Health Blog | Doctor-Written Health Guides | HealthPath",
    description:
      "Practical health guides written and reviewed by HealthPath doctors - symptoms, home care, nutrition, lab tests and when to see a specialist.",
    keywords:
      "health blog, health guides, doctor advice, home care tips, nutrition articles",
  },
  "/pricing-1": {
    title: "Pricing & Consultation Fees | HealthPath",
    description:
      "Transparent fees for online and in-clinic consultation, home nursing, physiotherapy, lab tests and home care. No hidden charges.",
    keywords:
      "consultation fees, doctor consultation price, home nursing charges, lab test price",
  },
  "/pricing-2": {
    title: "Service Pricing Plans | HealthPath",
    description:
      "Compare HealthPath care plans and package pricing for doctor consultation, nursing, physiotherapy and home care before you book.",
    keywords: "healthcare packages, home care pricing, nursing packages",
    canonicalPath: "/pricing-1",
  },
  "/privacy-policy": {
    title: "Privacy Policy | HealthPath",
    description:
      "How HealthPath collects, stores and protects your personal and medical information, and how to request access or deletion of your data.",
    keywords: "healthpath privacy policy, data protection, medical records privacy",
  },
  "/terms-of-service": {
    title: "Terms of Service | HealthPath",
    description:
      "The terms that govern your use of HealthPath - bookings, cancellations, payments, prescriptions, teleconsultation consent and liability.",
    keywords: "healthpath terms, teleconsultation consent, booking terms",
  },
  "/contacts-1": {
    title: "Contact Us | HealthPath",
    description:
      "Call, WhatsApp or email HealthPath for appointments, home care, corporate healthcare and support. Find our Gurgaon office address.",
    keywords:
      "contact healthpath, healthpath phone number, healthpath Gurgaon address",
  },
  "/contacts-2": {
    title: "Contact HealthPath | Book a Consultation",
    description:
      "Talk to the HealthPath team about an appointment, home visit, lab test or corporate plan. Phone, WhatsApp, email and enquiry form.",
    keywords: "healthpath contact, book consultation, home visit enquiry",
  },
  "/demo-5": {
    title: "HealthPath Homecare & Doctor Consultation",
    description:
      "Doctors, nursing, lab tests, physiotherapy and home care from one HealthPath team - online, in clinic or at your door across India.",
    keywords: "homecare, doctor consultation, nursing services, lab tests",
  },
  "/doctor-info": {
    title: "Doctor Profile & Appointment | HealthPath",
    description:
      "See a HealthPath doctor's speciality, experience, languages and consultation fees, then book an online or in-clinic appointment.",
    keywords: "doctor profile, doctor experience, book doctor appointment",
  },
  "/our-blog/[slug]": {
    title: "Health Guide | HealthPath Blog",
    description:
      "A doctor-reviewed HealthPath guide on symptoms, home care, nutrition and when to see a specialist.",
    keywords: "health guide, doctor advice, healthpath blog",
  },

  // Leftover template pages - still reachable, but pointed at the page that owns
  // the intent so they cannot compete with it in search.
  "/doctor-2": {
    title: "Our Doctors | HealthPath",
    description:
      "Meet the HealthPath panel of verified doctors and specialists for online and in-clinic consultations.",
    canonicalPath: "/all-doctors",
  },
  "/service-1": {
    title: "Healthcare Services | HealthPath",
    description:
      "Doctor consultation, nursing, lab tests and home care services from HealthPath.",
    canonicalPath: "/all-services",
  },
  "/service-2": {
    title: "Healthcare Services | HealthPath",
    description:
      "Doctor consultation, nursing, lab tests and home care services from HealthPath.",
    canonicalPath: "/all-services",
  },
  "/who-we-are": {
    title: "Who We Are | HealthPath",
    description:
      "HealthPath is a doctor-led home healthcare company serving Gurgaon, Delhi NCR and pan-India corporate sites.",
    canonicalPath: "/about-us",
  },
  "/discover-more": {
    title: "Explore HealthPath Services | HealthPath",
    description:
      "Explore doctor consultation, home nursing, lab tests, physiotherapy and corporate healthcare from HealthPath.",
    canonicalPath: "/all-services",
  },
  "/timetable": {
    title: "Doctor Timetable | HealthPath",
    description:
      "Check available doctor slots and book an online, in-clinic or home visit with a HealthPath specialist.",
    canonicalPath: "/appointment",
  },

  // Never indexed: internal tools, feedback form, and the logged-in lab /
  // pharmacy screens (their public story is told on /service-details).
  "/feedback": {
    title: "Share Your Feedback | HealthPath",
    description:
      "Tell us how your HealthPath consultation, nursing visit or lab test went so we can keep improving patient care.",
    noindex: true,
  },
  "/all": { title: "HealthPath", noindex: true },
  "/single-post": { title: "HealthPath Blog", noindex: true },
  "/__devDoctorUpdateReqPreview": { title: "HealthPath", noindex: true },
  "/labTest/homepage": { title: "Lab Tests | HealthPath", noindex: true },
  "/labTest/viewAllCheckups": { title: "Check-up Packages | HealthPath", noindex: true },
  "/labTest/viewCheckups": { title: "Check-up Packages | HealthPath", noindex: true },
  "/labTest/viewAllTestDetails": { title: "Lab Tests | HealthPath", noindex: true },
  "/labTest/viewDetails": { title: "Lab Test Details | HealthPath", noindex: true },
  "/labTest/labReports": { title: "Lab Reports | HealthPath", noindex: true },
  "/medicine/homepage": { title: "Medicine Delivery | HealthPath", noindex: true },
  "/medicine/viewDetails": { title: "Medicine Details | HealthPath", noindex: true },
  "/nursing-staff/[id]": { title: "Nursing Staff | HealthPath", noindex: true },
};

/** Route prefixes that are private regardless of the page's own entry. */
export const PRIVATE_ROUTE_PREFIXES = [
  "/superAdmin",
  "/registerDoc",
  "/marketing",
  "/meeting",
  "/payment",
  "/api",
];

export const isPrivateRoute = (pathname = "") =>
  PRIVATE_ROUTE_PREFIXES.some((prefix) => String(pathname).startsWith(prefix));

