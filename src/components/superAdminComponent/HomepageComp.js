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
import { api, vapidKey } from "../../constant";
import Preloader from "../Preloader";
import { Alert, Snackbar } from "@mui/material";
import AppointTable from "./common/AppointmentTable";
import RecentDoctors from "./RecentDoctors/RecentDoctors";
import { useDispatch } from "react-redux";
import {
  setAllappointments,
  setAllDoctor,
  setAllLab,
  setAllLabTest,
  setServiceOffered,
} from "../../store/slices/superAdmin/homepageSlice";
import { calculateTotalIncome } from "./utility/helper";
import { setConsultationType } from "../../store/slices/superAdmin/otherDetailsSlice";
import { fetchDoctors } from "../ApiService/ConsultationApiService";
import { messaging } from "../../../lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import NotificationHandler from "./common/NotificationHandler";

export default function HomepageComp() {
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(
    "staus has been changed"
  );
  const [severity, setSeverity] = useState("success");
  const router = useRouter();
  const dispatch = useDispatch();




  

  useEffect(() => {
    // If no data in local storage, fetch from API
    fetch(api.consiltationFee)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch consultations");
        }
        return response.json();
      })
      .then((data) => {
        dispatch(setConsultationType(data));
      })
      .catch((error) => console.error("Error fetching consultations:", error));
  }, []);

  useEffect(() => {
    console.log(doctors, "doctors in use eeffe");
    if (!(doctors.length > 0)) {
      fetchDoctors(dispatch, setDoctors, setIsDoctorLoading);
    }
  }, []); // Empty dependency array ensures the effect runs only once

  useEffect(() => {
    // Listen to foreground messages
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      alert(payload.notification.title + ": " + payload.notification.body);
    });
  }, []);

  useEffect(() => {
    setIsAppointmentLoading(true);
    const fetchData = async () => {
      try {
        const [
          appointmentsResponse,
          labTestsResponse,
          labResponse,
          serviceOfferedResponse,
        ] = await Promise.all([
          fetch(api.bookConsultation), // Replace with actual API endpoint
          fetch(api.bookLabTest), // Replace with actual API endpoint
          fetch(api.addNewLab),
          fetch(api.serviceOffered),
        ]);

        const [appointmentsData, labTestsData, labData, serviceOfferedData] =
          await Promise.all([
            appointmentsResponse.json(),
            labTestsResponse.json(),
            labResponse.json(),
            serviceOfferedResponse.json(),
          ]);
        const appointments = appointmentsData.appointments;
        const labTest = labTestsData.labTests;
        setAppointments(appointments);
        setLabTests(labTest);
        dispatch(setAllappointments(appointments));
        dispatch(setAllLabTest(labTest));
        dispatch(setAllLab(labData));
        dispatch(setServiceOffered(serviceOfferedData));
        // Calculate totals
        const calculatedTotals = calculateTotalIncome(appointments, labTest);
        console.log(calculatedTotals.totatIncome, "calculated totals");
        setTotalIncome(calculatedTotals.totatIncome);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsAppointmentLoading(false);
      }
    };

    fetchData();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: vapidKey,
        });
        console.log("FCM Token:", token);
      } else {
        console.warn("Permission denied");
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };

  // const calculateStatistics = (appointments) => {
  //   const uniquePatients = new Set();

  //   appointments.forEach((appointment) => {
  //     if (appointment.patientMobNo) {
  //       uniquePatients.add(appointment.mobileNumber);
  //     }
  //     if (appointment.price) {
  //       totalIncome += Number(appointment.price); // Convert price to a number
  //     }
  //   });

  //   setTotalPatients(uniquePatients.size);
  // };

  const refreshDoctorList = async () => {
    await fetchDoctors();
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
        window.alert("Something went wrong, please try again");
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
                  <b>{labTests.length}</b>
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
                  <b>{totalIncome} rs</b>
                </Card.Text>
              </Card.Body>
            </Card>
          </CardDeck>
        </Col>
      </Row>

      {/* <div>
        <AppointTable
          heading={"Appointments"}
          isLoading={isAppointmentLoading}
          appointments={appointments}
          onUpdateStatus={handleUpdateStatus}
        />
      </div> */}

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
