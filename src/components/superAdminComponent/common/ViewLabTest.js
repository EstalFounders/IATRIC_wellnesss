import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, ProgressBar } from "react-bootstrap";
import { getAppointmentData } from "./CommonMethod";
import { useRouter } from "next/router";

const ViewLabTestDetailsComp = () => {
  const router = useRouter();
  const [appointment, setAppointmentData] = useState();
  const [totalPrice, setTotalPrice] = useState(); // Example total price
  const [deductions, setDeductions] = useState({
    name: "",
    labShare: "",
    platformFee: "",
    paymentProcessingFee: "",
    GST: "",
  });

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const localDeductions = localStorage.getItem("lab_deductions");
        // console.log(localDeductions, "local deduction");
        if (!localDeductions) {
          setDeductions(JSON.parse(localDeductions));
        } else {
          const response = await fetch("/api/helper/deductions");
          if (!response.ok) {
            throw new Error("Failed to fetch deductions");
          }
          const deductionsArray = await response.json();
          let deductionsData;
          const labTestData = deductionsArray.find(
            (item) => item.name === "LabTest"
          );
          if (labTestData) {
            const { name, GST, platformFee, paymentProcessingFee, labShare } =
              labTestData;

            deductionsData = {
              name,
              labShare,
              platformFee,
              paymentProcessingFee,
              GST,
            };
          } else {
            console.error("LabTest deductions not found.");
          }

          localStorage.setItem(
            "lab_deductions",
            JSON.stringify(deductionsData)
          );
          setDeductions(deductionsData);
        }
      } catch (error) {
        console.error("Error fetching deductions:", error);
      }
    };

    fetchDeductions();
  }, []);

  useEffect(() => {
    if (router.query.data) {
      setTotalPrice(JSON.parse(router.query.data).totalPrice);
      setAppointmentData(JSON.parse(router.query.data));
    }
  }, [router.query.data]);

  if (!appointment) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}
    >
      {/* Appointment Details */}
      <Card className="mb-4">
        <Card.Header as="h4" className="bg-primary text-white">
          Appointment Details
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <tbody>
              <tr>
                <td>
                  <b>Payment Method</b>
                </td>
                <td>{appointment.paymentMethod}</td>
              </tr>
              <tr>
                <td>
                  <b>Booking Time</b>
                </td>
                <td>{appointment.createdAt}</td>
              </tr>
              <tr>
                <td>
                  <b>Mobile Number</b>
                </td>
                <td>{appointment.mobileNumber}</td>
              </tr>
              <tr>
                <td>
                  <b>Price</b>
                </td>
                <td>{appointment.totalPrice}</td>
              </tr>
              <tr>
                <td>
                  <b>Status</b>
                </td>
                <td>{appointment.paymentStatus}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <Card.Header as="h4" className="bg-success text-white">
          Price Breakdown
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col className="text-center">
              <h5>Total Price</h5>
              <h4 className="text-primary">₹{totalPrice}</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <h6>Lab Share</h6>
              <ProgressBar
                now={deductions.labShare}
                label={`${deductions.labShare}%`}
                variant="success"
                style={{ height: "20px" }}
              />
              <p className="mt-2 font-weight-bold">
                ₹{((deductions.labShare / 100) * totalPrice).toFixed(2)}
              </p>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <h6>Platform Fee</h6>
              <ProgressBar
                now={deductions.platformFee}
                label={`${deductions.platformFee}%`}
                variant="info"
                style={{ height: "20px" }}
              />
              <p className="mt-2 font-weight-bold">
                ₹{((deductions.platformFee / 100) * totalPrice).toFixed(2)}
              </p>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <h6>Payment Processing Fee</h6>
              <ProgressBar
                now={deductions.paymentProcessingFee}
                label={`${deductions.paymentProcessingFee}%`}
                variant="warning"
                style={{ height: "20px" }}
              />
              <p className="mt-2 font-weight-bold">
                ₹
                {((deductions.paymentProcessingFee / 100) * totalPrice).toFixed(
                  2
                )}
              </p>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <h6>GST</h6>
              <ProgressBar
                now={deductions.GST}
                label={`${deductions.GST}%`}
                variant="warning"
                style={{ height: "20px" }}
              />
              <p className="mt-2 font-weight-bold">
                ₹{((deductions.GST / 100) * totalPrice).toFixed(2)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewLabTestDetailsComp;
