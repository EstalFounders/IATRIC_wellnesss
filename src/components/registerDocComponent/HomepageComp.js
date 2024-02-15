import {
  Button,
  Card,
  CardDeck,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaCalendar, FaMoneyBill, FaUsb, FaUser } from "react-icons/fa";
import RecentAppointment from "../registerDocComponent/RecentAppointment/RecentAppointment";
import RecentDoctors from "../registerDocComponent/RecentDoctors/RecentDoctors";

export default function HomepageComp() {
  const [login, setLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  const toggle = () => {
    setLogin(!login);
  };

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch("/api/addDoctor"); // Fetch data from the API
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json(); // Extract JSON data from the response
        setDoctors(data); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching data client:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDoctors(); // Call the fetchDoctors function when the component mounts
  }, []);

  const AppointmentItemsData = [
    {
      id: 1,
      name: "John Doe",
      gender: "Male",
      date: "2024-01-27",
      disease: "Flu",
      status: "In Progress",
    },
    {
      id: 2,
      name: "Jane Doe",
      gender: "Female",
      date: "2024-01-28",
      disease: "Cold",
      status: "Completed",
    },
    {
      id: 2,
      name: "Jane Doe",
      gender: "Female",
      date: "2024-01-28",
      disease: "Cold",
      status: "Completed",
    },
    {
      id: 2,
      name: "Jane Doe",
      gender: "Female",
      date: "2024-01-28",
      disease: "Cold",
      status: "Completed",
    },
    {
      id: 2,
      name: "Jane Doe",
      gender: "Female",
      date: "2024-01-28",
      disease: "Cold",
      status: "Completed",
    },
    // Add more items as needed
  ];

  return (
    <>
      <Row className="m-4">
        <Col style={{ marginTop: 60 }}>
          <CardDeck className="w-50 ml-auto mr-auto mt-4">
            <Card className="rounded-circle">
              <div className="text-center mt-4">
                <FaUser color="#0009C7" size={50} />
              </div>
              <Card.Body>
                <Card.Title className="text-center">Total Patients</Card.Title>
                <Card.Text className="text-center">
                  <b>10</b>
                </Card.Text>
              </Card.Body>
            </Card>

            <Card className="rounded-circle">
              <div className="text-center mt-4">
                <FaCalendar color="#C70018" size={50} />
              </div>
              <Card.Body>
                <Card.Title className="text-center">Appointments</Card.Title>
                <Card.Text className="text-center">
                  <b>20</b>
                </Card.Text>
              </Card.Body>
            </Card>

            <Card className="rounded-circle">
              <div className="text-center mt-4">
                <FaMoneyBill color="#18C700" size={50} />
              </div>
              <Card.Body>
                <Card.Title className="text-center">Income</Card.Title>
                <Card.Text className="text-center">
                  <b>2300 rs</b>
                </Card.Text>
              </Card.Body>
            </Card>
          </CardDeck>
        </Col>
      </Row>
      <Row
        className="w-75 ml-auto mr-auto border p-4"
        style={{ marginTop: 100, borderRadius: 20 }}
      >
        <Col className="mt-2">
          <RecentAppointment
            data={AppointmentItemsData}
            className="text-center"
          />
        </Col>
      </Row>
      <Row
        className="w-75 ml-auto mr-auto border p-4 mb-4"
        style={{ marginTop: 100, borderRadius: 20 }}
      >
        <Row className="w-100 mx-2">
          {/* Added w-100 to make the child Row full width */}
          <Col className="mt-3">
            <h4>
              <b>Doctors</b>
            </h4>
          </Col>
          <Col className="text-right mt-2">
            <Button className="bg-primary" href="/registerDoc/addDoctor">
              Add Doctor
            </Button>
          </Col>
        </Row>
        <Row className="ml-4 w-100 mt-3">
          {isLoading ? (
            <p>Loading...</p>
          ) : doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            <Col>
              <RecentDoctors doctors={doctors} />
            </Col>
          )}
        </Row>
      </Row>
    </>
  );
}
