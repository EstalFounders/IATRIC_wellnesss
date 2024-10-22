import { Container } from "react-bootstrap";
import styles from "../css/FirstSection.module.css"; // Import the CSS module
import { useRouter } from "next/router";
import { CiSearch } from "react-icons/ci";
import { useState } from "react";
import LabTesLandingPageHeader from "../../../layout/Header/LabTestLandingPageHeader";
import { MdWifiCalling3 } from "react-icons/md";
import { BiSolidDonateBlood } from "react-icons/bi";
import { PiPaperPlaneTiltBold } from "react-icons/pi";

export default function FirstSection() {
  const router = useRouter();
  const location = useState("noida");

  const handleLocationClick = () => {
    // Your location click handler logic
  };

  const testDetails = [
    {
      id: 1,
      icon: <BiSolidDonateBlood />, 
      title: "Home Blood Test",
      time: "6AM - 10PM",
      backgroundColor: "#DDE6C6", 
    },
    {
      id: 2,
      icon: <BiSolidDonateBlood />,
      title: "Urine Test At Lab",
      time: "7AM - 11PM",
      backgroundColor: "#DDE6C6",
    },
    {
      id: 3,
      icon: <BiSolidDonateBlood />,
      title: "Urine Test At Lab",
      time: "7AM - 11PM",
      backgroundColor: "#DDE6C6",
    },
    {
      id: 4,
      icon: <BiSolidDonateBlood />,
      title: "Urine Test At Lab",
      time: "7AM - 11PM",
      backgroundColor: "#DDE6C6",
    },
  ];

  return (
    <div className={styles.fullRow}>
      <Container>
        {/* Header Section */}
        <div className="row justify-content-center">
          <div className="col">
            <LabTesLandingPageHeader />
          </div>
        </div>

        {/* Lab Report Text */}
        <div className="row justify-content-center">
          <div className={`col-12 ${styles.getLabReportTest}`}>
            Get Your Lab Reports in 6 hours.
            <div>Blood collected from your Doorstep.</div>
          </div>
        </div>

        {/* Subtext */}
        <div className="row justify-content-center">
          <div className={`col-12 ${styles.getLabReportSubText}`}>
            Fast. Convenient. Reliable. Your health, prioritized.
          </div>
        </div>

        {/* Search Bar Section */}
        <div className={`row justify-content-center ${styles.thirdSection}`}>
          <div className="col-sm-8 col-md-5 mb-3 d-flex">
            <input
              className={styles.searchBar}
              placeholder="Search for tests"
            />
            <CiSearch className={styles.searchIcon} size={20} />
          </div>
          <div className={`col-sm-4 col-md-3 mb-3 ${styles.getQuotesNow}`}>
            <div>Get Quotes Now   {<PiPaperPlaneTiltBold />}</div>
            <div></div>
          </div>
          <div className="col-12 col-sm-8 col-md-4 d-flex justify-content-center">
            <div className={`col-3 ${styles.callingButton}`}>
              <MdWifiCalling3 size={30} />
            </div>
            <div className={`col ${styles.emergencyText}`}>
              <div>24H Emergency</div>
              <div>876786543</div>
            </div>
          </div>
        </div>

        {/* Test Details Cards */}
        <div className={`row ${styles.testDetailsCard}`}>
          {testDetails.map((test) => (
            <div key={test.id} className="col-12 col-sm-6 col-md-3  mb-4">
              <div
                style={{
                  backgroundColor: test.backgroundColor,
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "left",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="d-flex align-items-center mb-2">
                  <span style={{ fontSize: "24px", marginRight: "10px" }}>
                    {test.icon}
                  </span>
                  <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    {test.title}
                  </div>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#7a7a7a" }}>
                  {test.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
