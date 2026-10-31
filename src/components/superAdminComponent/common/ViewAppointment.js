import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, ProgressBar } from "react-bootstrap";
import { useRouter } from "next/router";
import { price_symbol } from "../../../constant";
import { formatConsultationTypes } from "../../../utils/consultationFee";

const CACHE_KEY = "consultation_deductions";

// The deductions collection only stores the three shares (doctorShare,
// platformFee, paymentProcessingFee); some older documents also carry a name and
// a GST value. Every percentage therefore falls back to 0 instead of
// `undefined`, which used to crash the ProgressBar/`toFixed` calls below.
const DEFAULT_DEDUCTIONS = {
  name: "Consultation",
  doctorShare: 0,
  platformFee: 0,
  paymentProcessingFee: 0,
  GST: 0,
};

const toPercentage = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

/** Returns a complete breakdown object, or null when nothing usable was passed. */
const normaliseDeductions = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    name: value.name || DEFAULT_DEDUCTIONS.name,
    doctorShare: toPercentage(value.doctorShare),
    platformFee: toPercentage(value.platformFee),
    paymentProcessingFee: toPercentage(value.paymentProcessingFee),
    GST: toPercentage(value.GST),
  };
};

/** Cached value from a previous visit - dropped when it cannot be parsed. */
const readCachedDeductions = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = normaliseDeductions(JSON.parse(cached));
    if (!parsed) sessionStorage.removeItem(CACHE_KEY);
    return parsed;
  } catch (error) {
    console.error("Could not read the cached deductions:", error);
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const fetchConsultationDeductions = async () => {
  const response = await fetch("/api/helper/deductions");
  if (!response.ok) {
    throw new Error("Failed to fetch deductions");
  }
  const deductionList = await response.json();
  if (!Array.isArray(deductionList) || deductionList.length === 0) return null;
  const consultation =
    deductionList.find((item) => item?.name === "Consultation") ||
    deductionList[0];
  return normaliseDeductions(consultation);
};

const ViewAppointmentDetailsComp = () => {
  const router = useRouter();
  const [appointment, setAppointmentData] = useState();
  const [totalPrice, setTotalPrice] = useState(); // Example total price
  const [deductions, setDeductions] = useState(DEFAULT_DEDUCTIONS);

  useEffect(() => {
    let cancelled = false;

    const loadDeductions = async () => {
      const cached = readCachedDeductions();
      if (cached) {
        setDeductions(cached);
        return;
      }
      try {
        const fresh = await fetchConsultationDeductions();
        // No usable record: keep the 0% defaults instead of storing `undefined`.
        if (!fresh || cancelled) return;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        setDeductions(fresh);
      } catch (error) {
        console.error("Error fetching deductions:", error);
      }
    };

    loadDeductions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!router.query.data) return;
    try {
      const appointmentData = JSON.parse(router.query.data);
      setAppointmentData(appointmentData);
      setTotalPrice(appointmentData.consultationprice); // Set totalPrice when appointment is set
    } catch (error) {
      console.error("Could not read the appointment details:", error);
    }
  }, [router.query.data]);

  if (!appointment) {
    return <p>Loading...</p>;
  }

  const total = Number(totalPrice) || 0;
  const amountFor = (percentage) => ((toPercentage(percentage) / 100) * total).toFixed(2);

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
                <td>{formatConsultationTypes(appointment.consultationType)}</td>
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
                {total}
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
                {amountFor(deductions.doctorShare)}
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
                {amountFor(deductions.platformFee)}
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
                {amountFor(deductions.paymentProcessingFee)}
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
                {amountFor(deductions.GST)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewAppointmentDetailsComp;
