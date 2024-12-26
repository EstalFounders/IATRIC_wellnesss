import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/registerDocComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/registerDocComponent/NavBarComponent/RightSideMenu";
import { signOut } from "next-auth/react";
import { doctor_info_local_storage } from "../../constant";

const styles = {};
const RegisterDocLoginHeader = ({ session }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const userInfo = JSON.parse(
      sessionStorage.getItem(doctor_info_local_storage)
    );

  return (
    <Row className="bg-white border-bottom align-items-center">
      <Col xs={12} md={5} className="mt-4">
        {session && <Navbar />}
      </Col>
      <Col xs={12} md={6} className="py-3">
        <Image
          src="/images/logo.png" // Make sure the path is correct starting from the 'public' directory
          width={180}
          height={70}
          alt="mobile-logo"
          className="pt-2"
        />
      </Col>
      <Col className="mb-3">
      
        {userInfo && (
          <div>
            {/* <button
              style={buttonStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Logout
            </button> */}
            <RightSideMenu user={userInfo} />
          </div>
        )}
      </Col>
    </Row>
  );
};

export default RegisterDocLoginHeader;
