import {
  Button,
  Card,
  CardDeck,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useState } from "react";
import { getSession, signOut } from "next-auth/react";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import { useRouter } from "next/router";
import DocLoginHeader from "../../src/layout/Header/DocLoginHeader";
import Navbar from "../../src/components/registerDocComponent/NavBarComponent/Navbar";
import Layouts from "../../src/layout/Layouts";
import RightSideMenu from "../../src/components/registerDocComponent/NavBarComponent/RightSideMenu";
import { FaCalendar, FaMoneyBill, FaUsb, FaUser } from "react-icons/fa";
import RecentAppointment from "../../src/components/registerDocComponent/RecentAppointment/RecentAppointment";

export default function Homepage() {
  const session = getSession();
  const [login, setLogin] = useState(true);

  const toggle = () => {
    setLogin(!login);
  };

  const itemsData = [
    { id: 1, name: 'John Doe', gender: 'Male', date: '2024-01-27', disease: 'Flu', status: 'In Progress' },
    { id: 2, name: 'Jane Doe', gender: 'Female', date: '2024-01-28', disease: 'Cold', status: 'Completed' },
    // Add more items as needed
  ];

  return (
    <AuthenticatedComponent>
    <Layouts header={7} footer={7}>
        <Row className="m-4">
            <Col style={{marginTop: 60}}>
      <CardDeck className="w-75 ml-auto mr-auto mt-4">
        <Card className="rounded-circle">
          <div className="text-center mt-4">
            <FaUser color="#0009C7" size={50} />
          </div>
          <Card.Body>
            <Card.Title className="text-center">
              Total Patients
            </Card.Title>
            <Card.Text className="text-center"><b>10</b></Card.Text>
          </Card.Body>
        </Card>

        <Card className="rounded-circle">
          <div className="text-center mt-4">
            <FaCalendar color="#C70018" size={50} />
          </div>
          <Card.Body>
            <Card.Title className="text-center">
              Appointments
            </Card.Title>
            <Card.Text className="text-center"><b>20</b></Card.Text>
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
      
      <Row className="w-50 ml-auto mr-auto border p-4 rounded" style={{marginTop: 100}}>
        <Col className="mt-2">
        <RecentAppointment data={itemsData} className="text-center" />
        </Col>
      </Row>
    </Layouts>
     </AuthenticatedComponent>
  );
}
