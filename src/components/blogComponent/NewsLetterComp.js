import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const NewsLetterComp = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setShowError(true);
      return;
    }

    // Here you would typically make an API call to subscribe the user
    console.log("Subscribing email:", email);

    // Simulate successful subscription
    setSubscribed(true);
    setShowError(false);
    setEmail("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (showError) setShowError(false);
  };

  return (
    <div className="newsletter-section py-5 my-5 w-75 mx-auto text-center px-3">
      <Row className="justify-content-center">
        <Col lg={8} className="text-center">
          {/* Header */}
          <h2 className="mb-3 fw-bold text-dark">
            Stay Informed with Our Newsletter
          </h2>

          {/* Description */}
          <p className="mb-4 text-white lead">
            Get the latest medical insights, health tips, and research updates
            delivered to your inbox weekly
          </p>

          {/* Subscription Form */}
          {!subscribed ? (
            <Form
              onSubmit={handleSubmit}
              className="d-flex flex-column flex-md-row gap-3 justify-content-center"
            >
              <Form.Group
                controlId="formEmail"
                className="flex-grow-1"
                style={{ maxWidth: "400px" }}
              >
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  size="lg"
                  className="rounded-pill px-4 w-100 w-md-auto"
                  style={{ minWidth: "250px", maxWidth: "400px" }}
                  required
                />

                {showError && (
                  <Form.Text className="text-danger">
                    Please enter a valid email address
                  </Form.Text>
                )}
              </Form.Group>

              <div
                className="h-25 d-flex align-items-center 
                justify-content-center consultation-btn px-4 py-2 mt-1 
                rounded-pill fw-bold ml-1"
              >
                Subscribe
              </div>
            </Form>
          ) : (
            /* Success Message */
            <Alert variant="success" className="d-inline-block">
              <strong>Thank you for subscribing!</strong> You&apos;ll receive
              our next newsletter soon.
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default NewsLetterComp;
