import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/superAdminComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/superAdminComponent/NavBarComponent/RightSideMenu";

const SuperAdminLoginHeader = ({ session }) => {
  const router = useRouter();

  return (
    <Row className="bg-white border-bottom">
      <Col className="mt-4" md={5}>
        {session && <Navbar />}
      </Col>
      <Col className="pl-4" md={6}>
        <Image
          src="/images/logo.png" // Make sure the path is correct starting from the 'public' directory
          width={180}
          height={70}
          alt="mobile-logo"
          className="pt-2"
        />
      </Col>
      <Col className="mt-4">
        {session && (
          <div>
            <RightSideMenu />
          </div>
        )}
      </Col>
    </Row>
  );
};

export default SuperAdminLoginHeader;
