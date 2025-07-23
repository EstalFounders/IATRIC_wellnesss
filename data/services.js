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
    name: "General Physician",
    image: "/images/general_physicians.jpg",
    subheading: "Primary Care, Always Accessible",
    description:
      "General Physician: Your Health Partner.Feel better, faster. Our General Physicians provide trusted care for all your health needs. Choose between a convenient online consultation or an in-person visit. We're committed to reaching patients everywhere, making quality healthcare truly accessible. Receive your prescription instantly on your phone after your consultation.",
  },
  {
    id: 1,
    name: "Pediatrics",
    image: "/images/pediatrics.jpg",
    subheading: "Child Health, Expertly Delivered",
    description:
      "Our Pediatrics department is dedicated to the health and wellness of infants, children, and adolescents. We provide compassionate care, growth monitoring, immunizations, and expert guidance for every stage of your child's development.",
  },
  {
    id: 2,
    name: "Cardiology",
    image: "/images/Cardiology_700x700.jpeg",
    subheading: "Heart Wellness, Trusted Monitoring",
    description:
      "Our Cardiology specialists provide advanced care for heart health, offering diagnosis, treatment, and prevention of cardiovascular diseases. We use state-of-the-art technology to ensure accurate assessments and effective management.",
  },
  {
    id: 3,
    name: "Dermatologist",
    image: "/images/dermalogist.jpg",
    subheading: "Skin Solutions, Clinically Proven",
    description:
      "Our Dermatologists offer expert care for all skin, hair, and nail concerns. We provide accurate diagnosis and effective treatments for a wide range of dermatological conditions, helping you achieve healthy and radiant skin.",
  },
  {
    id: 4,
    name: "Orthopaedics",
    image: "/images/orthopedics.jpg",
    subheading: "Mobility Support, Expert Care",
    description:
      "Our Orthopaedics team specializes in the diagnosis and treatment of bone, joint, and muscle disorders. We offer both surgical and non-surgical solutions to restore mobility and relieve pain.",
  },
  {
    id: 5,
    name: "Gynaecology",
    image: "/images/gynecologist.jpg",
    subheading: "Women's Health, Expert Guidance",
    description:
      "Our Gynaecology services cover all aspects of women's health, from adolescence to menopause. We provide preventive screenings, reproductive health care, and expert management of gynecological conditions.",
  },
  {
    id: 6,
    name: "Ophthalmology",
    image: "/images/ophthalmology.jpg",
    subheading: "Vision Care You Can Trust",
    description:
      "Our Ophthalmology department provides comprehensive eye care, from vision testing to advanced treatment of eye diseases. We help you maintain clear vision and healthy eyes at every age.",
  },
  {
    id: 7,
    name: "Pulmonology",
    image: "/images/pulmonology.jpg",
    subheading: "Respiratory Relief, Specialist Care",
    description:
      "Our Pulmonology experts diagnose and treat respiratory and lung conditions, helping you breathe easier. We offer advanced care for asthma, COPD, allergies, and sleep disorders.",
  },
  {
    id: 8,
    name: "Psychiatrist",
    image: "/images/Psychiatrist.jpg",
    subheading: "Mind Wellness, Confidential Support",
    description:
      "Our Psychiatry services provide compassionate mental health care for all ages. We offer diagnosis, counseling, and medication management for a range of mental health conditions.",
  },
  {
    id: 9,
    name: "Dentistry",
    image: "/images/dentistry.jpg",
    subheading: "Dental Care, Patient-Focused",
    description:
      "Our Dentistry team offers comprehensive oral care, from routine cleanings to advanced dental procedures. We focus on preventive care, early diagnosis, and effective treatment for a healthy smile.",
  },
  {
    id: 10,
    name: "Physiotherapy",
    image: "/images/Physiotherapy.jpg",
    subheading: "Rehab Services, Movement Recovery",
    description:
      "Our Physiotherapy services help restore movement and function after injury, surgery, or illness. We design personalized rehabilitation programs to reduce pain and improve mobility.",
  },
  {
    id: 11,
    name: "Nursing care",
    image: "/images/nursing-care.png",
    subheading: "Skilled Support, Compassionate Touch",
    description:
      "Our Nursing Care services provide professional support for patients at home or in clinical settings. We ensure comfort, safety, and expert medical attention for those in need of ongoing care.",
  },
  {
    id: 12,
    name: "Home care",
    image: "/images/home-care.jpeg",
    subheading: "In-Home Medical Assistance",
    description:
      "Our Home Care services bring quality healthcare to your doorstep. We offer medical and non-medical support for patients who prefer the comfort of home.",
  },
  {
    id: 13,
    name: "Medicine Delivery",
    image: "/images/medicine-delivery.jpg",
    subheading: "Quick Access to Medications",
    description:
      "Our Medicine Delivery service ensures you receive your prescriptions quickly and safely at your doorstep. We partner with trusted pharmacies to provide genuine medicines and hassle-free delivery.",
  },
  {
    id: 14,
    name: "Lab Investigation",
    image: "/images/lab-investigation.jpg",
    subheading: "Accurate Results, On Your Schedule",
    description:
      "Our Lab Investigation services offer accurate and timely diagnostic tests for a wide range of health conditions. We use advanced technology to ensure reliable results and support your treatment plan.",
  },
  {
    id: 15,
    name: "Corporate Health",
    image: "/images/corporate-healthcamp.jpg",
    subheading: "Workplace Wellness Simplified",
    description:
      "Our Corporate Healthcare solutions promote employee wellness and productivity. We offer customized health checkups, wellness programs, and on-site medical services for organizations of all sizes.",
  },
  {
    id: 16,
    name: "Healthcamp",
    image: "/images/heatlhcamp.jpg",
    subheading: "Community Checkups & Screenings",
    description:
      "Our Healthcamp services organize community health camps for preventive screenings, health education, and early detection of diseases. We bring healthcare to underserved areas, promoting wellness for all.",
  },
  {
    id: 17,
    name: "Obstetrics",
    image: "/images/Obstetrics.jpg",
    subheading: "Safe Delivery, Expert Care",
    description:
      "Our Obstetrics department provides comprehensive care for women throughout pregnancy, childbirth, and the postpartum period. We are dedicated to ensuring the health and well-being of both mother and baby with personalized attention and advanced medical support.",
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
    description: "Employee wellness and preventive care programs.",
    icon: <CorporateHealthcareIcon />,
  },
  {
    title: "Healthcamp",
    description: "Organize wellness camps and preventive screening drives.",
    icon: <HealthCampIcon />,
  },
];

export const AllServiceTab = [
  {
    key: "tab-1",
    title: "General Physician",
    image: "/images/general_physicians.jpg",
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
    key: "tab-2",
    title: "Pediatrics",
    image: "/images/pediatrics.jpg",
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
    key: "tab-3",
    title: "Cardiology",
    image: "/images/Cardiology_700x700.jpeg",
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
    key: "tab-4",
    title: "Dermatologist",
    image: "/images/dermalogist.jpg",
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
    key: "tab-5",
    title: "Orthopaedics",
    image: "/images/orthopedics.jpg",
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
    key: "tab-6",
    title: "Gynaecology",
    image: "/images/gynecologist.jpg",
    link: "/service-1",
    content: [
      "Our Gynaecology services cover all aspects of women's health, from adolescence to menopause. We provide preventive screenings, reproductive health care, and expert management of gynecological conditions.",
      "Our compassionate team ensures privacy and comfort, supporting you through every stage of life.",
    ],
    options: [
      "Annual gynecological exams",
      "Pregnancy and prenatal care",
      "Menstrual disorder management",
      "Family planning and contraception",
      "Menopause counseling",
      "Screening for cervical and breast cancer",
    ],
  },
  {
    key: "tab-7",
    title: "Ophthalmology",
    image: "/images/ophthalmology.jpg",
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
    key: "tab-8",
    title: "Pulmonology",
    image: "/images/pulmonology.jpg",
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
    key: "tab-9",
    title: "Psychiatrist",
    image: "/images/Psychiatrist.jpg",
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
    key: "tab-10",
    title: "Dentistry",
    image: "/images/dentistry.jpg",
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
    key: "tab-11",
    title: "Physiotherapy",
    image: "/images/Physiotherapy.jpg",
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
    key: "tab-12",
    title: "Nursing care",
    image: "/images/nursing-care.png",
    link: "/service-1",
    content: [
      "Our Nursing Care services provide professional support for patients at home or in clinical settings. We ensure comfort, safety, and expert medical attention for those in need of ongoing care.",
      "Our compassionate nurses are dedicated to improving your quality of life with personalized care plans.",
    ],
    options: [
      "Home nursing visits",
      "Medication administration",
      "Wound care and dressing changes",
      "Post-operative care",
      "Elderly and palliative care",
      "Vital signs monitoring",
    ],
  },
  {
    key: "tab-13",
    title: "Home care",
    image: "/images/home-care.jpeg",
    link: "/service-1",
    content: [
      "Our Home Care services bring quality healthcare to your doorstep. We offer medical and non-medical support for patients who prefer the comfort of home.",
      "From daily assistance to specialized medical care, our team ensures your well-being and independence.",
    ],
    options: [
      "Personal care and hygiene assistance",
      "Medication reminders and administration",
      "Mobility and transfer support",
      "Companionship and emotional support",
      "Home-based physiotherapy",
      "Post-hospitalization care",
    ],
  },
  {
    key: "tab-14",
    title: "Medicine Delivery",
    image: "/images/medicine-delivery.jpg",
    link: "/service-1",
    content: [
      "Our Medicine Delivery service ensures you receive your prescriptions quickly and safely at your doorstep. We partner with trusted pharmacies to provide genuine medicines and hassle-free delivery.",
      "Stay healthy without leaving home—order your medicines online and get them delivered on time.",
    ],
    options: [
      "Fast and reliable medicine delivery",
      "Online prescription uploads",
      "Wide range of medicines available",
      "Contactless and safe delivery",
      "Refill reminders and subscription options",
      "24/7 customer support",
    ],
  },
  {
    key: "tab-15",
    title: "Lab Investigation",
    image: "/images/lab-investigation.jpg",
    link: "/service-1",
    content: [
      "Our Lab Investigation services offer accurate and timely diagnostic tests for a wide range of health conditions. We use advanced technology to ensure reliable results and support your treatment plan.",
      "Book your lab tests online and receive reports quickly, with the option for home sample collection.",
    ],
    options: [
      "Blood tests and routine investigations",
      "Urine and stool analysis",
      "Hormone and thyroid testing",
      "Diabetes and cholesterol screening",
      "Home sample collection",
      "Digital report delivery",
    ],
  },
  {
    key: "tab-16",
    title: "Corporate Healthcare",
    image: "/images/corporate-healthcamp.jpg",
    link: "/service-1",
    content: [
      "Our Corporate Healthcare solutions promote employee wellness and productivity. We offer customized health checkups, wellness programs, and on-site medical services for organizations of all sizes.",
      "Invest in your team's health with our comprehensive corporate healthcare packages.",
    ],
    options: [
      "Annual health checkups for employees",
      "On-site doctor consultations",
      "Wellness and fitness programs",
      "Vaccination drives",
      "Mental health support",
      "Health awareness workshops",
    ],
  },
  {
    key: "tab-17",
    title: "Healthcamp",
    image: "/images/heatlhcamp.jpg",
    link: "/service-1",
    content: [
      "Our Healthcamp services organize community health camps for preventive screenings, health education, and early detection of diseases. We bring healthcare to underserved areas, promoting wellness for all.",
      "Join our health camps for free checkups, expert advice, and health awareness activities.",
    ],
    options: [
      "Free health checkups",
      "Preventive screenings (blood pressure, diabetes, etc.)",
      "Health education sessions",
      "Consultations with medical specialists",
      "Distribution of health awareness materials",
      "Community wellness activities",
    ],
  },
  {
    key: "tab-18",
    title: "Obstetrics",
    image: "/images/Obstetrics.jpg",
    link: "/service-1",
    content: [
      "Our Obstetrics department provides comprehensive care for women throughout pregnancy, childbirth, and the postpartum period. We are dedicated to ensuring the health and well-being of both mother and baby with personalized attention and advanced medical support.",
      "From prenatal checkups and ultrasounds to labor support and postnatal care, our experienced team guides you through every stage of your journey to motherhood with compassion and expertise.",
    ],
    options: [
      "Prenatal consultations and routine checkups",
      "Ultrasound and fetal monitoring",
      "High-risk pregnancy management",
      "Labor and delivery support",
      "Postnatal care for mother and newborn",
      "Breastfeeding counseling and education",
    ],
  },
];
