import React, { useState } from "react";
import { useSelector } from "react-redux";
import HealthCheckupCard from "./common/HealthCheckupCard";
import { Col } from "react-bootstrap";

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
    console.log(filteredTests, 'filtered test in 23')
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
      <h2>All Checkups by Category</h2>

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
          <div key={categoryGroup.categoryId} className="w-100 mb-5 px-3">
            {console.log(categoryGroup, 'cateogry group')}
            <h4 className="text-dark mb-3">{categoryGroup.categoryName}</h4>
            <div className="row">
              {categoryGroup.tests.map((checkup) => (
                <Col
                  key={checkup._id}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  className="mb-4"
                >
                  <HealthCheckupCard healthCheckupData={checkup} />
                </Col>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewAllCheckUpDetails;
