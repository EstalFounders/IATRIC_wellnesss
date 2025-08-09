import React, { useState } from "react";
import { useSelector } from "react-redux";
import HealthCheckupCard from "./common/HealthCheckupCard";
import { Col } from "react-bootstrap";
import { HorizontalScrollContainer } from "./common/HorizontalContainer";
import { TiArrowBack } from "react-icons/ti";

const ViewAllCheckUpDetails = () => {
  const [search, setSearch] = useState("");

  const allCheckUpDetails = useSelector(
    (state) => state.labtestHomepage.allCheckUpDetails
  );
  const categoryDetails = useSelector(
    (state) => state.labtestHomepage.categoryDetails
  );

  // Filter tests based on search input
  const filteredTests = allCheckUpDetails.filter((test) =>
    test.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group tests by categoryId
  const groupedByCategory = categoryDetails.reduce((acc, category) => {
    const categoryTests = filteredTests.filter(
      (test) => test.category_id === category._id
    );
    if (categoryTests.length > 0) {
      acc.push({
        categoryName: category.category_name,
        categoryId: category._id,
        tests: categoryTests,
      });
    }
    return acc;
  }, []);

  return (
    <div className="d-flex flex-column align-items-center mt-5 labtest-bg-image">
      <div className="row">
              <div className="col h2 d-flex align-items-center">
                All Checkups
                <span
                  className="arrow-icon ml-2"
                  onClick={() => window.history.back()}
                >
                  <TiArrowBack />
                </span>
              </div>
            </div>

      <input
        type="text"
        placeholder="Search tests..."
        value={search}
        className="mt-2"
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "80%",
          padding: 8,
          marginBottom: 32,
          fontSize: 16,
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      />

      {groupedByCategory.length === 0 ? (
        <p className="text-muted">No checkups found</p>
      ) : (
        groupedByCategory.map((categoryGroup) => (
          <div key={categoryGroup.categoryId} className="mb-5 px-3 w-75">
            <h4 className="text-dark mb-3">{categoryGroup.categoryName}</h4>
            <HorizontalScrollContainer>
              {categoryGroup.tests.map((checkup) => (
                <div key={checkup._id}>
                  <HealthCheckupCard healthCheckupData={checkup} />
                </div>
              ))}
            </HorizontalScrollContainer>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewAllCheckUpDetails;









