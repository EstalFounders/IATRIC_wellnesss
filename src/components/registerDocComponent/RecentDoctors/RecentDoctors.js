// components/ItemList.js
import React from "react";
import ItemCard from "./DocItemCards";
import { Button, Col, Row } from "react-bootstrap";

const RecentDoctors = ({ data }) => {
  console.log(data[0].area_of_expertise, 'item on recent doctor')
  return (
    <Row>
      <Col>
        <Row>
          <Col>
          <h4>
            <b>Recent Doctors</b>
          </h4>
          </Col>
          <Col className="text-right">
          <Button className="bg-primary">Add Doctor</Button>
          </Col>
        </Row>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          className="mt-4"
        >
          <Col style={{color: '#3498db'}}><strong>Name</strong></Col>
          <Col style={{color: '#27ae60'}}><strong>Area of Expertise</strong></Col>
          <Col style={{color: '#f39c12'}}><strong>Degree</strong></Col>
          <Col style={{color: '#3498db'}}><strong>Work Days</strong></Col>
          <Col style={{color: '#e74c3c'}}><strong>Joining Date</strong></Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.map((item) => (
            
            <ItemCard
              key={item.id} // Ensure each item has a unique key
              name={item.name}
              area_of_expertise={item.area_of_expertise}
              degree={item.degree}
              work_days={item.work_days}
              joining_date={item.joining_date}
            />
          ))}
        </div>
        <Row className="mt-4">
            <Col className="text-center">
            <Button>View Doctors</Button>
            </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default RecentDoctors;
