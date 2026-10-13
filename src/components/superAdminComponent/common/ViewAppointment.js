import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, ProgressBar } from "react-bootstrap";
import { useRouter } from "next/router";
import { price_symbol } from "../../../constant";

const ViewAppointmentDetailsComp = () => {
  const router = useRouter();
  const [appointment, setAppointmentData] = useState();
  const [totalPrice, setTotalPrice] = useState(); // Example total price
  const [deductions, setDeductions] = useState({
    name: "",
    doctorShare: "",
    platformFee: "",
    paymentProcessingFee: "",
    GST: "",
  });

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const localDeductions = sessionStorage.getItem(
          "consultation_deductions"
        );
        console.log(localDeductions, "local deduction");
        if (localDeductions) {
          setDeductions(JSON.parse(localDeductions));
        } else {
          const response = await fetch("/api/helper/deductions");
          if (!response.ok) {
            throw new Error("Failed to fetch deductions");
          }
          const deductionsArray = await response.json();
          let deductionsData;
          const labTestData = deductionsArray.find(
            (item) => item.name === "Consultation"
          );
          if (labTestData) {
            const {
              name,
              GST,
              doctorShare,
              platformFee,
              paymentProcessingFee,
            } = labTestData;

            deductionsData = {
              name,
              GST,
              doctorShare,
              platformFee,
              paymentProcessingFee,
            };
          } else {
            console.error("LabTest deductions not found.");
          }
          sessionStorage.setItem(
            "consultation_deductions",
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
      const appointmentData = JSON.parse(router.query.data);
      setAppointmentData(appointmentData);
      setTotalPrice(appointmentData.consultationprice); // Set totalPrice when appointment is set
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
                  <b>Name</b>
                </td>
                <td>{appointment.name}</td>
              </tr>
              <tr>
                <td>
                  <b>Consultation Type</b>
                </td>
                <td>{appointment.consultationType}</td>
              </tr>
              <tr>
                <td>
                  <b>Appointment Time</b>
                </td>
                <td>{appointment.appointmentTime}</td>
              </tr>
              <tr>
                <td>
                  <b>Symptoms</b>
                </td>
                <td>{appointment.symptoms}</td>
              </tr>
              <tr>
                <td>
                  <b>Mobile Number</b>
                </td>
                <td>{appointment.patientMobNo}</td>
              </tr>
              <tr>
                <td>
                  <b>Status</b>
                </td>
                <td>{appointment.status}</td>
              </tr>
              <tr>
                <td>
                  <b>Consultation Recording</b>
                </td>
                <td>
                  {appointment.recordingURL ? (
                    <a
                      href={appointment.recordingURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View recording
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Payment Status</b>
                </td>
                <td>{appointment.paymentId?.status || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Cashfree Order ID</b>
                </td>
                <td>{appointment.paymentId?.orderId || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Payment Method</b>
                </td>
                <td>{appointment.paymentId?.method || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Transaction ID</b>
                </td>
                <td>{appointment.paymentId?.transactionId || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Payment ID</b>
                </td>
                <td>{appointment.paymentId?.paymentId || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Refund Status</b>
                </td>
                <td>{appointment.paymentId?.refundId ? "REFUND_PENDING / REFUNDED" : "N/A"}</td>
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
              <h4 className="text-primary">
                {price_symbol}
                {totalPrice}
              </h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <h6>Doctors Share</h6>
              <ProgressBar
                now={deductions.doctorShare}
                label={`${deductions.doctorShare}%`}
                variant="success"
                style={{ height: "20px" }}
              />
              <p className="mt-2 font-weight-bold">
                {price_symbol}
                {((deductions.doctorShare / 100) * totalPrice).toFixed(2)}
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
                {price_symbol}
                {((deductions.platformFee / 100) * totalPrice).toFixed(2)}
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
                {price_symbol}
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
                {price_symbol}
                {((deductions.GST / 100) * totalPrice).toFixed(2)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewAppointmentDetailsComp;
