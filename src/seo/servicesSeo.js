/**
 * SEO copy for every speciality and service page.
 *
 * One row per topic, keyed by `canonicalServiceKey()` - the same normaliser
 * data/faqs.js uses - so a topic resolves whether it arrives as a DB name
 * ("Dermatologist"), a static name ("gynecology & obs"), a slug
 * ("general-physician") or a URL param ("Lab%20Tests").
 *
 * `param` is the value written into the URL (?serviceName= / ?name=). It is
 * deliberately the name the department page already matches against the DB -
 * changing it would turn live links into "Department Not Found".
 * `h1` is the keyword form people actually search, and is what the page heading
 * renders.
 *
 * The service rows repeat the seoTitle / seoDescription that already live in
 * ServiceDetailsComponent's content map, verbatim, so the SSR tags written here
 * and the page's own <Head> can never disagree after hydration.
 */
import { canonicalServiceKey } from "../customUtils/serviceKeys";

export const SERVICE_SEO = [
  {
    key: "generalphysician",
    kind: ["department"],
    param: "General Physician",
    aliases: [
      "General Physician",
      "general-physician",
      "physician",
      "General Medicine",
      "general medicine",
      "General Practitioner",
    ],
    h1: "General Physician & Internal Medicine",
    title: "General Physician Online Consultation | HealthPath",
    description:
      "Consult a general physician online or at home for fever, cold, infections, blood pressure, diabetes and routine check-ups. Same-day appointments, 7 days.",
    keywords:
      "general physician, online doctor consultation, physician consultation, fever treatment, general medicine doctor",
  },
  {
    key: "pediatrics",
    kind: ["department"],
    param: "Pediatrics",
    aliases: [
      "Pediatrics",
      "Paediatrics",
      "Pediatrician",
      "Paediatrician",
      "Child Specialist",
    ],
    h1: "Pediatrics & Child Specialist Care",
    title: "Pediatrician Online Consultation for Children | HealthPath",
    description:
      "Talk to a paediatrician online or in clinic for fever, cough, vaccination, growth, nutrition and newborn care. Child specialists available all 7 days.",
    keywords:
      "pediatrician, child specialist, online paediatric consultation, baby doctor, child vaccination",
  },
  {
    key: "cardiology",
    kind: ["department"],
    param: "Cardiology",
    aliases: ["Cardiology", "Cardiologist", "Heart Specialist"],
    h1: "Cardiology & Heart Care Specialists",
    title: "Cardiologist Consultation & Heart Check-up | HealthPath",
    description:
      "Book a cardiologist for chest pain, high blood pressure, cholesterol, ECG review and heart check-ups. Online and in-clinic consultations across India.",
    keywords:
      "cardiologist, heart specialist, heart check-up, chest pain doctor, blood pressure specialist",
  },
  {
    key: "dermatologist",
    kind: ["department"],
    param: "Dermatologist",
    aliases: ["Dermatologist", "Dermatology", "Skin Specialist", "derma"],
    h1: "Dermatology & Skin Care Specialists",
    title: "Dermatologist Online Consultation & Skin Care | HealthPath",
    description:
      "Consult a dermatologist online for acne, hair fall, pigmentation, eczema, fungal infections and skin allergies. Doctor-reviewed treatment plans, 7 days.",
    keywords:
      "dermatologist, derma, skin specialist, online skin consultation, acne treatment, hair fall treatment",
  },
  {
    key: "orthopaedics",
    kind: ["department"],
    param: "Orthopaedics",
    aliases: ["Orthopaedics", "Orthopedics", "Orthopaedic", "Bone Specialist"],
    h1: "Orthopaedics & Bone-Joint Care",
    title: "Orthopaedic Consultation for Bone & Joint Pain | HealthPath",
    description:
      "Get expert care for knee, back and joint pain, fractures, arthritis and sports injuries from orthopaedic specialists. Online or in-clinic visits.",
    keywords:
      "orthopaedic doctor, bone specialist, knee pain treatment, joint pain, arthritis specialist",
  },
  {
    key: "gynaecologyandobs",
    kind: ["department"],
    param: "gynecology & obs",
    aliases: [
      "gynecology & obs",
      "Gynaecology",
      "Gynecology",
      "Gynaecologist",
      "Gynecologist",
      "Obstetrics",
      "Gynaecology & Obstetrics",
    ],
    h1: "Gynaecology & Obstetrics Care",
    title: "Gynaecologist Consultation & Pregnancy Care | HealthPath",
    description:
      "Consult a gynaecologist for period problems, PCOS, fertility, pregnancy care and menopause. Private online consultations and in-clinic visits.",
    keywords:
      "gynaecologist, gynecologist, pregnancy care, PCOS treatment, period problems, obstetrician",
  },
  {
    key: "ophthalmology",
    kind: ["department"],
    param: "Ophthalmology",
    aliases: ["Ophthalmology", "Ophthalmologist", "Eye Specialist", "Eye Care"],
    h1: "Ophthalmology & Eye Care",
    title: "Eye Specialist Consultation & Vision Care | HealthPath",
    description:
      "Consult an eye specialist for blurred vision, redness, dry eyes, cataract and glasses review. Online and in-clinic ophthalmology consultations.",
    keywords:
      "eye specialist, ophthalmologist, eye check-up, blurred vision, cataract consultation",
  },
  {
    key: "pulmonology",
    kind: ["department"],
    param: "Pulmonology",
    aliases: ["Pulmonology", "Pulmonologist", "Chest Specialist", "Respiratory"],
    h1: "Pulmonology & Respiratory Care",
    title: "Pulmonologist Consultation for Asthma & COPD | HealthPath",
    description:
      "Talk to a pulmonologist about asthma, COPD, chronic cough, breathlessness and sleep apnoea. Inhaler guidance and long-term respiratory care plans.",
    keywords:
      "pulmonologist, chest specialist, asthma treatment, COPD care, chronic cough",
  },
  {
    key: "psychiatrist",
    kind: ["department"],
    param: "Psychiatrist",
    aliases: [
      "Psychiatrist",
      "Psychiatry",
      "Psychiatry & Mental Health",
      "Mental Health",
    ],
    h1: "Psychiatry & Mental Health Support",
    title: "Online Psychiatrist Consultation for Anxiety | HealthPath",
    description:
      "Consult a psychiatrist online for anxiety, depression, stress, sleep problems and addiction. Confidential video consultations with prescription support.",
    keywords:
      "psychiatrist, online psychiatrist, mental health consultation, anxiety treatment, depression help",
  },
  {
    key: "dentistry",
    kind: ["department"],
    param: "Dentistry",
    aliases: ["Dentistry", "Dentist", "Dental Care", "dental"],
    h1: "Dentistry & Oral Care",
    title: "Dentist Consultation & Dental Care at Home | HealthPath",
    description:
      "Book a dentist for tooth pain, cavities, gum problems, cleaning and dental check-ups. Online consultations and home dental visits in Gurgaon.",
    keywords:
      "dentist, dental care, tooth pain treatment, dental check-up, home dental visit",
  },
  {
    key: "physiotherapy",
    kind: ["department"],
    param: "Physiotherapy",
    aliases: [
      "Physiotherapy",
      "Physiotherapist",
      "Physio",
      "Rehabilitation",
    ],
    h1: "Physiotherapy & Home Rehabilitation",
    title: "Physiotherapy at Home for Pain & Recovery | HealthPath",
    description:
      "Book a physiotherapist at home for back, knee and neck pain, post-surgery rehab, stroke recovery and sports injuries. Trained therapists, 7 days.",
    keywords:
      "physiotherapy at home, physiotherapist, back pain physiotherapy, post surgery rehab, knee pain therapy",
  },
  {
    key: "nutritionist",
    kind: ["department"],
    param: "Nutritionist",
    aliases: [
      "Nutritionist",
      "Nutrition",
      "Dietitian",
      "Dietician",
      "Nutrition & Dietetics",
    ],
    h1: "Nutrition & Dietetics Consultation",
    title: "Nutritionist & Diet Plan Consultation Online | HealthPath",
    description:
      "Consult a nutritionist for weight loss, diabetes, PCOS, thyroid and sports nutrition. Personalised Indian diet plans with follow-up support.",
    keywords:
      "nutritionist, dietitian, online diet consultation, weight loss diet plan, PCOS diet",
  },

  // --- Services (/service-details?name=...&Service=...) ---------------------
  // seoTitle / seoDescription copied verbatim from the content map in
  // src/components/serviceDetails/ServiceDetailsComponent.js.
  {
    key: "consultation",
    kind: ["service"],
    param: "Doctor Consultation",
    contentKey: "consultation",
    aliases: ["Audio", "Video", "Audio Consultation", "Video Consultation"],
    h1: "Online & In-Clinic Doctor Consultation",
    title: "Expert Medical Consultation | Online & In-Clinic | HealthPath",
    description:
      "Book instant audio/video consultations or in-clinic visits with top-rated physicians. Trusted care from HealthPath.",
    keywords:
      "doctor consultation, online doctor, video consultation, audio consultation, book appointment",
  },
  {
    key: "nursingservices",
    kind: ["service"],
    param: "Nursing Services",
    contentKey: "nursing-services",
    aliases: ["Nursing Care", "Nursing Care at Home", "Home Nursing"],
    h1: "Nursing Care at Home",
    title:
      "Home Nursing Services in Gurgaon | IV Drip, Injection & Attendant Care | HealthPath",
    description:
      "Book certified nurses at home in Gurgaon for IV drips, injections, dressing, vaccination, post-operative and elderly care. Trained medical attendants, all 7 days.",
    keywords:
      "home nursing services, nurse at home Gurgaon, IV drip at home, injection at home, attendant care",
  },
  {
    key: "labtest",
    kind: ["service"],
    param: "Lab Investigation",
    contentKey: "lab-test",
    aliases: ["Labtest", "Lab Tests", "Blood Test", "Diagnostics"],
    h1: "Lab Investigation",
    title: "Home Lab Sample Collection & Testing | HealthPath",
    description:
      "Convenient home sample collection and lab testing services. Accurate results, certified labs, trusted healthcare.",
    keywords:
      "lab test at home, blood test home collection, home sample collection, diagnostic lab",
  },
  {
    key: "medicinedelivery",
    kind: ["service"],
    param: "Medicine Delivery",
    contentKey: "medicine-delivery",
    aliases: ["Medicines", "Pharmacy", "Medical Equipment"],
    h1: "Medicine Delivery & Homecare Equipment",
    title: "Medicine Delivery & HomeCare Equipment | HealthPath",
    description:
      "Reliable medicine delivery, home care support, and medical equipment for patients and families. Fast & safe.",
    keywords:
      "medicine delivery, online pharmacy, medical equipment rental, homecare supplies",
  },
  {
    key: "communitycare",
    kind: ["service"],
    param: "Community Care",
    contentKey: "community-care",
    aliases: ["Community Healthcare", "Medical Rooms", "Training Sessions"],
    h1: "Corporate & Community Healthcare Programs",
    title: "Corporate & Community Healthcare Programs | HealthPath",
    description:
      "Health camps, medical rooms, training sessions, and audits for large groups and organizations. Scalable wellness.",
    keywords:
      "community healthcare, medical rooms, health audits, wellness training, group healthcare",
  },
  {
    key: "corporatehealthcare",
    kind: ["department", "service"],
    param: "Corporate Healthcare",
    contentKey: "corporate-healthcare",
    aliases: ["Corporate Health", "Occupational Health", "OHC"],
    h1: "Corporate Healthcare Services Across India",
    title: "Corporate Healthcare Services in India | HealthPath",
    description:
      "Pan-India corporate healthcare: OHC medical rooms, doctors, nursing, emergency and physiotherapy, employee health packages, health camps and training sessions.",
    keywords:
      "corporate healthcare, occupational health centre, OHC setup, employee health packages, factory medical room",
  },
  {
    key: "healthcamp",
    kind: ["service"],
    param: "Healthcamp",
    contentKey: "healthcamp",
    aliases: ["Health Camp", "Health Camps", "Check-up Camp"],
    h1: "Health Check-up Camps Across India",
    title: "Health Check-up Camps in India | School, Corporate & NGO",
    description:
      "HealthPath runs pan-India health check-up camps for schools, corporates, elderly care and underprivileged communities - screenings, doctor consults and reports.",
    keywords:
      "health camp, health check-up camp, school health camp, corporate screening camp, NGO health camp",
  },
  {
    key: "homecare",
    kind: ["service"],
    param: "Home Care",
    contentKey: "home-care",
    aliases: ["Home Healthcare", "Homecare", "Attendant"],
    h1: "Home Care Services at Home",
    title:
      "Home Care Services in Gurgaon | Doctor Visit, Nursing & Physiotherapy at Home | HealthPath",
    description:
      "Home care from HealthPath brings doctor home visits, nursing, physiotherapy, medicine delivery, lab sample collection, GDA attendants, medical equipment and family support to your door.",
    keywords:
      "home care services, doctor home visit, nursing at home, physiotherapy at home, GDA attendant",
  },
];

// canonicalServiceKey() -> entry. Built once so a lookup is a Map hit.
const SERVICE_INDEX = SERVICE_SEO.reduce((index, entry) => {
  [entry.key, entry.param, entry.contentKey, ...(entry.aliases || [])]
    .filter(Boolean)
    .forEach((alias) => {
      const key = canonicalServiceKey(alias);
      if (key && !index.has(key)) index.set(key, entry);
    });

  return index;
}, new Map());

/** Registry entry for a name / slug / URL param, or null when it is unknown. */
export const getServiceSeo = (value) =>
  SERVICE_INDEX.get(canonicalServiceKey(value)) || null;

/**
 * Registry entry for a route's query object. Reads both the department param
 * (`serviceName`) and the service params (`name` / `Service`), so one helper
 * serves /department-single and /service-details.
 */
export const getServiceSeoFromQuery = (query = {}) => {
  const first = (value) => (Array.isArray(value) ? value[0] : value);

  return (
    getServiceSeo(first(query.Service ?? query.service)) ||
    getServiceSeo(first(query.name ?? query.serviceName)) ||
    null
  );
};

/** `serviceName=...` for a registry entry's department page. */
export const departmentQueryFor = (entry) =>
  `serviceName=${encodeURIComponent(entry.param)}`;

/** `name=...&Service=...` for a registry entry's service page. */
export const serviceQueryFor = (entry) =>
  `name=${encodeURIComponent(entry.param)}&Service=${encodeURIComponent(
    entry.contentKey || entry.key
  )}`;

/** Every topic that has a department page (nav, footer, sitemap). */
export const SPECIALITY_SEO = SERVICE_SEO.filter((entry) =>
  entry.kind.includes("department")
);

/** Every topic that has a /service-details page. */
export const SERVICE_PAGE_SEO = SERVICE_SEO.filter((entry) =>
  entry.kind.includes("service")
);
