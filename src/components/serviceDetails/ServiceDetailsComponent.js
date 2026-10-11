import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import IconRenderer from "./IconRenderer"; // adjust path as needed
import { address, callToBook, color_schema, contact_no } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import CalltoBookPopup from "../Common/CalltoBookPopup";
import {
  getServiceDescription,
  resolveServiceKey,
  resolveServiceName,
} from "../../customUtils/serviceLinks";
import FaqSection from "../Common/FaqSection";
import { getFaqsForTopic } from "../../../data/faqs";
import { useLanguage } from "../../i18n/LanguageContext";

const serviceDetails = {
  consultation: {
    seoTitle: "Expert Medical Consultation | Online & In-Clinic | HealthPath",
    seoDescription:
      "Book instant audio/video consultations or in-clinic visits with top-rated physicians. Trusted care from HealthPath.",
    online: [
      {
        name: "Audio",
        iconKey: "audio",
        description:
          "Consult with a certified doctor over a phone call for instant medical advice from anywhere.",
      },
      {
        name: "Video",
        iconKey: "video",
        description:
          "Face-to-face video consultations with experienced professionals at your convenience.",
      },
    ],
    offline: [
      {
        name: "In Clinic",
        iconKey: "in clinic",
        description:
          "Visit top-rated clinics near you for personalized in-person medical care and diagnosis.",
      },
      {
        name: "Home Visit",
        iconKey: "home visit",
        description:
          "Doctors visit your home for personalized care without needing to step out.",
      },
    ],
  },
  "nursing-services": {
    seoTitle:
      "Home Nursing Services in Gurgaon | IV Drip, Injection & Attendant Care | HealthPath",
    seoDescription:
      "Book certified nurses at home in Gurgaon for IV drips, injections, dressing, vaccination, post-operative and elderly care. Trained medical attendants, all 7 days.",
    // Short, keyword-led intro. The full service list lives in `highlights` so the
    // page reads fast (and every service phrase stays crawlable).
    description:
      "HealthPath home nursing brings a certified nurse to your door across Gurgaon for injections, IV drips, dressing, vaccination and post-operative care, with single visits or long-hour shifts for elderly, bedridden or recovering patients - safe, scheduled clinical care, available all 7 days.",
    highlightsTitle: "Nursing services at home & in clinic",
    highlights: [
      "IV drips, injections & cannula care at home",
      "Vaccination & immunisation for adults and children",
      "Post-surgery dressing, suture, drain & wound care",
      "Elderly, bedridden & bed-sore patient care",
      "Nursing procedures at our clinic - ECG, injections & dressings",
      "Health camps, corporate & community nursing cover",
    ],
    // One card per nursing service/procedure - icon badge comes from `iconKey`.
    offlineTitle: "Nursing services we provide",
    offline: [
      {
        name: "Home Nursing Visit",
        iconKey: "home visit",
        image: "/images/home-care.jpg",
        imageAlt: "Nurse helping an elderly patient during a home nursing visit",
        description:
          "Routine vitals, medication, injections and general nursing care at your home, on a time that suits you.",
      },
      {
        name: "IV Drips & Injections at Home",
        iconKey: "iv drip",
        image: "/images/nursing/iv-drip-at-home.png",
        imageAlt:
          "Nurse administering an IV drip and injection to a patient at home",
        description:
          "IV fluids, IM/IV injections, cannula and line care administered safely at home by a qualified nurse.",
      },
      {
        name: "Vaccination & Immunisation",
        iconKey: "vaccination",
        image: "/images/quality_care_800x600.jpg",
        imageAlt: "Doctor examining a child before a vaccination dose",
        description:
          "Adult and child vaccination at home or in clinic as per schedule, with the dose record shared with you.",
      },
      {
        name: "Post-Operation Care",
        iconKey: "post operation",
        image: "/images/slider/slide-7.jpg",
        imageAlt: "Nurse monitoring a patient recovering after surgery",
        description:
          "Post-surgical dressing, suture and drain care, vitals monitoring and recovery support after discharge.",
      },
      {
        name: "Wound Care & Dressing",
        iconKey: "wound care",
        image: "/images/nursing/wound-care-dressing.png",
        imageAlt:
          "Nurse cleaning and dressing a patient's wound at home",
        description:
          "Sterile dressing of wounds, bed sores, diabetic foot ulcers and burns, with progress monitoring.",
      },
      {
        name: "Elderly & Bedridden Patient Care",
        iconKey: "elderly care",
        image: "/images/nursing-care.png",
        imageAlt:
          "Certified nurse providing bedridden elderly patient care at home",
        description:
          "Long-hour nursing for elderly patients - tube feeding, catheter care, repositioning and hygiene support.",
      },
      {
        name: "Nursing Procedures at Clinic",
        iconKey: "clinic visit",
        image: "/images/slider/slide-3.jpg",
        imageAlt: "Qualified nurse performing nursing procedures at the clinic",
        description:
          "Injections, IV drips, dressings, ECG and sample collection at our clinic by qualified nurses.",
      },
      {
        name: "Health Camps & Vaccination Drives",
        iconKey: "health camp",
        image: "/images/healthcamp.jpg",
        imageAlt: "Nursing team at a health camp and vaccination drive",
        description:
          "On-ground nursing teams for vaccination camps, health check-ups and corporate or community screening.",
      },
    ],
  },
  "lab-test": {
    seoTitle: "Home Lab Sample Collection & Testing | HealthPath",
    seoDescription:
      "Convenient home sample collection and lab testing services. Accurate results, certified labs, trusted healthcare.",
    // Merged "Labtest" / "Lab Investigation" service: published as one page and
    // announced as coming soon, so no booking CTA is offered yet.
    comingSoon: true,
    h1: "Lab Investigation",
    offline: [
      {
        name: "Home Sample Collection",
        iconKey: "home sample",
        description:
          "Phlebotomists collect lab samples from your home. Hassle-free and hygienic.",
      },
      {
        name: "Test In Lab",
        iconKey: "lab test",
        description:
          "Visit certified labs for reliable diagnostic testing services.",
      },
    ],
  },
  "medicine-delivery": {
    seoTitle: "Medicine Delivery & HomeCare Equipment | HealthPath",
    seoDescription:
      "Reliable medicine delivery, home care support, and medical equipment for patients and families. Fast & safe.",
    // Announced as coming soon: the page explains what will be offered, but no
    // booking CTA is offered yet.
    comingSoon: true,
    offline: [
      {
        name: "At Home",
        iconKey: "medicine at home",
        description:
          "Prescription medicines delivered directly to your doorstep.",
      },
      {
        name: "For Home Care",
        iconKey: "home care",
        description:
          "Essential supplies for home caregiving including support aids and hygiene kits.",
      },
      {
        name: "HomeCare Equipment",
        iconKey: "equipment",
        description:
          "Wheelchairs, beds, oxygen concentrators, and more available for rent or purchase.",
      },
    ],
  },
  "community-care": {
    seoTitle: "Corporate & Community Healthcare Programs | HealthPath",
    seoDescription:
      "Health camps, medical rooms, training sessions, and audits for large groups and organizations. Scalable wellness.",
    offline: [
      {
        name: "Medical Rooms OHL",
        iconKey: "medical room",
        description:
          "Onsite health lounges for continuous workplace medical support.",
      },
      {
        name: "Equipment Calibrator",
        iconKey: "equipment calibrator",
        description:
          "Ensure medical equipment accuracy with professional calibration services.",
      },
      {
        name: "Bulk Medicine",
        iconKey: "bulk medicine",
        description:
          "Affordable bulk medicine supplies for organizations or camps.",
      },
      {
        name: "Health Camp",
        iconKey: "health camp",
        description:
          "Organized healthcare checkup camps for communities or corporates.",
      },
      {
        name: "Task Show",
        iconKey: "task show",
        description:
          "Health awareness activities conducted through live task demonstrations.",
      },
      {
        name: "Session",
        iconKey: "session",
        description: "Interactive wellness sessions hosted by experts.",
      },
      {
        name: "Training",
        iconKey: "training",
        description:
          "Staff training in first aid, CPR, hygiene, and basic health support.",
      },
      {
        name: "Audits",
        iconKey: "audits",
        description: "Health safety audits to ensure compliance and readiness.",
      },
    ],
  },
  // Corporate healthcare: long-form page content opened from the "Corporate
  // Healthcare" tab on /all-services and the Discover More card.
  "corporate-healthcare": {
    seoTitle: "Corporate Healthcare Services in India | HealthPath",
    seoDescription:
      "Pan-India corporate healthcare: OHC medical rooms, doctors, nursing, emergency and physiotherapy, employee health packages, health camps, awareness and training sessions.",
    h1: "Corporate Healthcare Services Across India",
    description:
      "HealthPath is a pan-India corporate healthcare partner for offices, factories, warehouses and project sites. We set up and run your OHC, staff it with doctors, nurses, paramedics and physiotherapists, deliver employee health packages, camps and training, and report on every location from a single coordination desk.",
    offlineTitle: "Corporate Healthcare Services",
    offline: [
      {
        name: "OHC & Medical Room Setup",
        iconKey: "medical room",
        description:
          "Complete OHC rooms and workplace health lounges - layout, equipment, consumables, staffing and inspection-ready records at every location.",
      },
      {
        name: "Doctors & Physician Visits",
        iconKey: "doctor",
        description:
          "Part-time, full-time or visiting doctors for your plant or office, backed by teleconsultation for employees and their families.",
      },
      {
        name: "Nursing & Paramedic Cover",
        iconKey: "clinic visit",
        description:
          "Registered nurses, GNM/ANM staff and paramedics on shift rosters - injections, IV drips, dressings, vitals, first aid and patient monitoring.",
      },
      {
        name: "Emergency & Ambulance Response",
        iconKey: "emergency",
        description:
          "Emergency preparedness with ambulance coordination, emergency response teams, AED handling and tie-ups with nearby hospitals.",
      },
      {
        name: "Physiotherapy & Rehabilitation",
        iconKey: "physiotherapy",
        description:
          "Onsite physiotherapy, posture and ergonomics screening, and rehabilitation for musculoskeletal and occupational injury.",
      },
      {
        name: "Employee Health Packages",
        iconKey: "health package",
        description:
          "Pre-employment, periodic and executive health checkups with packages matched to your company policy and budget, per location.",
      },
      {
        name: "Health Camps & Screening Drives",
        iconKey: "health camp",
        description:
          "Health camps, BP-sugar-BMI screening, eye and dental camps, women's health drives and vaccination camps for employees and families.",
      },
      {
        name: "Awareness Sessions",
        iconKey: "session",
        description:
          "Doctor-led sessions on lifestyle disease, stress and mental well-being, nutrition, ergonomics and women's health, in English and Hindi.",
      },
      {
        name: "Basic Training Sessions",
        iconKey: "training",
        description:
          "Hands-on first aid, CPR, BLS, ERT and hygiene training with assessment and certification for EHS teams, wardens and floor marshals.",
      },
      {
        name: "Equipment, Calibration & Bulk Medicine",
        iconKey: "equipment calibrator",
        description:
          "Supply, calibration and maintenance of OHC equipment, plus genuine bulk medicines and consumables delivered to every site.",
      },
      {
        name: "Compliance, Audits & MIS",
        iconKey: "audits",
        description:
          "OHC compliance checklists, health audits, statutory records, incident logs and monthly dashboards for HR and EHS teams.",
      },
    ],
    // No `highlights`, `sections` or `tabs` on this page: the client asked for the
    // explanatory prose and the coverage tab bar to be removed, so the 11 service
    // cards carry the page. The 8 tab/paragraph texts are recoverable from git
    // history (they are the former `sections` block of this same key). The FAQs
    // come from data/faqs.js (group "Corporate Healthcare").
  },

  healthcamp: {
    seoTitle: "Health Check-up Camps in India | School, Corporate & NGO",
    seoDescription:
      "HealthPath runs pan-India health check-up camps for schools, corporates, elderly care and underprivileged communities - screenings, doctor consults and reports.",
    h1: "Health Check-up Camps Across India",
    description:
      "HealthPath organises preventive health check-up camps across India for schools, corporates, elderly-care homes and underprivileged communities. Our medical teams handle registration, vitals, blood collection, on-site doctor consults and reporting, so you get real health data for your students, employees, residents or community along with clear follow-up guidance. Every camp is modular - you choose the screenings, tests, specialities and add-ons you need, and we tailor staffing, timings and packaging to your group and budget. From a one-day camp in a village to a multi-city corporate screening drive, we plan, staff and run it end to end.",
    highlightsTitle: "What a HealthPath health camp includes",
    highlights: [
      "Camp planning, site survey, permissions and on-site setup",
      "Doctors, nurses, phlebotomists, lab technicians and trained volunteers",
      "Registration, consent, height, weight, BMI, BP and pulse screening",
      "Blood collection with cold chain and same-day or next-day reporting",
      "Vision, dental, ENT and general physician consultation",
      "Women's health, anaemia and nutrition screening",
      "Vaccination camps with cold-chain handling, consent records and dose cards",
      "Single-problem screening camps - BP and sugar, eye, dental or ECG",
      "Digital reports with normal and abnormal flags for every participant",
      "Referral and follow-up support for abnormal findings",
      "Awareness talks on hygiene, nutrition, lifestyle disease and tobacco",
      "Fully modular camps - pick screenings, tests, add-ons and staffing to fit your group and budget",
    ],
    tabsTitle: "What a HealthPath health camp covers",
    tabsNote:
      "Every camp is tailored to the client's needs - audience, screenings, tests, add-on specialities, staffing, camp duration and reporting format are all configurable, and we quote only for what you select.",
    tabs: [
      {
        id: "schools",
        label: "Schools & Colleges",
        heading: "Annual health check-up camps for schools and colleges",
        body: [
          "School camps are planned around your academic calendar - one day for the whole school, class-wise slots across a week, or a rolling camp through the term. Each student is registered with a unique ID so the child's record stays comparable year after year.",
          "Every student gets a confidential health card for parents, and the school receives a class-wise summary of findings so teachers and trustees know which children need attention, support or medical leave.",
        ],
        groups: [
          {
            title: "Screenings covered",
            items: [
              "Height, weight, BMI and growth charting",
              "Vision and colour-vision test",
              "Dental and oral hygiene check",
              "ENT (ear, nose and throat) screening",
              "Haemoglobin and anaemia screening",
              "General physician examination",
              "Skin, hair and nail screening",
              "Blood pressure for older students",
              "Posture and spine check",
              "Immunisation review and missed-dose list",
              "Nutrition, hygiene and screen-time assessment",
            ],
          },
          {
            title: "Reports and follow-up",
            items: [
              "Individual health card for every parent",
              "Class-wise and school-wise summary for the principal or trust",
              "Flagging of anaemia, underweight, obesity, vision and dental issues",
              "Referral notes for paediatrician, ophthalmologist or dentist follow-up",
              "Parent counselling on nutrition, hygiene and screen time",
            ],
          },
          {
            title: "Add-ons popular with schools",
            items: [
              "Dental camp with scaling and fluoride application",
              "Vaccination drives (HPV, Td/TT and others as required)",
              "Adolescent health and menstrual hygiene sessions",
              "Teacher and non-teaching staff health check-up",
            ],
          },
        ],
      },
      {
        id: "corporates",
        label: "Corporates & Workplaces",
        heading: "Corporate health check-up camps for offices, plants and warehouses",
        body: [
          "Onsite camps fit your shift pattern - early-morning slots before duty, staggered batches through the day, or a weekend camp with families. Samples are collected on site and results are compiled digitally, so no employee loses a full working day.",
          "HR receives aggregate health-risk data instead of scattered files, which makes the camp useful for wellness planning, insurance discussions and statutory health-surveillance records.",
        ],
        groups: [
          {
            title: "Packages and tests covered",
            items: [
              "Vitals, BMI and body composition",
              "Blood pressure, pulse and SpO2",
              "Blood sugar (fasting or random) and HbA1c",
              "Full blood count and haemoglobin",
              "Lipid profile",
              "Liver and kidney function tests",
              "Thyroid profile",
              "Urine routine and microscopy",
              "ECG",
              "Vision and colour vision for drivers and machine operators",
              "Audiometry / hearing screening",
              "Chest X-ray, PFT and spirometry where required",
              "Doctor consultation with report explanation",
              "Women's health checks and gynaec consultation",
              "Vitamin D, B12 and other add-on tests",
            ],
          },
          {
            title: "Compliance and surveillance support",
            items: [
              "Pre-employment and periodic check-up formats",
              "Health surveillance for hazardous-process workers with yearly records",
              "Female worker health checks and night-shift fitness review",
              "Food-handler medicals for canteen staff",
              "Medically fit and fit-with-restrictions certificates",
              "Vaccination camps (tetanus, hepatitis B, influenza)",
            ],
          },
          {
            title: "Reports and HR summary",
            items: [
              "Digital reports in 24 to 72 hours with normal / abnormal flags",
              "Follow-up list of every abnormal finding",
              "Aggregate health-risk dashboard by department, age band and gender",
              "Awareness talk and lifestyle counselling for employees",
            ],
          },
        ],
      },
      {
        id: "elderly",
        label: "Elderly & Senior Citizens",
        heading: "Health camps for elderly care homes and senior citizen groups",
        body: [
          "Camps for old-age homes, geriatric-care centres and senior-citizen societies are run at a gentler pace - seated stations, shorter queues and helpers guiding each resident through every step.",
          "Our team reviews existing prescriptions and recent reports before the camp, so findings are read against what the resident is already being treated for and abnormal results reach the family or caregiver without delay.",
        ],
        groups: [
          {
            title: "Screenings covered",
            items: [
              "Blood pressure, pulse and SpO2",
              "Blood sugar and HbA1c",
              "Haemoglobin and anaemia screening",
              "ECG",
              "Vision and cataract screening",
              "Hearing screening",
              "Mobility, balance and fall-risk assessment",
              "Memory and cognition screen where indicated",
              "Skin, foot and pressure-ulcer check",
              "Dental and oral care",
              "Nutrition and hydration review",
              "Medicine and polypharmacy review",
            ],
          },
          {
            title: "Care after the camp",
            items: [
              "Geriatrician and physician consultation",
              "Physiotherapy and mobility plan",
              "Home nursing, attendant or doctor visit for residents who need it",
              "Influenza and pneumococcal vaccination",
              "Caregiver counselling on diet, medicine timing and fall prevention",
            ],
          },
          {
            title: "Options for care homes",
            items: [
              "Quarterly repeat camps with a shared resident health register",
              "Room-wise screening for infection control",
              "Staff health check-up and training",
            ],
          },
        ],
      },
      {
        id: "community",
        label: "NGOs, CSR & Community",
        heading: "Health camps for underprivileged communities, NGOs and CSR programmes",
        body: [
          "We run free and subsidised camps in villages, urban slum pockets, construction sites, migrant-worker colonies, shelter homes and industrial belts - with local partners, panchayats, RWAs, schools, religious bodies and CSR teams handling mobilisation.",
          "Camps are designed to be low-barrier: no prior registration for basic screening, an on-the-spot registration desk, local-language instructions and female staff present so women and adolescents feel comfortable attending.",
        ],
        groups: [
          {
            title: "What the camp covers",
            items: [
              "General physician consultation with free or subsidised medicines",
              "Blood pressure, blood sugar and BMI screening",
              "Haemoglobin and anaemia screening for women and adolescent girls",
              "Eye and vision screening with spectacle referrals",
              "Dental check",
              "ENT and skin screening",
              "Pregnancy and women's health consultation",
              "Nutrition assessment and supplements where available",
              "TB and lifestyle-disease risk screening with programme referral",
              "Vaccination (tetanus, hepatitis B, HPV)",
              "Hygiene, sanitation, nutrition and substance-abuse awareness talks",
            ],
          },
          {
            title: "Community and partner support",
            items: [
              "Referral slips and help with onward government or PPM scheme linkage",
              "Follow-up camp scheduled for cases that need review",
              "Camp report for the CSR or NGO team - footfall, findings, referrals and cost per beneficiary",
              "Support with CSR documentation, photographs and compliance records",
            ],
          },
          {
            title: "Where we work",
            items: [
              "Metro slums and resettlement colonies",
              "Tier-2 and tier-3 towns and villages",
              "Tribal and hill areas, subject to access",
              "Industrial and mining belts",
              "Disaster-relief, flood and heat-wave medical camps",
            ],
          },
        ],
      },
      {
        id: "vaccination",
        label: "Vaccination Camps",
        heading: "Vaccination camps for schools, workplaces, communities and care homes",
        body: [
          "Vaccination camps are run as a standalone drive or added to an existing health camp, with cold-chain handling, batch and expiry records, consent forms and a vaccination card for every person who receives a dose.",
          "Volume is planned in advance with your team - anything from 100 to 1,000+ doses in a day - and doses are sourced from licensed distributors or partner hospital and PHC programmes depending on the vaccine.",
        ],
        groups: [
          {
            title: "Vaccines we arrange",
            items: [
              "Tetanus and Td / TT booster",
              "Hepatitis B (3-dose schedule with follow-up)",
              "Influenza (annual)",
              "HPV for adolescent girls (2 or 3-dose schedule)",
              "Pneumococcal and shingles for the elderly",
              "Rabies post-exposure schedule",
              "MMR, varicella, twinrix and other travel or workplace vaccines on request",
              "Routine paediatric immunisation review for schools",
            ],
          },
          {
            title: "How the drive works",
            items: [
              "Pre-camp screening for contraindications",
              "Consent and allergy history taken for every recipient",
              "Insulated cold-chain boxes with temperature logs",
              "Single-use syringes and aseptic technique",
              "15 to 30 minute observation area after every dose",
              "Batch number, date and next dose recorded on the card",
              "Next-dose reminder and a follow-up camp",
            ],
          },
          {
            title: "Typical use cases",
            items: [
              "School HPV and Td / TT drives",
              "Factory tetanus and hepatitis B camps for hazardous-process workers",
              "Hospital or PHC-supported community drives",
              "Old-age-home influenza and pneumococcal rounds",
              "Pre-monsoon tetanus and rabies camps in flood-prone belts",
            ],
          },
        ],
      },
      {
        id: "screening",
        label: "Screening & Dental Camps",
        heading: "Screening, diagnostic and dental camps",
        body: [
          "Focused camps screen one problem properly instead of everything superficially - a BP and sugar camp in a community hall, an eye camp with spectacle referrals, a dental camp with scaling and fluoride application, or an ECG and lipid camp for a high-risk group.",
          "Each camp is run with the equipment, consumables and specialist support that screening needs, and every abnormal finding leaves with a written referral for follow-up at the facility of the participant's choice.",
        ],
        groups: [
          {
            title: "General and lifestyle screening camp",
            items: [
              "Blood pressure, pulse, SpO2 and BMI",
              "Random or fasting blood sugar",
              "Haemoglobin and anaemia screening",
              "ECG for high-risk participants",
              "Lipid profile",
              "Lifestyle-risk scoring with doctor consult",
              "Diet and exercise counselling",
            ],
          },
          {
            title: "Diagnostic and lab camp",
            items: [
              "On-site sample collection with cold chain",
              "CBC, HbA1c, LFT, KFT, thyroid and vitamin D / B12 panels",
              "Urine routine and microscopy",
              "Portable ECG or ultrasound where a clinician is present",
              "Reports in 24 to 72 hours with normal / abnormal flags",
            ],
          },
          {
            title: "Eye, dental and specialist camps",
            items: [
              "Vision and colour-vision screening with spectacle referral",
              "Cataract screening and surgical referral",
              "Dental check, scaling and fluoride application with toothbrush kits",
              "Oral hygiene and tobacco-cessation counselling",
              "ENT, skin and women's health screening camps",
              "Physiotherapy and posture screening for workplace groups",
            ],
          },
        ],
      },
    ],
    onlineTitle: "Online Support Before & After the Camp",
    online: [
      {
        name: "Teleconsultation Follow-up",
        iconKey: "audio",
        description:
          "Our doctors call participants after the camp to explain a report, adjust medication or start treatment without a clinic visit.",
      },
      {
        name: "On-Call Report Explanation",
        iconKey: "video",
        description:
          "Video walkthrough of the report for the participant, parent or HR team, with a clear note on what needs attention next.",
      },
      {
        name: "Specialist Second Opinion",
        iconKey: "doctor",
        description:
          "Second opinion from a specialist on any abnormal finding, before you decide on tests, surgery or long-term treatment.",
      },
      {
        name: "Medicines & Repeat Tests at Home",
        iconKey: "medicine at home",
        description:
          "Prescribed medicines delivered home and repeat blood tests collected from the doorstep, in the cities we serve.",
      },
      {
        name: "Home Nursing & Doctor Visits",
        iconKey: "home visit",
        description:
          "Nursing, physiotherapy or a doctor visit at home for participants who need continued care after the camp.",
      },
    ],
    offlineTitle: "Health Camps We Organise Across India",
    offline: [
      {
        name: "School & College Annual Health Check-up Camp",
        iconKey: "health camp",
        description:
          "Class-wise screening day with height, weight, BMI, vision, dental, haemoglobin and physician checks, plus a health card for every student.",
      },
      {
        name: "Corporate Health Check-up Camp",
        iconKey: "health package",
        description:
          "Shift-friendly onsite camp with vitals, blood panels, ECG and doctor consults, and an aggregated health-risk summary for HR.",
      },
      {
        name: "Elderly Care Health Check-up Camp",
        iconKey: "elderly care",
        description:
          "Gentle-paced camps at old-age homes and senior-citizen societies with ECG, sugar, anaemia, fall-risk screening and caregiver counselling.",
      },
      {
        name: "Underprivileged & Community Health Camp",
        iconKey: "gda services",
        description:
          "Free or subsidised camps in villages, slums, construction and migrant-worker colonies, with physician consults, medicines and scheme referrals.",
      },
      {
        name: "Vaccination Camp",
        iconKey: "vaccination",
        description:
          "Cold-chain vaccination drives for schools, factories, care homes and communities, with consent records, an observation area and dose cards.",
      },
      {
        name: "General Screening & Vitals Camp",
        iconKey: "doctor",
        description:
          "BP, pulse, SpO2, BMI, blood sugar and haemoglobin screening with a doctor consult for every participant and written referrals.",
      },
      {
        name: "Blood Test & Lab Investigation Camp",
        iconKey: "lab test",
        description:
          "On-site sample collection with cold chain for CBC, sugar, HbA1c, lipid, LFT, KFT, thyroid and vitamin panels, reported in 24 to 72 hours.",
      },
      {
        name: "Eye & Dental Screening Camp",
        iconKey: "clinic visit",
        description:
          "Vision and cataract screening with spectacle referrals, plus dental check, scaling and fluoride application with oral-hygiene counselling.",
      },
    ],
    sections: [
      {
        heading: "How a HealthPath health camp runs, end to end",
        body: [
          "One coordinator owns your camp from the first enquiry to report closure - audience and headcount, the screenings to be done, site survey, date and slots, permissions, equipment and consumable planning, staffing rosters and the reporting timeline are all fixed before camp day.",
          "On the day, our team sets up the stations itself: a registration and consent desk, vitals and anthropometry, a doctor consultation room with a privacy partition, sample collection with cold-chain boxes, a mini-lab for on-the-spot sugar and haemoglobin, plus ECG, vision and hearing stations as per scope. An MBBS doctor, registered nurses, phlebotomists and a lab technician stay on site for the full duration while trained volunteers manage the queue.",
          "After the camp, the organiser receives a digital registration and attendance sheet, participant-wise reports within 24 to 72 hours, a list of abnormal findings for follow-up, and a camp summary covering footfall, screenings completed, findings and referrals.",
        ],
      },
      {
        heading: "Tests and screenings covered in a camp",
        body: [
          "The test menu is quoted per participant, so a camp can be built around your budget and the age group attending - include only vitals and a doctor consult, add a blood panel, or run the full package with lab, ECG, vision and dental.",
        ],
        items: [
          "Vitals - height, weight, BMI, waist circumference, BP, pulse, SpO2 and temperature",
          "General physician and specialist consultation with report explanation",
          "Vision, colour vision and hearing screening",
          "Dental and oral examination",
          "ECG and, where a clinician is present, portable ultrasound",
          "Blood sugar (fasting or random) and HbA1c",
          "Complete blood count and haemoglobin",
          "Lipid profile, liver function and kidney function tests",
          "Thyroid profile (TSH)",
          "Urine routine and microscopy",
          "Vitamin D, vitamin B12, ESR/CRP and other panels where medically indicated",
          "Women's health - gynaec consultation, breast-examination awareness and Pap smear where a clinician is present",
          "Anaemia and nutrition profiling for adolescents, mothers and the elderly",
          "TB symptom and lifestyle-disease risk screening with referral",
          "Cancer-awareness screening with referral to a partner facility",
          "Paediatric screening and adolescent health assessment for schools",
        ],
      },
      {
        heading: "Reports, records and follow-up after the camp",
        body: [
          "Every participant gets a digital report with normal and abnormal values flagged, in one common format whether the camp was in a metro or a village. Reports reach the participant, parent, resident's family or the organisation's health desk within 24 to 72 hours, while BP, sugar and haemoglobin results are available on camp day itself.",
          "For organisations we add an aggregate, anonymised summary - footfall, screenings completed, key findings and referrals - that HR, principals, care-home managers and CSR teams can use for planning. Individual medical data is shared only with the participant's consent, records are retained for the follow-up window agreed with you, and every case that needs further care leaves with a written referral that our team tracks.",
        ],
      },
      {
        heading: "Pan-India coverage: villages, towns and metros",
        body: [
          "HealthPath runs camps in metro cities, tier-1, tier-2 and tier-3 towns, villages, tribal and hill areas (subject to access), industrial belts and disaster-affected zones. Local phlebotomists, nurses and coordinators are engaged city by city, while our central team owns medical protocols, doctor deployment and reporting standards.",
          "For multi-location programmes - a school chain, a factory group, a CSR project or an NGO network - you sign one contract and deal with one coordinator, and the same standard operating procedure, equipment list and report format is used at every site.",
        ],
      },
      {
        heading: "Why schools, companies, RWAs and NGOs choose HealthPath",
        body: [
          "Organisations choose us because one team handles planning, permissions, staffing, execution and reporting - with qualified and registered medical staff, calibrated equipment, standard consumables and a fixed per-participant quote with no hidden charges.",
          "Camps are fully modular: the audience, screenings, tests, add-on specialities, staffing strength, camp duration and reporting format are all tailored to what the client needs, so a 60-participant society camp and a 3,000-employee corporate drive each get an appropriately designed camp. Repeat camps for the next cycle are scheduled with the same team, which keeps records comparable year on year.",
        ],
      },
    ],
  },

  // Home Care is its own branch (not the same service as Nursing Care). Each of
  // the eight services it includes is a card in `offline` (icon badge from
  // `iconKey`), so the names stay crawlable without a second bullet list.
  "home-care": {
    seoTitle:
      "Home Care Services in Gurgaon | Doctor Visit, Nursing & Physiotherapy at Home | HealthPath",
    seoDescription:
      "Home care from HealthPath brings doctor home visits, nursing, physiotherapy, medicine delivery, lab sample collection, GDA attendants, medical equipment and family support to your door.",
    h1: "Home Care Services at Home",
    description:
      "Home care at HealthPath is one team for everything a patient needs at home - a doctor's visit, nursing care, physiotherapy, medicines, lab sample collection, trained attendants (GDA), medical equipment and support for the family. Book a single visit or a full care plan, coordinated through one point of contact.",
    // The eight services this branch provides: one card each, with the icon badge
    // drawn from `iconKey` (see IconRenderer.js).
    offlineTitle: "Home care services we provide",
    offline: [
      {
        name: "Doctor Home Visit",
        iconKey: "doctor home visit",
        description:
          "A doctor at your home for consultation, prescription and follow-up - ideal for elderly, immobile or post-discharge patients.",
      },
      {
        name: "Physiotherapy at Home",
        iconKey: "physiotherapy",
        description:
          "Certified physiotherapists treat pain, stiffness, post-surgery and stroke recovery at home, with an exercise plan you keep.",
      },
      {
        name: "Nursing Care at Home",
        iconKey: "nursing care",
        description:
          "Trained nurses for injections, IV drips, dressing, catheter and tube feeding - a single visit or 12/24-hour shifts.",
      },
      {
        name: "Medicine Delivery at Home",
        iconKey: "medicine delivery",
        description:
          "Prescription and over-the-counter medicines delivered to your door, with refill reminders and cold-chain handling where needed.",
      },
      {
        name: "Lab Sample Collection at Home",
        iconKey: "lab sample collection",
        description:
          "Trained phlebotomists collect blood and other samples at home; reports reach your phone, with a doctor review on request.",
      },
      {
        name: "GDA Services",
        iconKey: "gda services",
        description:
          "Trained General Duty Assistants (GDA) for bathing, feeding, mobility, bed and toilet support, in 12 or 24-hour shifts.",
      },
      {
        name: "Medical Equipment Supply at Home",
        iconKey: "equipment",
        description:
          "Wheelchairs, hospital beds, oxygen concentrators, nebulizers, BP monitors and CPAP/BiPAP machines, delivered and set up at home.",
      },
      {
        name: "Support at Home",
        iconKey: "support at home",
        description:
          "Care coordination, attendant shifts and one point of contact for appointments, refills and caregiver relief for the family.",
      },
    ],
  },
};

// Two-column bullet grid, reused by the coverage tabs and the section item lists.
const bulletGridSx = {
  m: 0,
  pl: { xs: 2.5, md: 4 },
  display: "grid",
  gap: 0.5,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
};

// Shared style for the round icon badge: beside the text on plain cards, and
// overlaid on the photo header when a card carries an image.
const iconCircleSx = {
  width: 50,
  height: 50,
  padding: 1,
  borderRadius: "50%",
  backgroundColor: "#ffffff",
  border: `1px solid ${color_schema.green}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const ServiceDetail = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [isCalltoBookDialog, setIsCalltoBookDialog] = useState(false);
  // Active panel of the optional coverage tabs (`tabs` in a serviceDetails block).
  const [activeDetailTab, setActiveDetailTab] = useState(0);
  // Photos that failed to load. A service card can declare an `image`; if that
  // file is missing we drop back to the icon-only card instead of showing a gap.
  const [failedCardImages, setFailedCardImages] = useState([]);
  const hasCardImage = (item) =>
    Boolean(item.image) && !failedCardImages.includes(item.image);

  // Display name for the heading (clean name, never a raw slug/id) and the key
  // for the rich content blocks in `serviceDetails`.
  const serviceName = resolveServiceName(router.query);
  const serviceKey = resolveServiceKey(router.query);

  const medical_service = serviceDetails[serviceKey];

  // FAQs for this topic only - the same copy the /faqs page shows for this
  // service, so the two can never drift. `medical_service.faqs` stays as a
  // fallback for a content block that has no FAQ group of its own.
  const topicFaqs = getFaqsForTopic(serviceKey) || getFaqsForTopic(serviceName);
  const faqItems = topicFaqs?.items || medical_service?.faqs || [];

  // Structured data for the service page: names the service, its procedures and
  // the clinic it is delivered from (helps local healthcare rich results).
  const serviceSchema = medical_service
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: serviceName || medical_service.seoTitle,
        serviceType: serviceName,
        description: medical_service.description || medical_service.seoDescription,
        areaServed: { "@type": "Country", name: "India" },
        ...(medical_service.offline?.length
          ? {
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: `${serviceName} services`,
                itemListElement: medical_service.offline.map((item) => ({
                  "@type": "Offer",
                  itemOffered: { "@type": "Service", name: item.name },
                })),
              },
            }
          : {}),
        provider: {
          "@type": "MedicalClinic",
          name: "HealthPath",
          telephone: contact_no,
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressCountry: "IN",
          },
        },
      }
    : null;

  const handleOpenCalltoBookDialog = (serviceName) => {
    setIsCalltoBookDialog(true);
  };
  const handleCloseCalltoBookDialog = () => {
    setIsCalltoBookDialog(false);
  };

  const handleCalltoBookPopupSubmit = (mobNo) => {
    setMobNo(mobNo);
    setOtpConfirmationPopup(true);
  };

  if (!medical_service) {
    // No dedicated content block for this service: show the clean service name
    // and a booking CTA instead of a dead end.
    const fallbackTitle = serviceName
      ? `${serviceName} | HealthPath`
      : "Our Services | HealthPath";

    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Head>
          <title>{fallbackTitle}</title>
          <meta
            name="description"
            content={
              serviceName
                ? `Book ${serviceName} services with HealthPath - online consultation, home visits and clinic care.`
                : "Explore the services offered by HealthPath and book a consultation."
            }
          />
        </Head>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {serviceName || "Our Services"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {getServiceDescription(serviceName) ||
            "Choose how you would like to consult and our team will confirm the next available slot."}
        </Typography>

        <ConsultationButton path={"/appointment"}>{callToBook}</ConsultationButton>

        {/* Specialities that reach this generic page still get their own FAQs. */}
        {faqItems.length ? (
          <FaqSection
            items={faqItems}
            title="Frequently Asked Questions"
            headingId="faq-service"
            seeAllHref={topicFaqs ? `/faqs#${topicFaqs.anchor}` : undefined}
          />
        ) : null}
      </Container>
    );
  }

  // The FAQPage rich result for this page is emitted by PageStructuredData
  // (src/components/Common/PageStructuredData.js). It sits outside the <NoSsr>
  // wrapper in _app.js, so it reaches the crawler in the first HTML - these pages
  // are request-rendered (getServerSideProps) and the query is available there,
  // which is why the schema is not built from a <Head> in here.
  return (
    <>
      <Head>
        <title>{medical_service.seoTitle}</title>
        <meta name="description" content={medical_service.seoDescription} />
        {serviceSchema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
          />
        ) : null}
      </Head>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* The page banner renders no heading, so the service name is the page H1. */}
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {medical_service.h1 || serviceName || medical_service.seoTitle}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {medical_service.description ||
            getServiceDescription(serviceName) ||
            medical_service.seoDescription}
        </Typography>

        {/* Merged lab service: announce the launch instead of offering booking. */}
        {medical_service.comingSoon ? (
          <Alert severity="info" sx={{ mb: 3, fontWeight: 600 }}>
            {serviceName || medical_service.h1} - {t("common.comingSoon")}
          </Alert>
        ) : null}

        {/* Crisp, crawlable service bullets (only rendered when a service defines them). */}
        {medical_service.highlights?.length ? (
          <Box component="section" sx={{ mb: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {medical_service.highlightsTitle || "What this service includes"}
            </Typography>
            <Box
              component="ul"
              sx={{
                m: 0,
                pl: { xs: 2.5, md: 4 },
                display: "grid",
                gap: 0.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              {medical_service.highlights.map((point) => (
                <Typography component="li" variant="body2" color="text.secondary" key={point}>
                  {point}
                </Typography>
              ))}
            </Box>
          </Box>
        ) : null}

        {/* Coverage tabs (only services that define `tabs`). Panels are kept in the
            DOM and toggled with `hidden`, so every word stays crawlable while only
            the active panel is visible. */}
        {medical_service.tabs?.length ? (
          <Box component="section" sx={{ mt: 4 }}>
            {/* Heading renders only when the service sets `tabsTitle` (corporate
                healthcare shows the bare tab bar). */}
            {medical_service.tabsTitle ? (
              <Typography variant="h5" component="h2" gutterBottom>
                {medical_service.tabsTitle}
              </Typography>
            ) : null}
            <Tabs
              value={activeDetailTab}
              onChange={(event, value) => setActiveDetailTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label={medical_service.tabsTitle || "Service coverage"}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 56,
                },
                /* No native scrollbar under the tab strip - the arrow buttons
                   (scrollButtons="auto") stay the overflow affordance. */
                "& .MuiTabs-scroller": {
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                },
              }}
            >
              {medical_service.tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  id={`coverage-tab-${tab.id}`}
                  aria-controls={`coverage-panel-${tab.id}`}
                  label={tab.label}
                />
              ))}
            </Tabs>
            {medical_service.tabs.map((tab, index) => (
              <Box
                key={tab.id}
                role="tabpanel"
                id={`coverage-panel-${tab.id}`}
                aria-labelledby={`coverage-tab-${tab.id}`}
                hidden={activeDetailTab !== index}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  {tab.heading}
                </Typography>
                {(tab.body || []).map((paragraph) => (
                  <Typography
                    key={paragraph}
                    variant="body2"
                    color="text.secondary"
                    paragraph
                  >
                    {paragraph}
                  </Typography>
                ))}
                {(tab.groups || []).map((group) => (
                  <Box key={group.title} sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {group.title}
                    </Typography>
                    <Box component="ul" sx={bulletGridSx}>
                      {(group.items || []).map((item) => (
                        <Typography
                          component="li"
                          variant="body2"
                          color="text.secondary"
                          key={item}
                        >
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
            {medical_service.tabsNote ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 3, fontStyle: "italic" }}
              >
                {medical_service.tabsNote}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {/* Long-form H2 sections (only services that define them). */}
        {medical_service.sections?.map(({ heading, body, items }) => (
          <Box component="section" key={heading} sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {heading}
            </Typography>
            {(body || []).map((paragraph) => (
              <Typography
                key={paragraph}
                variant="body1"
                color="text.secondary"
                paragraph
              >
                {paragraph}
              </Typography>
            ))}
            {items?.length ? (
              <Box component="ul" sx={bulletGridSx}>
                {items.map((item) => (
                  <Typography
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    key={item}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            ) : null}
          </Box>
        ))}

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Online Services */}
          {medical_service.online && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {medical_service.onlineTitle || "Online Services"}
                </Typography>
              </Grid>
              {medical_service.online.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%", // Make card take full available height
                      justifyContent: "space-between", // Push button to bottom if added later
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow: 3,
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-4px) scale(1.02)",
                        backgroundColor: "#eaf5e0ff",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start", // Keep icon + text aligned at top
                        flexGrow: 1, // Make content stretch
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          padding: 1,
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          border: `1px solid ${color_schema.green}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconRenderer name={item.iconKey} size={28} />
                      </Box>
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexGrow: 1 }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </CardContent>
                    <div>
                      {medical_service.comingSoon ? (
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: color_schema.green, pb: 1 }}
                        >
                          {t("common.comingSoon")}
                        </Typography>
                      ) : (
                        <ConsultationButton
                          onClick={() => handleOpenCalltoBookDialog(item.name)}
                        >
                          {callToBook}
                        </ConsultationButton>
                      )}
                    </div>
                  </Card>
                </Grid>
              ))}
            </>
          )}

          {/* Offline Services */}
          {medical_service.offline && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {medical_service.offlineTitle || "Offline Services"}
                </Typography>
              </Grid>
              {medical_service.offline.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    sx={{
                      p: hasCardImage(item) ? 0 : 2,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%", // Make card take full available height
                      justifyContent: "space-between", // Push button to bottom if added later
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow: 3,
                      borderRadius: 2,
                      overflow: "hidden", // Keeps the photo header inside the rounded card
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-4px) scale(1.02)",
                        backgroundColor: "#eaf5e0ff",
                      },
                    }}
                  >
                    {/* Relevant photo for the service + the icon badge on top, so the
                        card is still scannable when the image is hidden/skipped. */}
                    {hasCardImage(item) ? (
                      <Box sx={{ position: "relative", height: 150, flexShrink: 0 }}>
                        <Image
                          src={item.image}
                          alt={
                            item.imageAlt ||
                            `${item.name} - ${serviceName} by HealthPath`
                          }
                          fill
                          sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 360px"
                          style={{ objectFit: "cover" }}
                          onError={() =>
                            setFailedCardImages((prev) =>
                              prev.includes(item.image)
                                ? prev
                                : [...prev, item.image]
                            )
                          }
                        />
                        <Box
                          sx={{
                            ...iconCircleSx,
                            position: "absolute",
                            left: 10,
                            bottom: 10,
                          }}
                        >
                          <IconRenderer name={item.iconKey} />
                        </Box>
                      </Box>
                    ) : null}
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start", // Keep icon + text aligned at top
                        flexGrow: 1, // Make content stretch
                      }}
                    >
                      {hasCardImage(item) ? null : (
                        <Box sx={iconCircleSx}>
                          <IconRenderer name={item.iconKey} size={28} />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexGrow: 1 }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box
                      sx={{
                        px: hasCardImage(item) ? 2 : 0,
                        pb: hasCardImage(item) ? 2 : 0,
                      }}
                    >
                      {medical_service.comingSoon ? (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: color_schema.green,
                            pb: hasCardImage(item) ? 0 : 1,
                          }}
                        >
                          {t("common.comingSoon")}
                        </Typography>
                      ) : (
                        <ConsultationButton
                          onClick={() => handleOpenCalltoBookDialog(item.name)}
                        >
                          {callToBook}
                        </ConsultationButton>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </>
          )}
        </Grid>

        {/* FAQs - only this service's questions, from data/faqs.js. Exactly the
            same copy as its block on /faqs (linked through the "See all" link),
            and the answers the PageStructuredData FAQPage schema publishes. */}
        {faqItems.length ? (
          <FaqSection
            items={faqItems}
            title="Frequently Asked Questions"
            headingId={`faq-${serviceKey || "service"}`}
            seeAllHref={topicFaqs ? `/faqs#${topicFaqs.anchor}` : undefined}
          />
        ) : null}

        <CalltoBookPopup
          show={isCalltoBookDialog}
          onClose={handleCloseCalltoBookDialog}
          onSubmit={handleCalltoBookPopupSubmit}
        />
      </Container>
    </>
  );
};
export default ServiceDetail;
