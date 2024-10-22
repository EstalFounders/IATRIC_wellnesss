import { useState, useEffect } from "react";
import { Row, Col, Form, Button, Alert, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import styles from "../css/NewTest.module.css";

const NewTest = ({ labtest }) => {
  const router = useRouter();
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [category, setCategory] = useState(null);
  const [series, setSeries] = useState("1");
  const [categoryDetails, setCategoryDetails] = useState({
    category_name: "",
    category_description: "",
  });

  const [testDetails, setTestDetails] = useState({
    title: "",
    description: "",
    sample_required: "",
    preparation_required: "",
    price: "",
    category_id: "",
    discount: "",
    report_within: "",
    test_included: [{ testName: "", description: "", parameters: "" }],
  });

  const [errors, setErrors] = useState({
    category: "",
    test: "",
  });

  const [message, setMessage] = useState("");

  // If the category is passed in query params, update category state
  useEffect(() => {
    if (router.query.category_name) {
      setCategory({
        category_name: router.query.category_name,
        category_description: router.query.category_description,
      });
    }
  }, [router.query]);

  // Validate fields for category creation
  const validateCategory = () => {
    if (
      isNewCategory &&
      (!categoryDetails.category_name || !categoryDetails.category_description)
    ) {
      setErrors((prev) => ({
        ...prev,
        category: "Category name and description are required.",
      }));
      return false;
    }
    return true;
  };

  // Validate test details
  const validateTest = () => {
    if (
      !testDetails.title ||
      !testDetails.description ||
      !testDetails.sample_required ||
      !testDetails.preparation_required ||
      !testDetails.price ||
      !testDetails.report_within ||
      !testDetails.category_id
    ) {
      setErrors((prev) => ({
        ...prev,
        test: "All test fields are required.",
      }));
      return false;
    }
    return true;
  };

  const addTestIncluded = () => {
    const newTest = {
      testName: "",
      description: "",
      parameters: "",
    };
    setSeries(testDetails.test_included.length + 1);
    setTestDetails({
      ...testDetails,
      test_included: [...testDetails.test_included, newTest],
    });
  };

  const deleteTestIncluded = (indexToDelete) => {
    const updatedTests = testDetails.test_included
      .filter((_, index) => index !== indexToDelete)
      .map((test, index) => ({
        ...test,
        series: index + 1, // Reassign the series number after deletion
      }));
    setTestDetails({ ...testDetails, test_included: updatedTests });
  };

  const handleTestIncludedChange = (e, index, field) => {
    const updatedTests = [...testDetails.test_included];
    updatedTests[index][field] = e.target.value;
    setTestDetails({ ...testDetails, test_included: updatedTests });
  };

  const handleCategoryDropDownClick = (key, value) => {
    console.log(key, "key in handle category dropdwon list");
  };
  // Handle form submission and API calls
  const handleSave = async () => {
    console.log(testDetails, "test details");

    setErrors({ category: "", test: "" }); // Reset errors
    setMessage(""); // Reset message

    if (!validateTest()) return;

    try {
      // let categoryId;

      if (isNewCategory) {
        // Create new category if 'New Category' is selected
        const response = await fetch("/api/labtest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryDetails),
        });

        if (!response.ok) throw new Error("Failed to create the category");

        const categoryData = await response.json();
        setTestDetails({ ...testDetails, category_id: categoryData._id });
      }

      if (testDetails.category_id) {
        // API call to store lab test details
        const response = await fetch("/api/labtestcategorydetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...testDetails,
          }),
        });

        if (!response.ok) throw new Error("Failed to create the test details");

        setMessage("Test and category details saved successfully!");
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        test: error.message,
      }));
    }
  };

  return (
    <Container>
      {/* Category Section */}
      <Form.Group>
        <Form.Label>Category</Form.Label>
        <Form.Control
          as="select"
          value={category?.category_name || ""}
          onChange={(e) => {
            const selectedCategoryName = e.target.value;
            const selectedCategoryId =
              e.target.selectedOptions[0].getAttribute("data-id"); // Access the data-id
            if (selectedCategoryName === "new") {
              setIsNewCategory(true);
              setCategory(null);
            } else {
              setIsNewCategory(false);
              setTestDetails({
                ...testDetails,
                category_id: selectedCategoryId,
              });
              // Set both category_name and _id using the data-id attribute
            }
            setCategory({
              category_name: selectedCategoryName,
              _id: selectedCategoryId,
            });
          }}
        >
          {labtest.map((cat) => (
            <option key={cat._id} value={cat.category_name} data-id={cat._id}>
              {cat.category_name}
            </option>
          ))}
          <option value="new">-- new category --</option>
        </Form.Control>
        {isNewCategory && (
          <>
            <Form.Group className="mt-2">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={categoryDetails.category_name}
                onChange={(e) =>
                  setCategoryDetails({
                    ...categoryDetails,
                    category_name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Category Description</Form.Label>
              <Form.Control
                as="textarea"
                value={categoryDetails.category_description}
                onChange={(e) =>
                  setCategoryDetails({
                    ...categoryDetails,
                    category_description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </>
        )}
        {errors.category && <Alert variant="danger">{errors.category}</Alert>}
      </Form.Group>

      {/* Test Details Section */}
      <Form.Group className="mt-3">
        <Form.Label>Test Title</Form.Label>
        <Form.Control
          type="text"
          value={testDetails.title}
          onChange={(e) =>
            setTestDetails({ ...testDetails, title: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Test Description</Form.Label>
        <Form.Control
          as="textarea"
          value={testDetails.description}
          onChange={(e) =>
            setTestDetails({ ...testDetails, description: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Sample Required</Form.Label>
        <Form.Control
          type="text"
          value={testDetails.sample_required}
          onChange={(e) =>
            setTestDetails({ ...testDetails, sample_required: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Preparation Required</Form.Label>
        <Form.Control
          type="text"
          value={testDetails.preparation_required}
          onChange={(e) =>
            setTestDetails({
              ...testDetails,
              preparation_required: e.target.value,
            })
          }
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
          value={testDetails.price}
          onChange={(e) =>
            setTestDetails({ ...testDetails, price: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Discount (%)</Form.Label>
        <Form.Control
          type="number"
          value={testDetails.discount}
          onChange={(e) =>
            setTestDetails({ ...testDetails, discount: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Report Within (Days)</Form.Label>
        <Form.Control
          type="number"
          value={testDetails.report_within}
          onChange={(e) =>
            setTestDetails({ ...testDetails, report_within: e.target.value })
          }
        />
      </Form.Group>
      <h4 className="mt-5">Test Included</h4>
      {testDetails.test_included.map((test, index) => (
        <div key={index} className={styles.testContainer}>
          <h5>Test</h5>
          <Form.Group>
            <Form.Label className={styles.boldLabel}>Test Name</Form.Label>
            <Form.Control
              type="text"
              value={test.testName}
              onChange={(e) => handleTestIncludedChange(e, index, "testName")}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.boldLabel}>
              Test Description
            </Form.Label>
            <Form.Control
              as="textarea"
              value={test.description}
              onChange={(e) =>
                handleTestIncludedChange(e, index, "description")
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.boldLabel}>Parameters</Form.Label>
            <Form.Control
              type="text"
              value={test.parameters}
              onChange={(e) => handleTestIncludedChange(e, index, "parameters")}
            />
          </Form.Group>
          <Button
            variant="danger"
            className="mt-2"
            onClick={() => deleteTestIncluded(index)}
          >
            Delete Test
          </Button>
        </div>
      ))}

      <Button onClick={addTestIncluded} className="mt-2 ml-3">
        Add Test
      </Button>

      {errors.test && <Alert variant="danger">{errors.test}</Alert>}
      <div className="text-center">
        <Button className="mt-4" onClick={handleSave}>
          Save Test
        </Button>
      </div>

      {message && (
        <Alert variant="success" className="mt-3">
          {message}
        </Alert>
      )}
    </Container>
  );
};

export default NewTest;
