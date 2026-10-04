import { Container } from "react-bootstrap";
import styles from "../css/FirstSection.module.css"; // Import the CSS module
import { useRouter } from "next/router";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { MdDeliveryDining, MdWifiCalling3 } from "react-icons/md";
import { useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllTestDetails,
  setHealthTestData,
} from "../../../store/slices/labTest/labTestCategoryApiData";
import { useAddToCart } from "../common/CommonMethod";
import { Snackbar } from "@mui/material";
import { color_schema } from "../../../constant";
import { FaSearch } from "react-icons/fa";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { TbCheckupList, TbPercentage } from "react-icons/tb";
import { GrTest } from "react-icons/gr";

export default function FirstSection() {
  const router = useRouter();
  const location = useState("noida");
  // Close search results dropdown when clicking outside
  const dropdownRef = useRef(null);
  const allTestDetails = useSelector(
    (state) => state.labtestHomepage.allTestDetails
  );
  const { snackbarOpen, handleAddToCart, handleSnackbarClose } = useAddToCart();

  // Search Bar Section

  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimeout = useRef(null);
  const lastCall = useRef(0);

  // Removed duplicate fetchTestDetails declaration to avoid redeclaration error

  // Debounce + Throttle handler
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Filter allTestDetails by title
      if (value.trim() === "") {
        setSearchResults([]);
      } else {
        const filtered = (allTestDetails || []).filter((test) =>
          test.title.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(filtered);
      }
    },
    [allTestDetails]
  );

  const testDetails = [
    {
      id: 1,
      icon: <AiOutlineSafetyCertificate size={100} />,
      title: "100 % Safe & hygienic",
      time: "7AM - 10PM",
      backgroundColor: `${color_schema.green}`,
    },
    {
      id: 2,
      icon: <MdDeliveryDining size={100} />,
      title: "Home Sample Collection",
      time: "7AM - 10PM",
      backgroundColor: `${color_schema.green}`,
    },
    {
      id: 3,
      icon: <HiOutlineDocumentReport size={100} />,
      title: "View Reports Online",
      time: "7AM - 10PM",
      backgroundColor: `${color_schema.green}`,
    },
    {
      id: 4,
      icon: <TbPercentage size={100} />,
      title: "Best Price Guarantee",
      time: "7AM - 10PM",
      backgroundColor: `${color_schema.green}`,
    },
  ];

  // State to store search results
  const [searchResults, setSearchResults] = useState([]);
  const dispatch = useDispatch();

  const selectTestResult = (result) => {
    // Navigate to the test details page with the selected result's ID
    setSearchTerm(result.title);
    setSearchResults([]);
    dispatch(setHealthTestData(result));
    router.push({ pathname: "/labTest/viewDetails" });
  };

  const handleResultButtonClick = (result) => {
    // Prevent the dropdown from closing when clicking the "Add" button
    handleAddToCart({ healthCheckupData: result });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAllLabTestsDetails = async () => {
      try {
        const response = await fetch("/api/labtestDetails"); // Replace with your API endpoint
        const data = await response.json();
        dispatch(setAllTestDetails(data));
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchAllLabTestsDetails();
  }, []);

  const eventforViewAllTestDetails = () => {
    router.push("/labTest/viewAllTestDetails");
  };

  const ViewAllCheckUpDetails = () => {
    router.push("/labTest/viewAllCheckups");
  };

  return (
    <div className={styles.fullRow}>
      <Container>
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
        {/* Test Details Cards */}
        <div className={`row ${styles.testDetailsCard}`}>
          {testDetails.map(
            (
              test,
              index // Make sure to get the index from map
            ) => (
              <div
                key={test.id}
                className={`col-12 col-sm-6 col-md-3 mb-4 ${
                  index !== testDetails.length - 1 ? "border-right" : "" // Apply border-right if it's NOT the last element
                }`}
              >
                <div className="py-5 d-flex flex-column align-items-center justify-content-center text-center">
                  <span style={{ fontSize: "40px", marginRight: "10px" }}>
                    {test.icon}
                  </span>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <div
                      style={{ fontWeight: "bold", fontSize: "1.3rem" }}
                      className="mt-2"
                    >
                      {test.title}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
        {/* Search Bar Section */}
        <div className={`row ${styles.thirdSection} lab-test-bg-gradient`}>
          <div className="col-sm-8 col-md-6 mb-3 d-flex flex-row d-flex justify-content-center">
            <input
              className={`${styles.searchBar}`}
              placeholder="Search for tests"
              value={searchTerm}
              onChange={handleSearchChange}
              autoComplete="off"
            />
            <FaSearch
              className={`ml-2 labtest-searchIcon consultation-btn`}
              color={color_schema.green}
              size={20}
              fontWeight={"bold"}
            />
            {searchTerm && searchResults.length > 0 && (
              <div className={styles.autocompleteDropdown} ref={dropdownRef}>
                <div className={styles.scrollableList}>
                  {searchResults.map((result, idx) => (
                    <div
                      key={result.id || idx}
                      className={styles.autocompleteDropdownItem}
                    >
                      <div
                        className={styles.itemContent}
                        onClick={() => selectTestResult(result)}
                      >
                        <div className="on-hover-blue">
                          <u>{result.title}</u>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <div
                          className={styles.itemButton}
                          onClick={() => handleResultButtonClick(result)}
                        >
                          Add
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {searchResults.length > 5 && (
                  <div className={styles.viewAllLink}>
                    <div onClick={() => eventforViewAllTestDetails()}>
                      View all test details
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className={`col-sm-4 col-md-2 mb-3 consultation-btn d-flex justify-content-center ml-5`}
            onClick={() => eventforViewAllTestDetails()}
          >
            <div className="mt-2 h5 font-weight-bold">
              Lab Tests {<GrTest size={30} />}
            </div>
          </div>
          <div
            className={`col-sm-4 col-md-2 mb-3 consultation-btn d-flex justify-content-center ml-5`}
          >
            <div
              className="mt-2 h5 font-weight-bold"
              onClick={() => ViewAllCheckUpDetails()}
            >
              Checkups {<TbCheckupList size={30} />}
            </div>
          </div>
          {/* <div className="col-12 col-sm-8 col-md-3 d-flex flew-row  d-flex justify-content-center">
            <div
              className={`col-3 d-flex justify-content-center align-items-center consultation-btn`}
              style={{ width: "58px", height: "58px" }}
            >
              <MdWifiCalling3 size={30} color={color_schema.green} />
            </div>
            <div className={`${styles.emergencyText}`}>
              <div>24H Emergency</div>
              <div>876786543</div>
            </div>
          </div> */}
        </div>

        {snackbarOpen && (
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            message="Item added to cart"
          />
        )}
      </Container>
    </div>
  );
}
