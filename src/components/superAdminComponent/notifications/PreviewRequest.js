import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";

const PreviewRequest = ({ request, handleDoctReqApproveOrReject, onClose }) => {
  console.log(request, "request on 6");

  return (
    <Container
      className="mt-5 mb-2"
      style={{ width: "1200px", marginLeft: "100px" }}
    >
      <Row className="align-items-center">
        {/* Doctor Info */}
        <Col md={8}>
          <div className="h2 font-weight-bold">UPDATE REQUEST</div>
          <h4 className="mt-4 text-primary text-uppercase">{request.name}</h4>
          {/* <p className="text-muted">{doctorSpecialty}</p> */}

          {/* Requested Updates */}
          <div className="mt-4">
            <h5>Requested Updates</h5>
            <ul className="list-unstyled">
              {Object.entries(request.updatedFields).map(
                ([key, value], index) => (
                  <li key={index} className="mb-3">
                    <strong className="font-weight-bold">{key}:</strong> <span>{value}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </Col>

        {/* Doctor Image */}
        {/* <Col md={4} className="text-center">
          <Image
            src={doctorImage}
            alt={doctorName}
            width={200}
            height={200}
            className="rounded"
          />
        </Col> */}
      </Row>

      {/* Approve Button */}
      <Row className="mt-4">
        <Col className="text-left">
          <Button variant="primary" onClick={handleDoctReqApproveOrReject}>
            Approve
          </Button>
        </Col>
        <Col className="text-right">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PreviewRequest;
