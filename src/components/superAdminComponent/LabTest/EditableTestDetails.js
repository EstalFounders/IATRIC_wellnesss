import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Card } from "react-bootstrap";

const EditableTestDetails = ({ data }) => {
  const [formData, setFormData] = useState(data);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
    setIsModified(true);
  };

  const handleArrayChange = (e, index, key, field) => {
    const updatedArray = formData[key].map((item, idx) =>
      idx === index ? { ...item, [field]: e.target.value } : item
    );
    setFormData({
      ...formData,
      [key]: updatedArray,
    });
    setIsModified(true);
  };

  const addNewItem = (key, newItem) => {
    setFormData({
      ...formData,
      [key]: [...formData[key], newItem],
    });
    setIsModified(true);
  };

  const handleDiscard = () => {
    setFormData(data); // Reset to original data
    setIsModified(false);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/updatelabtestdetails/?id=${formData._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Updated successfully");
        setIsModified(false);
      } else {
        alert("Error updating data");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  return (
    <div>
      <h3>Edit Test Details</h3>
      <Form>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange(e, "title")}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            value={formData.description}
            onChange={(e) => handleInputChange(e, "description")}
          />
        </Form.Group>

        {/* Test Included Array */}
        <Form.Group>
          <Form.Label>Test Included</Form.Label>
          {formData.test_included.map((test, index) => (
            <Card key={test._id} className="mb-3">
              <Card.Body>
                <Form.Label>Test Name</Form.Label>
                <Form.Control
                  type="text"
                  value={test.testName}
                  onChange={(e) =>
                    handleArrayChange(e, index, "test_included", "testName")
                  }
                />
                <Form.Label>Test Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={test.description}
                  onChange={(e) =>
                    handleArrayChange(e, index, "test_included", "description")
                  }
                />
                <Form.Label>Parameters</Form.Label>
                <Form.Control
                  as="textarea"
                  value={test.parameters.join(", ")}
                  onChange={(e) =>
                    handleArrayChange(e, index, "test_included", "parameters")
                  }
                />
              </Card.Body>
            </Card>
          ))}
        </Form.Group>

        {/* Independent Fields */}
        <Form.Group>
          <Form.Label>Sample Required</Form.Label>
          <Form.Control
            type="text"
            value={formData.sample_required.join(", ")}
            onChange={(e) => handleInputChange(e, "sample_required")}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Preparation Required</Form.Label>
          <Form.Control
            type="text"
            value={formData.preparation_required.join(", ")}
            onChange={(e) => handleInputChange(e, "preparation_required")}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="text"
            value={formData.price}
            onChange={(e) => handleInputChange(e, "price")}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Discount</Form.Label>
          <Form.Control
            type="text"
            value={formData.discount}
            onChange={(e) => handleInputChange(e, "discount")}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Report Within</Form.Label>
          <Form.Control
            type="text"
            value={formData.report_within}
            onChange={(e) => handleInputChange(e, "report_within")}
          />
        </Form.Group>
      </Form>

      <div className="m-3">
        <Button
          onClick={() =>
            addNewItem("test_included", {
              testName: "",
              description: "",
              parameters: [],
            })
          }
          className="mx-2"
        >
          Add New Test
        </Button>
        <Button onClick={handleDiscard} className="mx-2">
          Discard
        </Button>
      </div>

      <div className="text-center mt-4">
        <Button variant="primary" onClick={handleUpdate} disabled={!isModified}>
          Update
        </Button>
      </div>
    </div>
  );
};

export default EditableTestDetails;
