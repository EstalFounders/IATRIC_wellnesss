// AddDoctorForm.js
import React, { useEffect, useState } from "react";

import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { fetchAllPost, postArticleApi } from "../apiService/postArticleService";
import { api, apiAction } from "../../../constant";
import { set } from "lodash";
import Preloader from "../../Preloader";
import SuperAdminModel from "../model/SuperAdminModel";
import { ArticleManager } from "./AllPostComponent";

// JSDoc type for clarity (you can convert this to a TS interface in .tsx)
/**
 * @typedef {Object} ArticleDetails
 * @property {string} category
 * @property {string} title
 * @property {string} date
 * @property {string} readTime
 * @property {string} author
 * @property {string} description
 */

/**
 * @param {{ onSubmit: (data: ArticleDetails) => void }} props
 */

const PostArticleComp = ({ onSubmit, initialValues = {} }) => {
  const [category, setCategory] = useState(initialValues.category || "");
  const [title, setTitle] = useState(initialValues.title || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [readTime, setReadTime] = useState(initialValues.readTime || "");
  const [author, setAuthor] = useState(initialValues.author || "");
  const [description, setDescription] = useState(
    initialValues.description || ""
  );
  const [showModal, setShowModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from API on component mount
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          api.helperApi + `?action=${apiAction.fetchCateogories}`
        );
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const [errors, setErrors] = useState({
    category: "",
    title: "",
    date: "",
    author: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();

    const newErrors = {
      category: category ? "" : "Category is required",
      title: title ? "" : "Title is required",
      date: date ? "" : "Date is required",
      author: author ? "" : "Author is required",
      description: description ? "" : "Description is required",
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg !== "");
    if (hasError) return;

    const body = {
      category,
      title,
      date,
      readTime,
      author,
      description,
    };
    await postArticleApi(api.postArticle, body);
    setLoader(false);
  };

  return (
    <div className="py-4">
      <Container style={{ maxWidth: "700px" }}>
        <span className="flew-row d-flex justify-content-center">
          <h2 className="mb-4 text-center">{"Create Article"}</h2>
          <h2
            className="mb-4 text-center text-primary clickable-div"
            onClick={() => setShowModal(true)}
          >
            <u>{"/View Articles"}</u>
          </h2>
        </span>

        <Form onSubmit={handleSubmit} className="py-3">
          <Row>
            <Col xs={12} className="mb-3">
              <Form.Group controlId="articleCategory">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  isInvalid={!!errors.category}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
                {errors.category && (
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} className="mb-3">
              <Form.Group controlId="articleTitle">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  isInvalid={!!errors.title}
                />
                {errors.title && (
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6} className="mb-3">
              <Form.Group controlId="articleDate">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  isInvalid={!!errors.date}
                />
                {errors.date && (
                  <Form.Control.Feedback type="invalid">
                    {errors.date}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6} className="mb-3">
              <Form.Group controlId="articleReadTime">
                <Form.Label>Read Time</Form.Label>
                <Form.Control
                  type="text"
                  placeholder='e.g. "5 min read"'
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} className="mb-3">
              <Form.Group controlId="articleAuthor">
                <Form.Label>Author *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  isInvalid={!!errors.author}
                />
                {errors.author && (
                  <Form.Control.Feedback type="invalid">
                    {errors.author}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} className="mb-3">
              <Form.Group controlId="articleDescription">
                <Form.Label>Description / Content *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="Write the article content here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  isInvalid={!!errors.description}
                />
                {errors.description && (
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} className="mt-3">
              <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary">
                  {"Save Article"}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
      {loader && <Preloader />}
      <SuperAdminModel isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="mt-2">
          <ArticleManager />
        </div>
      </SuperAdminModel>
    </div>
  );
};

export default PostArticleComp;
