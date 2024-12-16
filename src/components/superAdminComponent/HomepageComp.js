import {
  Button,
  Card,
  CardDeck,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaMoneyBill, FaUser } from "react-icons/fa";
import { GrTest } from "react-icons/gr";
import { api } from "../../constant";
import Preloader from "../Preloader";
import { Alert, Snackbar } from "@mui/material";
import AppointTable from "./common/AppointmentTable";
import RecentDoctors from "./RecentDoctors/RecentDoctors"

export default function HomepageComp() {
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [income, setIncome] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(
    "staus has been changed"
  );
  const [severity, setSeverity] = useState("success");
  const router = useRouter();

  async function fetchDoctors() {
    try {
      const response = await fetch(api.addDoctor); // Fetch data from the API
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json(); // Extract JSON data from the response
      setDoctors(data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching data client:", error);
    } finally {
      setIsDoctorLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors(); // Call the fetchDoctors function when the component mounts
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(api.bookConsultation); // Fetch data from the API
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json(); // Extract JSON data from the response
      setAppointments(data.appointments); // Update state with fetched data
      calculateStatistics(data.appointments);
    } catch (error) {
      console.error("Error fetching data client:", error);
    } finally {
      setIsAppointmentLoading(false);
    }
  },[])

  useEffect(() => {
    fetchAppointments(); // Call the fetchAppointments function when the component mounts
  }, [fetchAppointments]);

  const calculateStatistics = (appointments) => {
    const uniquePatients = new Set();

    appointments.forEach((appointment) => {
      if (appointment.patientMobNo) {
        uniquePatients.add(appointment.mobileNumber);
      }
      if (appointment.price) {
        totalIncome += Number(appointment.price); // Convert price to a number
      }
    });

    setTotalPatients(uniquePatients.size);
  };

  const refreshDoctorList = async () => {
    await fetchDoctors();
  };

  const handleUpdateStatus = async ({ selectedStatus, appointmentId }) => {
    console.log(
      "Status updated to:",
      selectedStatus,
      "appointment id",
      appointmentId
    );
    try {
      const response = await fetch(`${api.bookConsultation}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, selectedStatus }),
      });

      if (response.ok) {
        handleOpenSnackBar();
        const data = await response.json();
        console.log("Status updated:", data);
        // Handle success, maybe show a notification or refresh the data
      } else {
        const errorData = await response.json();
        console.error("Error updating status:", errorData.message);
      }
    } catch (error) {
      console.error("An error occurred while updating status:", error);
    }
  };

  const handleOpenSnackBar = () => {
    console.log("handle open snack bar");
    setOpenSnackBar(true);
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  const createDoctorSlots = async () => {
    console.log("create doctor slot");
    try {
      const response = await fetch("/api/lib/runCronJob", {
        method: "POST",
      });

      if (response.ok) {
        window.alert("Slots Created");
        // Reset form fields or navigate to another page
      } else {
        console.error("Error adding doctor:", response.statusText);
        handleShowDialog("Something went wrong, please try again");
      }
    } catch (error) {
      console.error("Error adding doctor:", error.message);
    }
  };

  return (
    <>
      <Row className="m-4">
        <Col style={{ marginTop: 60 }}>
          <CardDeck className="w-50 ml-auto mr-auto mt-4">
            <Card
              className="rounded-circle"
              onClick={() => router.push("/superAdmin/consultationBooked")}
            >
              <div className="text-center mt-4">
                <FaUser color="#0009C7" size={50} />
              </div>
              <Card.Body>
                <Card.Title className="text-center">
                  Consultation Booked
                </Card.Title>
                <Card.Text className="text-center">
                  <b>{appointments.length}</b>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card
              className="rounded-circle"
              onClick={() => router.push("/superAdmin/labTestBooked")}
            >
              <div className="text-center mt-4">
                <GrTest color="#C70018" size={50} />
              </div>
              <Card.Body>
                <Card.Title className="text-center">LabTest Booked</Card.Title>
                <Card.Text className="text-center">
                  <b>{totalAppointments}</b>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card
              className="rounded-circle"
              onClick={() => router.push("/superAdmin/earnings")}
            >
              <div className="text-center mt-4">
                <FaMoneyBill color="#18C700" size={50} />
              </div>
              <Card.Body>
                <Card.Title className="text-center">Total Earning</Card.Title>
                <Card.Text className="text-center">
                  <b>{income} rs</b>
                </Card.Text>
              </Card.Body>
            </Card>
          </CardDeck>
        </Col>
      </Row>
      <div>
        <AppointTable
          heading={"Appointments"}
          isLoading={isAppointmentLoading}
          appointments={appointments}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      <Row
        className="w-75 ml-auto mr-auto border p-4 mb-4"
        style={{ marginTop: 100, borderRadius: 20 }}
      >
        <div
          className="mx-1 font-weight-bold text-primary text-center float-right clickable-div"
          onClick={createDoctorSlots}
        >
          <u>Create Doctor Slots</u>
        </div>
        <Row className="w-100 mx-2 border-bottom pb-1">
          {/* Added w-100 to make the child Row full width */}
          <Col className="mt-3">
            <h4>
              <b>Doctors</b>
            </h4>
          </Col>
          <Col className="text-right mt-2">
            <Button className="bg-secondary" href="/superAdmin/addDoctor">
              Add Doctor
            </Button>
          </Col>
        </Row>
        <Row className="ml-4 w-100 mt-3">
          {isDoctorLoading ? (
            <p>Loading...</p>
          ) : doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            <Col>
              <RecentDoctors
                doctors={doctors}
                refreshDoctorList={refreshDoctorList}
              />
            </Col>
          )}
          <Snackbar
            open={openSnackBar}
            autoHideDuration={3000}
            onClose={handleCloseSnackBar}
          >
            <Alert
              onClose={handleCloseSnackBar}
              severity={severity}
              sx={{ width: "100%" }}
            >
              {snackBarMessage}
            </Alert>
          </Snackbar>
        </Row>
      </Row>
    </>
  );
}
