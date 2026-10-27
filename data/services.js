// src/constants/servicesData.js

import {
  CardiologyIcon,
  CorporateHealthcareIcon,
  Dentistry,
  DermatologistIcon,
  GeneralPhysician,
  GynaecologyIcon,
  HealthCampIcon,
  HomeCareIcon,
  LabInvestigation,
  MedicineDelivery,
  NursingCareIcon,
  NutritionistIcon,
  OphthalmologyIcon,
  OrthopaedicsIcon,
  PediatricsIcon,
  PhysiotherapyIcon,
  Psychiatrist,
  PulmonologyIcon,
} from "../public/svgIcon/all-department-svg-icon";

export const servicesData = [
  {
    id: 0,
    key: "tab-1",
    name: "General Physician",
    image: "/images/general_physicians.jpg",
    subheading: "Primary Care, Always Accessible",
    description:
      "General Physician: Your Health Partner.Feel better, faster. Our General Physicians provide trusted care for all your health needs. Choose between a convenient online consultation or an in-person visit. We're committed to reaching patients everywhere, making quality healthcare truly accessible. Receive your prescription instantly on your phone after your consultation.",
    link: "/service-1",
    content: [
      "General Physician: Your Health Partner.Feel better, faster. Our General Physicians provide trusted care for all your health needs. Choose between a convenient online consultation or an in-person visit. We're committed to reaching patients everywhere, making quality healthcare truly accessible. Receive your prescription instantly on your phone after your consultation.",
      "Benefit from personalized consultations, timely prescriptions, and ongoing support for your well-being. We make healthcare accessible with both online and in-person appointments, ensuring you receive the care you need, when you need it.",
    ],
    options: [
      "Routine health checkups and screenings",
      "Diagnosis and management of common illnesses",
      "Chronic disease management (diabetes, hypertension, etc.)",
      "Preventive healthcare and lifestyle counseling",
      "Prescription and medication management",
      "Referrals to specialists as needed",
    ],
  },
  {
    id: 1,
    key: "tab-2",
    name: "Pediatrics",
    image: "/images/pediatrics.jpg",
    subheading: "Child Health, Expertly Delivered",
    description:
      "Our Pediatrics department is dedicated to the health and wellness of infants, children, and adolescents. We provide compassionate care, growth monitoring, immunizations, and expert guidance for every stage of your child's development.",
    link: "/service-1",
    content: [
      "Our Pediatrics department is dedicated to the health and wellness of infants, children, and adolescents. We provide compassionate care, growth monitoring, immunizations, and expert guidance for every stage of your child's development.",
      "Trust our pediatricians for early diagnosis, preventive care, and treatment of childhood illnesses. We partner with parents to ensure your child's healthy future.",
    ],
    options: [
      "Newborn and child wellness exams",
      "Vaccinations and immunization schedules",
      "Growth and developmental assessments",
      "Treatment of common childhood illnesses",
      "Nutritional and feeding guidance",
      "Parental counseling and support",
    ],
  },
  {
    id: 2,
    key: "tab-3",
    name: "Cardiology",
    image: "/images/Cardiology_700x700.jpeg",
    subheading: "Heart Wellness, Trusted Monitoring",
    description:
      "Our Cardiology specialists provide advanced care for heart health, offering diagnosis, treatment, and prevention of cardiovascular diseases. We use state-of-the-art technology to ensure accurate assessments and effective management.",
    link: "/service-1",
    content: [
      "Our Cardiology specialists provide advanced care for heart health, offering diagnosis, treatment, and prevention of cardiovascular diseases. We use state-of-the-art technology to ensure accurate assessments and effective management.",
      "From routine heart checkups to complex cardiac conditions, our team is committed to helping you maintain a healthy heart and an active lifestyle.",
    ],
    options: [
      "Heart health screenings and risk assessments",
      "Management of hypertension and cholesterol",
      "Diagnosis and treatment of heart diseases",
      "Electrocardiogram (ECG) and echocardiography",
      "Cardiac rehabilitation and lifestyle advice",
      "Preventive cardiology and patient education",
    ],
  },
  {
    id: 3,
    key: "tab-4",
    name: "Dermatologist",
    image: "/images/dermalogist.jpg",
    subheading: "Skin Solutions, Clinically Proven",
    description:
      "Our Dermatologists offer expert care for all skin, hair, and nail concerns. We provide accurate diagnosis and effective treatments for a wide range of dermatological conditions, helping you achieve healthy and radiant skin.",
    link: "/service-1",
    content: [
      "Our Dermatologists offer expert care for all skin, hair, and nail concerns. We provide accurate diagnosis and effective treatments for a wide range of dermatological conditions, helping you achieve healthy and radiant skin.",
      "From acne and eczema to skin cancer screenings, our specialists use the latest techniques to ensure optimal results.",
    ],
    options: [
      "Diagnosis and treatment of skin conditions",
      "Acne, eczema, and psoriasis management",
      "Skin allergy testing and treatment",
      "Mole and lesion evaluation",
      "Skin cancer screening",
      "Cosmetic dermatology consultations",
    ],
  },
  {
    id: 4,
    key: "tab-5",
    name: "Orthopaedics",
    image: "/images/orthopedics.jpg",
    subheading: "Mobility Support, Expert Care",
    description:
      "Our Orthopaedics team specializes in the diagnosis and treatment of bone, joint, and muscle disorders. We offer both surgical and non-surgical solutions to restore mobility and relieve pain.",
    link: "/service-1",
    content: [
      "Our Orthopaedics team specializes in the diagnosis and treatment of bone, joint, and muscle disorders. We offer both surgical and non-surgical solutions to restore mobility and relieve pain.",
      "Whether you have a sports injury, arthritis, or need joint replacement, our experts are here to help you move better and live pain-free.",
    ],
    options: [
      "Fracture and injury management",
      "Joint pain and arthritis treatment",
      "Sports injury care",
      "Back and spine disorder management",
      "Orthopaedic surgery consultations",
      "Physical therapy and rehabilitation",
    ],
  },
  {
    id: 5,
    key: "tab-6",
    name: "gynecology & obs",
    image: "/images/gynecologist.jpg",
    subheading: "Women's Health, Safe Delivery",
    description:
      "Our Gynaecology & Obstetrics department provides comprehensive care for women's health, from adolescence and menopause through pregnancy, childbirth, and the postpartum period. We offer preventive screenings, reproductive health care, expert management of gynecological conditions, and are dedicated to the health and well-being of both mother and baby with personalized attention and advanced medical support.",
    link: "/service-1",
    content: [
      "Our Gynaecology & Obstetrics services cover all aspects of women's health, from adolescence and menopause through pregnancy, childbirth, and the postpartum period. We provide preventive screenings, reproductive health care, expert management of gynecological conditions, and are dedicated to ensuring the health and well-being of both mother and baby with personalized attention and advanced medical support.",
      "From annual gynecological exams and prenatal checkups to ultrasound, labor support, and postnatal care, our compassionate team ensures privacy and comfort, guiding you through every stage of life with compassion and expertise.",
    ],
    options: [
      "Annual gynecological exams",
      "Pregnancy and prenatal care",
      "Ultrasound and fetal monitoring",
      "Labor and delivery support",
      "Menstrual disorder management",
      "Postnatal care for mother and newborn",
    ],
  },
  {
    id: 6,
    key: "tab-7",
    name: "Ophthalmology",
    image: "/images/ophthalmology.jpg",
    subheading: "Vision Care You Can Trust",
    description:
      "Our Ophthalmology department provides comprehensive eye care, from vision testing to advanced treatment of eye diseases. We help you maintain clear vision and healthy eyes at every age.",
    link: "/service-1",
    content: [
      "Our Ophthalmology department provides comprehensive eye care, from vision testing to advanced treatment of eye diseases. We help you maintain clear vision and healthy eyes at every age.",
      "Trust our specialists for early detection and management of conditions like cataracts, glaucoma, and diabetic eye disease.",
    ],
    options: [
      "Vision testing and prescription glasses",
      "Cataract and glaucoma screening",
      "Treatment of eye infections and allergies",
      "Diabetic retinopathy management",
      "Dry eye and red eye treatment",
      "Eye surgery consultations",
    ],
  },
  {
    id: 7,
    key: "tab-8",
    name: "Pulmonology",
    image: "/images/pulmonology.jpg",
    subheading: "Respiratory Relief, Specialist Care",
    description:
      "Our Pulmonology experts diagnose and treat respiratory and lung conditions, helping you breathe easier. We offer advanced care for asthma, COPD, allergies, and sleep disorders.",
    link: "/service-1",
    content: [
      "Our Pulmonology experts diagnose and treat respiratory and lung conditions, helping you breathe easier. We offer advanced care for asthma, COPD, allergies, and sleep disorders.",
      "With personalized treatment plans, we aim to improve your lung health and overall quality of life.",
    ],
    options: [
      "Asthma and allergy management",
      "Chronic obstructive pulmonary disease (COPD) care",
      "Diagnosis of respiratory infections",
      "Sleep apnea evaluation",
      "Pulmonary function testing",
      "Smoking cessation counseling",
    ],
  },
  {
    id: 8,
    key: "tab-9",
    name: "Psychiatrist",
    image: "/images/Psychiatrist.jpg",
    subheading: "Mind Wellness, Confidential Support",
    description:
      "Our Psychiatry services provide compassionate mental health care for all ages. We offer diagnosis, counseling, and medication management for a range of mental health conditions.",
    link: "/service-1",
    content: [
      "Our Psychiatry services provide compassionate mental health care for all ages. We offer diagnosis, counseling, and medication management for a range of mental health conditions.",
      "Our goal is to support your emotional well-being and help you lead a fulfilling life.",
    ],
    options: [
      "Depression and anxiety treatment",
      "Stress and mood disorder management",
      "Counseling and psychotherapy",
      "Medication management",
      "Addiction and substance abuse support",
      "Child and adolescent mental health care",
    ],
  },
  {
    id: 9,
    key: "tab-10",
    name: "Dentistry",
    image: "/images/dentistry.jpg",
    subheading: "Dental Care, Patient-Focused",
    description:
      "Our Dentistry team offers comprehensive oral care, from routine cleanings to advanced dental procedures. We focus on preventive care, early diagnosis, and effective treatment for a healthy smile.",
    link: "/service-1",
    content: [
      "Our Dentistry team offers comprehensive oral care, from routine cleanings to advanced dental procedures. We focus on preventive care, early diagnosis, and effective treatment for a healthy smile.",
      "Experience gentle, patient-centered dental care for the whole family.",
    ],
    options: [
      "Dental checkups and cleanings",
      "Cavity fillings and tooth extractions",
      "Root canal treatment",
      "Crowns, bridges, and dentures",
      "Teeth whitening and cosmetic dentistry",
      "Pediatric dental care",
    ],
  },
  {
    id: 10,
    key: "tab-11",
    name: "Physiotherapy",
    image: "/images/Physiotherapy.jpg",
    subheading: "Rehab Services, Movement Recovery",
    description:
      "Our Physiotherapy services help restore movement and function after injury, surgery, or illness. We design personalized rehabilitation programs to reduce pain and improve mobility.",
    link: "/service-1",
    content: [
      "Our Physiotherapy services help restore movement and function after injury, surgery, or illness. We design personalized rehabilitation programs to reduce pain and improve mobility.",
      "Let our skilled therapists guide you on your journey to recovery and better physical health.",
    ],
    options: [
      "Post-surgical rehabilitation",
      "Pain management and relief",
      "Sports injury recovery",
      "Joint and muscle therapy",
      "Exercise and mobility training",
      "Chronic condition management",
    ],
  },
  {
    id: 11,
    key: "tab-12",
    name: "Corporate Healthcare",
    image: "/images/nursing/health-camp-india.jpg",
    subheading: "Pan-India Employee Health, OHC & Wellness Programs",
    description:
      "Pan-India corporate healthcare services - OHC medical rooms, doctors, nursing, emergency and physiotherapy support, employee health packages, health camps, awareness and basic training sessions.",
    // `service` maps to the rich content block in ServiceDetailsComponent (and keeps
    // this tab visible even when the API speciality list does not carry it yet);
    // `detailsLink` is where the tab CTA sends the visitor.
    service: "corporate-healthcare",
    detailsLink:
      "/service-details?name=Corporate%20Healthcare&Service=corporate-healthcare",
    content: [
      "HealthPath delivers corporate healthcare services across India - from a single OHC medical room in your office to complete medical cover for plants, warehouses and project sites. We set up, staff and run the medical facility, design employee health packages around your company policy, and bring health camps, awareness sessions and training to your teams, in every city you operate in.",
      "One contract covers every location, with local doctors, nurses, paramedics and physiotherapists backed by teleconsultation, NABH-informed protocols and SLA-based response times. You get compliance-ready records, incident logs and monthly MIS that HR and EHS teams can act on - plus emergency readiness, OHC audit checklists and a single point of contact across every site you run.",
    ],
    options: [
      "OHC medical room setup, staffing & day-to-day operations",
      "Doctors, nursing, emergency & ambulance response support",
      "Physiotherapy & rehabilitation at office or on call",
      "Employee health packages tailored to your company policy",
      "Health camps, screening & vaccination drives",
      "Awareness sessions on lifestyle, stress & nutrition",
      "First aid, CPR, BLS & ERT training with certification",
      "Pan-India coverage - metro, tier-1, tier-2 & remote sites",
      "Digital health records, incident logs & monthly MIS reports",
    ],
  },
  {
    id: 12,
    key: "tab-13",
    name: "Nutritionist",
    image: "/images/commonHealth/lose-weight.jpg",
    subheading: "Eat Right, Live Well",
    description:
      "Our Nutritionists and Dietitians build practical eating plans around your health goals - weight management, diabetes, thyroid and PCOS, heart health, pregnancy and child nutrition.",
    link: "/service-1",
    content: [
      "Our Nutritionists and Dietitians create personalised diet plans around your medical condition, lifestyle, food preferences and culture - covering weight management, diabetes, thyroid, PCOS, heart, kidney and liver conditions, pregnancy, child growth and sports or recovery nutrition.",
      "Every plan starts with a detailed assessment of your current intake, body measurements and lab reports, followed by simple, sustainable meal plans and regular follow-ups that adjust the plan as your goals and reports change.",
    ],
    options: [
      "Personalised weight loss and weight gain diets",
      "Diabetes, thyroid and PCOS nutrition plans",
      "Heart-healthy and cholesterol-lowering diets",
      "Pregnancy, lactation and child nutrition guidance",
      "Sports, fitness and recovery nutrition",
      "Therapeutic diets for kidney, liver and gut conditions",
    ],
  },
];

export const AllDepartmentService = [
  {
    title: "General Physician",
    description:
      "Primary care and routine health consultations for all age groups.",
    icon: <GeneralPhysician />,
  },
  {
    title: "Pediatrics",
    description: "Specialized care for infants, children, and adolescents.",
    icon: <PediatricsIcon />,
  },
  {
    title: "Cardiology",
    description: "Heart-related diagnostics, treatments, and follow-ups.",
    icon: <CardiologyIcon />,
  },
  {
    title: "Dermatologist",
    description: "Skin, hair, and nail treatments with advanced care.",
    icon: <DermatologistIcon />,
  },
  {
    title: "Orthopaedics",
    description: "Bone, joint, and musculoskeletal care solutions.",
    icon: <OrthopaedicsIcon />,
  },
  {
    title: "Gynaecology & Obstetrics",
    description: "Comprehensive women’s health, maternity & fertility care.",
    icon: <GynaecologyIcon />,
  },
  {
    title: "Ophthalmology",
    description: "Eye checkups, vision correction and treatments.",
    icon: <OphthalmologyIcon />,
  },
  {
    title: "Pulmonology",
    description: "Respiratory system diagnosis and lung health care.",
    icon: <PulmonologyIcon />,
  },
  {
    title: "Psychiatrist",
    description: "Mental health diagnosis, therapy and counseling support.",
    icon: <Psychiatrist />,
  },
  {
    title: "Dentistry",
    description: "Dental care, cleaning, cosmetic & restorative dentistry.",
    icon: <Dentistry />,
  },
  {
    title: "Physiotherapy",
    description: "Rehabilitation through physical exercises and therapy.",
    icon: <PhysiotherapyIcon />,
  },
  {
    title: "Nursing care",
    description: "Professional home and hospital-based nursing services.",
    icon: <NursingCareIcon />,
  },
  {
    title: "Home care",
    description: "Medical support and assistance in the comfort of your home.",
    icon: <HomeCareIcon />,
  },
  {
    title: "Medicine Delivery",
    description:
      "Get medicines delivered at your doorstep reliably and quickly.",
    icon: <MedicineDelivery />,
  },
  {
    title: "Lab Investigation",
    description: "Book pathology tests and health checkups at home.",
    icon: <LabInvestigation />,
  },
  {
    title: "Corporate Healthcare",
    description:
      "Pan-India employee health and OHC programs - onsite doctors, nursing, health camps and training.",
    icon: <CorporateHealthcareIcon />,
  },
  {
    title: "Healthcamp",
    description:
      "Pan-India health check-up camps for schools, corporates, elderly care and underprivileged communities - screenings, doctor consults and reports.",
    icon: <HealthCampIcon />,
  },
  {
    title: "Nutritionist",
    description:
      "Personalised diet plans for weight, diabetes, heart, pregnancy and child nutrition.",
    icon: <NutritionistIcon />,
  },
];

// Service highlights rendered by the Demo5 "SERVICES" marquee.
// Kept here (instead of inline in the component) so all service data lives in
// this single module.
//
// `nameId` is the service id in data/serviceNames.json, which holds the localized
// names ({ en, hi }) for every card. `title` stays the canonical English name
// (DB matching, header menu, links) and is only a last-resort fallback.
export const demo5ServiceHighlights = [
  {
    title: "Doctor Consultation",
    nameId: "doctor-consultation",
    service: "consultation",
    description:
      "Connect instantly with top-rated doctors for personalized medical consultations, expert health advice, and tailored treatment plans to improve your well-being.",
    icon: <GeneralPhysician size={70} />,
    btntext: "View Details",
  },
  {
    title: "Nursing Care",
    nameId: "nursing-care",
    service: "nursing-services",
    description:
      "Qualified nurses at home or in clinic - injections, IV drips, wound care, elderly and post-operative nursing support.",
    icon: <NursingCareIcon size={70} />,
    btntext: "View Details",
  },
  {
    title: "Home Care",
    nameId: "home-care",
    // Own content block: home care is a separate branch from nursing care.
    service: "home-care",
    description:
      "Doctor visits, nursing, physiotherapy, medicines, lab sample collection, GDA attendants and medical equipment - all at home.",
    icon: <HomeCareIcon size={70} />,
    btntext: "View Details",
  },
  {
    // Merged "Labtest" / "Lab Investigation" service - single card, single name.
    title: "Lab Investigation",
    nameId: "lab-investigation",
    service: "lab-test",
    comingSoon: true,
    description:
      "Blood tests and lab investigations at home, with reports on your phone.",
    icon: <LabInvestigation size={70} />,
    btntext: "View Details",
  },
  {
    title: "Community Care",
    nameId: "community-care",
    service: "community-care",
    description:
      "Health camps, screening drives, awareness sessions and training that bring preventive care to communities, schools and local groups.",
    icon: <HealthCampIcon size={70} />,
    btntext: "View Details",
  },
  {
    title: "Corporate Healthcare",
    nameId: "corporate-healthcare",
    service: "corporate-healthcare",
    description:
      "Pan-India corporate healthcare - OHC medical rooms, onsite doctors and nursing, emergency and physiotherapy support, employee health packages, health camps and training.",
    icon: <CorporateHealthcareIcon size={70} />,
    btntext: "View Details",
  },
  {
    title: "Physiotherapy",
    nameId: "physiotherapy",
    description:
      "Physiotherapy at home, in clinic or at your workplace - pain relief, post-surgical rehabilitation, sports injury care and mobility training.",
    icon: <PhysiotherapyIcon size={70} />,
    btntext: "View Details",
  },
];

export const testimonials = [
  {
    name: "S.Johri",
    role: "Software Engineer",
    text: "Booking an online consultation was incredibly easy, and I spoke to a doctor within minutes. No more waiting rooms!",
    image: "/image/review/avatar1.jpeg",
  },
  {
    name: "Adhira",
    role: "Brand Manager",
    text: "I got expert medical advice from my living room, saving me so much time and hassle. Highly recommend their virtual consultations.",
    image: "/image/review/avatar8.jpeg",
  },
  {
    name: "Jayant",
    role: "Businessman",
    text: "Mene is website se doctor ko consult kiya aur mujhe turant prescription mil gaya. Bahut hi aasan h is website to use krna!",
    image: "/image/review/avatar3.jpeg",
  },
  {
    name: "Akhand Seth",
    role: "Engineer",
    text: "I was out of station and needed medical advice for my mother. I booked it over a call consultation happened same afternoon. Truly grateful! and lab tested scheduled and collected on time",
    image: "/image/review/avatar4.jpeg",
  },
  {
    name: "Ms Vaishali",
    role: "Photographer",
    text: "Finally, a healthcare service that fits my busy schedule!. Aur doctor ne meri problem ko dhyan se suna aur samjha. doctor was highly professional.",
    image: "/image/review/avatar5.jpeg",
  },
  {
    name: "Mohit A",
    role: "Cloud Engineer",
    text: "Now I dont need to rush to doctors clininc to get consultation, Now i can do it from my office at my conveience. Being a corporate employe its make my life so easy.",
    image: "/image/review/avatar6.jpeg",
  },
  {
    name: "Saksham",
    role: "",
    text: "Merako bhaut tez bhukar tha aur pet kharab tha then i booked a conusltation from this website and within half an hour i got a consutlation from the doctor and prescirption. Thanks to them muje clinic ni jana pada",
    image: "/image/review/avatar7.jpeg",
  },
  {
    name: "Dharampal",
    role: "CA",
    text: "From skipping traffic to avoiding long queues, Healthpath has made healthcare accessible and stress-free. My health journey feels much more manageable now.",
    image: "/image/review/avatar2.jpeg",
  },
  {
    name: "Anjali",
    role: "Housewife",
    text: "Me sher se bhar rehti and mere mata pita ko khasi jukham ke mausam me influence vaccine lagvani thi. Pratap from healthpath team ne muje pura process samjhaya or ghar baithe unka vaccination ho gya. bahut hi acha experience raha mera.",
    image: "/image/review/avatar9.jpeg",
  },
  {
    name: "Avantaki",
    role: "Chef",
    text: "Mene apne 3 yr ke bete ke liye is website se consultation book ki. Doctor ne bhaut achi tarah muje samjaya or mere sare sawalo ke jawab diye. ab me regular isse use krungi apne family ke liye. Doctor ko bhaut thanks.",
    image: "/image/review/avatar10.jpeg",
  },
];
