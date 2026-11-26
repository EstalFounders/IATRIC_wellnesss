import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GeneralPhysician,
  PediatricsIcon,
  CardiologyIcon,
  DermatologistIcon,
  OrthopaedicsIcon,
  GynaecologyIcon,
  PhysiotherapyIcon,
  PulmonologyIcon,
  OphthalmologyIcon,
  Psychiatrist,
  Dentistry,
  LabInvestigation,
  NutritionistIcon,
  ENTIcon,
  NeurologyIcon,
} from "../../../public/svgIcon/all-department-svg-icon";
import {
  normalizeDepartmentName,
  resolveDepartmentIcon,
} from "../Common/departmentIcons";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { useDoctors } from "../../customUtils/useDoctors";

// Same medical glyphs as the homepage speciality component (Demo5Services2).
const ICON_BY_NAME = {
  "general physician": GeneralPhysician,
  "general medicine": GeneralPhysician,
  pediatrics: PediatricsIcon,
  paediatrics: PediatricsIcon,
  cardiology: CardiologyIcon,
  dermatologist: DermatologistIcon,
  dermatology: DermatologistIcon,
  orthopaedics: OrthopaedicsIcon,
  "gynaecology & obstetrics": GynaecologyIcon,
  gynecology: GynaecologyIcon,
  gynaecology: GynaecologyIcon,
  ophthalmology: OphthalmologyIcon,
  pulmonology: PulmonologyIcon,
  psychiatrist: Psychiatrist,
  psychiatry: Psychiatrist,
  dentistry: Dentistry,
  physiotherapy: PhysiotherapyIcon,
  nutritionist: NutritionistIcon,
  pathology: LabInvestigation,
  radiology: GeneralPhysician,
  endocrinology: NutritionistIcon,
  gastroenterology: GeneralPhysician,
  urology: GeneralPhysician,
};

export const DEFAULT_SPECIALITIES = [
  {
    id: "cardiology",
    slug: "cardiology",
    name: "Cardiology",
    description: "Heart, blood vessel and complete circulatory system care.",
    doctors: 14,
    color: "#e63946",
    icon: "cardiology",
  },
  {
    id: "neurology",
    slug: "neurology",
    name: "Neurology",
    description: "Brain, spine and nervous system specialists you can trust.",
    doctors: 9,
    color: "#7048e8",
    icon: "neurology",
  },
  {
    id: "orthopaedics",
    slug: "orthopaedics",
    name: "Orthopaedics",
    description: "Bones, joints, muscles and sports injury treatment.",
    doctors: 11,
    color: "#0ca678",
    icon: "orthopaedics",
  },
  {
    id: "paediatrics",
    slug: "paediatrics",
    name: "Paediatrics",
    description: "Complete healthcare for infants, children and teens.",
    doctors: 8,
    color: "#f76707",
    icon: "paediatrics",
  },
  {
    id: "dentistry",
    slug: "dentistry",
    name: "Dentistry",
    description: "Teeth, gums and oral hygiene treatments for all ages.",
    doctors: 6,
    color: "#1098ad",
    icon: "dentistry",
  },
  {
    id: "ophthalmology",
    slug: "ophthalmology",
    name: "Ophthalmology",
    description: "Eye care, vision testing, lenses and eye surgery.",
    doctors: 7,
    color: "#1c7ed6",
    icon: "ophthalmology",
  },
  {
    id: "pulmonology",
    slug: "pulmonology",
    name: "Pulmonology",
    description: "Asthma, lungs and other respiratory disorders.",
    doctors: 5,
    color: "#37b24d",
    icon: "pulmonology",
  },
  {
    id: "general-medicine",
    slug: "general-medicine",
    name: "General Medicine",
    description: "Everyday check-ups, diagnosis and primary care.",
    doctors: 18,
    color: "#0b7285",
    icon: "general-medicine",
  },
  {
    id: "gynaecology",
    slug: "gynaecology",
    name: "Gynaecology",
    description: "Women's health, pregnancy and fertility support.",
    doctors: 10,
    color: "#d6336c",
    icon: "gynaecology",
  },
  {
    id: "dermatology",
    slug: "dermatology",
    name: "Dermatology",
    description: "Skin, hair and nail treatments by expert doctors.",
    doctors: 7,
    color: "#f59f00",
    icon: "dermatology",
  },
  {
    id: "ent",
    slug: "ent",
    name: "ENT",
    description: "Ear, nose and throat evaluation and surgery.",
    doctors: 6,
    color: "#5f3dc4",
    icon: "ent",
  },
  {
    id: "pathology",
    slug: "pathology",
    name: "Pathology",
    description: "Lab tests, diagnostics and accurate reports.",
    doctors: 12,
    color: "#c2255c",
    icon: "pathology",
  },
  {
    id: "radiology",
    slug: "radiology",
    name: "Radiology",
    description: "X-ray, MRI, CT and ultrasound imaging services.",
    doctors: 5,
    color: "#1971c2",
    icon: "radiology",
  },
  {
    id: "endocrinology",
    slug: "endocrinology",
    name: "Endocrinology",
    description: "Diabetes, thyroid and hormone related care.",
    doctors: 4,
    color: "#e8590c",
    icon: "endocrinology",
  },
  {
    id: "gastroenterology",
    slug: "gastroenterology",
    name: "Gastroenterology",
    description: "Digestive system, stomach and liver treatment.",
    doctors: 8,
    color: "#2b8a3e",
    icon: "gastroenterology",
  },
  {
    id: "urology",
    slug: "urology",
    name: "Urology",
    description: "Kidney, bladder and urinary tract specialists.",
    doctors: 5,
    color: "#862e9c",
    icon: "urology",
  },
];

function getIcon(item) {
  if (!item) return GeneralPhysician;
  const name = normalizeDepartmentName(item.name);
  return (
    ICON_BY_NAME[item.icon] ||
    ICON_BY_NAME[item.slug] ||
    ICON_BY_NAME[item.id] ||
    ICON_BY_NAME[name] ||
    resolveDepartmentIcon(name) ||
    GeneralPhysician
  );
}

function getAccent() {
  // Company primary green for every department icon.
  return "#3b5f1d";
}

// Same word-phrase matcher as department-single.js, so a card named "Gynaecology"
// still counts doctors tagged "Gynaecology & Obstetrics".
const matchKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wordPhraseIn = (haystack, needle) =>
  new RegExp(`(^| )${escapeRegex(needle)}( |$)`).test(haystack);

const serviceMatches = (offeredService, serviceKey) => {
  const offeredKey = matchKey(offeredService);
  if (!offeredKey || !serviceKey) return false;
  if (offeredKey === serviceKey) return true;
  return (
    wordPhraseIn(offeredKey, serviceKey) || wordPhraseIn(serviceKey, offeredKey)
  );
};

// Card names that differ from the doctor's `serviceOffered` spelling.
const SPECIALITY_ALIASES = {
  "general medicine": "general physician",
  paediatrics: "pediatrics",
  dermatology: "dermatologist",
};

const specialityMatchKeys = (item) => {
  const keys = [item.name, item.slug, item.id]
    .filter(Boolean)
    .map((value) => matchKey(value));
  const aliases = keys
    .map((key) => SPECIALITY_ALIASES[key])
    .filter(Boolean)
    .map((value) => matchKey(value));
  return [...new Set([...keys, ...aliases])].filter(Boolean);
};

const countDoctorsBySpeciality = (doctors, specialities) => {
  const list = Array.isArray(doctors) ? doctors : [];
  const counts = {};
  (specialities || []).forEach((item) => {
    const keys = specialityMatchKeys(item);
    const count = list.filter((doctor) =>
      (Array.isArray(doctor.serviceOffered) ? doctor.serviceOffered : []).some(
        (offeredService) =>
          keys.some((key) => serviceMatches(offeredService, key))
      )
    ).length;
    counts[item.id || item.slug || item.name] = count;
  });
  return counts;
};

export default function AllSpecialityCards({
  specialities = DEFAULT_SPECIALITIES,
  showSearch = true,
  showHeading = true,
  heading = "Our Specialities",
  subHeading = "Pick a department to meet the right specialist or book a consultation in a few clicks.",
  // The page owns the <h1>; on /all-departments this block is the page heading,
  // everywhere else it is a section heading.
  headingAs = "h2",
}) {
  const HeadingTag = headingAs;
  const [query, setQuery] = useState("");
  const { doctors, isLoaded } = useDoctors();

  // Real doctor counts per speciality (falls back to the static number only while
  // the roster is still loading).
  const doctorCounts = useMemo(
    () => (isLoaded ? countDoctorsBySpeciality(doctors, specialities) : null),
    [doctors, isLoaded, specialities]
  );

  const list = useMemo(() => {
    const source =
      Array.isArray(specialities) && specialities.length
        ? specialities
        : DEFAULT_SPECIALITIES;

    const search = query.trim().toLowerCase();
    if (!search) return source;

    return source.filter((item) => {
      const haystack = [item.name, item.description, item.slug, item.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(search) !== -1;
    });
  }, [specialities, query]);

  return (
    <div className="speciality-wrap">
      {showHeading || showSearch ? (
        <div className="speciality-head">
          <div className="speciality-head-text">
            {showHeading && heading ? (
              <HeadingTag className="speciality-heading">{heading}</HeadingTag>
            ) : null}
            {showHeading && subHeading ? (
              <p className="speciality-subheading">{subHeading}</p>
            ) : null}
          </div>

          {showSearch ? (
            <div className="speciality-search">
              <FiSearch aria-hidden="true" />
              <input
                type="text"
                value={query}
                placeholder="Search a speciality..."
                aria-label="Search specialities"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {list.length ? (
        <div className="speciality-grid">
          {list.map((item) => {
            const Icon = getIcon(item);
            const accent = getAccent();
            const href =
              item.href ||
              `/department-single?serviceName=${encodeURIComponent(item.name)}`;
            const countKey = item.id || item.slug || item.name;
            const doctorCount = doctorCounts
              ? doctorCounts[countKey]
              : item.doctors;

            return (
              <Link
                key={item.slug || item.id || item.name}
                href={href}
                className="speciality-card"
                style={{ "--sp-accent": accent, "--sp-accent-soft": accent + "1f" }}
              >
                  <div className="speciality-card-top">
                    <span className="speciality-icon">
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" />
                      ) : (
                        <Icon aria-hidden="true" style={{ width: 34, height: 34 }} />
                      )}
                    </span>

                    {doctorCount ? (
                      <span className="speciality-count">{doctorCount}+ Doctors</span>
                    ) : null}
                  </div>

                  <h3>{item.name}</h3>
                  {item.description ? <p>{item.description}</p> : null}

                  <span className="speciality-link">
                    View Specialists
                    <FiArrowRight aria-hidden="true" />
                  </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="speciality-empty">
          No department matched &ldquo;{query}&rdquo;. Please try a different keyword.
        </p>
      )}

      <style jsx>{`
        .speciality-wrap {
          width: 100%;
        }

        .speciality-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 42px;
        }

        .speciality-head-text {
          max-width: 560px;
        }

        .speciality-heading {
          margin: 0 0 12px;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 700;
          color: #15171f;
        }

        .speciality-subheading {
          margin: 0;
          font-size: 15px;
          line-height: 1.75;
          color: #6c7383;
        }

        .speciality-search {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 290px;
          padding: 13px 20px;
          background: #ffffff;
          border: 1px solid #e2e6ee;
          border-radius: 999px;
          color: #8a93a6;
          box-shadow: 0 6px 18px rgba(16, 24, 40, 0.05);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .speciality-search:focus-within {
          border-color: #0b7285;
          box-shadow: 0 10px 24px rgba(11, 114, 133, 0.12);
        }

        .speciality-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 14px;
          color: #15171f;
        }

        .speciality-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .speciality-card {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 26px 24px 22px;
          background: #ffffff;
          border: 1px solid #e6eaf2;
          border-radius: 18px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .speciality-card:hover {
          transform: translateY(-6px);
          border-color: var(--sp-accent);
          box-shadow: 0 22px 42px rgba(16, 24, 40, 0.12);
        }

        .speciality-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .speciality-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 62px;
          height: 62px;
          border-radius: 16px;
          font-size: 26px;
          color: var(--sp-accent);
          background: var(--sp-accent-soft);
          transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
        }

        .speciality-icon img {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }

        .speciality-icon svg {
          width: 34px;
          height: 34px;
        }

        .speciality-card:hover .speciality-icon {
          transform: scale(1.06) rotate(-3deg);
          background: #916f38;
          color: #ffffff;
        }

        .speciality-count {
          padding: 6px 12px;
          border-radius: 999px;
          background: #f3f5fa;
          font-size: 12px;
          font-weight: 600;
          color: #5b6478;
          white-space: nowrap;
        }

        .speciality-card h3 {
          margin: 0 0 10px;
          font-size: 19px;
          line-height: 1.35;
          font-weight: 700;
          color: #15171f;
        }

        .speciality-card p {
          flex: 1;
          margin: 0 0 18px;
          font-size: 14px;
          line-height: 1.7;
          color: #6c7383;
        }

        .speciality-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #8a93a6;
          transition: color 0.3s ease, gap 0.3s ease;
        }

        .speciality-card:hover .speciality-link {
          gap: 13px;
          color: var(--sp-accent);
        }

        .speciality-empty {
          margin: 0;
          padding: 48px 24px;
          text-align: center;
          font-size: 15px;
          color: #6c7383;
          background: #ffffff;
          border: 1px dashed #e2e6ee;
          border-radius: 18px;
        }

        @media (max-width: 1199px) {
          .speciality-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 991px) {
          .speciality-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .speciality-heading {
            font-size: 28px;
          }

          .speciality-search {
            width: 100%;
          }
        }

        @media (max-width: 575px) {
          .speciality-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .speciality-card {
            padding: 22px 20px 20px;
          }

          .speciality-heading {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
