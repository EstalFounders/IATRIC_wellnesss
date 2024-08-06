import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/registerDocComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/registerDocComponent/NavBarComponent/RightSideMenu";
import { signOut } from "next-auth/react";

const styles = {};
const RegisterDocLoginHeader = ({ session }) => {
  const router = useRouter();

  const handleLogout = async () => {
    const callbackUrl = process.env.NODE_ENV === 'production' ? 'https://development.d2xrlfkxmadgut.amplifyapp.com/' : 'http://localhost:3000';
    await signOut({ callbackUrl: `${callbackUrl}/registerDoc/login` });
  };

  return (
    <Row className="bg-white border-bottom align-items-center">
      <Col xs={12} md={4} className="mt-4">
        {session && <Navbar />}
      </Col>
      <Col xs={12} md={4} className="text-center py-3">
        <Image
          src="/images/logo.png" // Make sure the path is correct starting from the 'public' directory
          width={180}
          height={70}
          alt="mobile-logo"
          className="pt-2"
        />
      </Col>
      <Col xs={12} md={4} className="mt-4 text-md-right text-center">
        {session && (
          <div className="mr-2" onClick={handleLogout}>
            <Button>Logout</Button>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default RegisterDocLoginHeader;
