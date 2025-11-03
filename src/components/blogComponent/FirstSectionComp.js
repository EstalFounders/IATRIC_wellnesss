
import { useRouter } from "next/router";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import Fuse from "fuse.js";

import SearchDropdown from "../SearchComponent";

const backgroundImage = "/images/blog/blog-bg.png";

// Updated mock data with the new structure
const mockArticles = [
  {
    id: 1,
    category: "Chronic Conditions",
    title: "Understanding Diabetes: Symptoms and Management",
    description: `Diabetes is a chronic condition that affects how your body processes blood sugar. Proper management is crucial for long-term health.`,
    date: "Jan 20, 2025",
    readTime: "5 min read",
    author: "Dr. Michael Rodriguez",
    slug: "understanding-diabetes",
  },
  {
    id: 2,
    category: "Cardiology",
    title:
      "Understanding Heart Disease: Early Warning Signs You Shouldn't Ignore",
    description: `Heart disease remains one of the leading causes of death globally. Recognizing early symptoms can significantly improve outcomes.`,
    date: "Jan 15, 2025",
    readTime: "6 min read",
    author: "Dr. Sarah Chen",
    slug: "heart-disease-warning-signs",
  },
  {
    id: 3,
    category: "Mental Health",
    title: "Mental Health Awareness in Modern Society",
    description: `Mental health is just as important as physical health for overall well-being. Understanding and addressing mental health issues is crucial.`,
    date: "Jan 18, 2025",
    readTime: "4 min read",
    author: "Dr. James Wilson",
    slug: "mental-health-awareness",
  },
  {
    id: 4,
    category: "Nutrition",
    title: "Nutrition Tips for a Healthy Lifestyle",
    description: `Proper nutrition is essential for maintaining good health and preventing diseases. A balanced diet provides the foundation for overall well-being.`,
    date: "Jan 22, 2025",
    readTime: "5 min read",
    author: "Dr. Emily Parker",
    slug: "nutrition-tips",
  },
  {
    id: 5,
    category: "Fitness",
    title: "Exercise and Physical Activity Guidelines",
    description: `Regular physical activity helps improve cardiovascular health and mental well-being. Establishing a consistent exercise routine is key.`,
    date: "Jan 25, 2025",
    readTime: "7 min read",
    author: "Dr. Robert Thompson",
    slug: "exercise-guidelines",
  },
];

// Dropdown component that uses Portal

const FirstSectionComp = ({}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const sectionStyle = {
    padding: "60px 0 70px 0",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    position: "relative",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  };

  const contentStyle = {
    zIndex: 2,
    textAlign: "center",
    maxWidth: "700px",
    position: "relative",
  };

  // Configure Fuse.js for fuzzy search with new article structure
  const fuse = useMemo(
    () =>
      new Fuse(mockArticles, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "category", weight: 0.3 },
          { name: "description", weight: 0.2 },
          { name: "author", weight: 0.1 },
        ],
        includeScore: true,
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
        ignoreLocation: true,
      }),
    []
  );

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const results = fuse.search(query);
    setSearchResults(results.slice(0, 5));
    setShowResults(true);
    setTimeout(updateDropdownPosition, 0);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 2) {
      router.push(`/blog/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (article) => {
    router.push(`/blog/article/${article.slug}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleCloseDropdown = () => {
    setShowResults(false);
  };

  // Update dropdown position when results are shown or on scroll/resize
  useEffect(() => {
    if (showResults) {
      updateDropdownPosition();
    }

    const handleScrollResize = () => {
      if (showResults) {
        updateDropdownPosition();
      }
    };

    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);

    return () => {
      window.removeEventListener("scroll", handleScrollResize);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [showResults]);

  const redirectToBtn = (path) => {
    router.push(path);
  };

  return (
    <section style={sectionStyle}>
      <div style={overlayStyle}></div>
      <div className="container" style={contentStyle}>
        <h1 className="text-white fw-bold mb-3 display-4">
          Your Trusted Source for <br /> Medical Knowledge
        </h1>
        <p className="lead mb-4">
          Expert insights on health, wellness, and medical research. Stay
          informed with evidence-based articles from healthcare professionals.
        </p>

        <div
          className="position-relative"
          ref={searchRef}
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div className="input-group mb-3 shadow-sm">
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-lg"
              placeholder="Search articles, conditions, treatments..."
              aria-label="Search"
              style={{
                paddingRight: "3rem",
                borderRadius: "30px",
                zIndex: 10,
              }}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (searchQuery.length >= 2 && searchResults.length > 0) {
                  setShowResults(true);
                  updateDropdownPosition();
                }
              }}
            />
            <span
              className="position-absolute"
              style={{
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.3rem",
                color: "#6c757d",
                cursor: "pointer",
                zIndex: 11,
              }}
              onClick={searchQuery ? clearSearch : handleSearchSubmit}
            >
              {searchQuery ? (
                <MdClose color="#6c757d" />
              ) : (
                <MdSearch color="#6c757d" />
              )}
            </span>
          </div>
        </div>

        {/* Search Dropdown Portal */}
        <SearchDropdown
          results={searchResults}
          searchQuery={searchQuery}
          showResults={showResults}
          dropdownPosition={dropdownPosition}
          onResultClick={handleResultClick}
          onClose={handleCloseDropdown}
        />

        <div className="row mt-4 justify-content-center w-75 mx-auto">
          <div
            className="col consultation-btn mb-2"
            onClick={redirectToBtn.bind(this, "/blog/allcategory")}
          >
            Explore Categories
          </div>
          <div
            className="col consultation-btn mb-2 ml-1"
            onClick={redirectToBtn.bind(this, "/blog/alllatestarticle")}
          >
            Latest Articles
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirstSectionComp;
