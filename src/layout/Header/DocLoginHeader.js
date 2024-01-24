import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

const DocLoginHeader = ({ session }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Additional logic after successful sign-out
      router.push("/registerDoc/onload"); // Redirect to the login screen
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
      <Row className="bg-white border-bottom">
        <Col className="pl-4" md={10}>
          <Image
            src="/images/logo.png" // Make sure the path is correct starting from the 'public' directory
            width={180}
            height={70}
            alt="mobile-logo"
            className="pt-2"
          />
        </Col>
        <Col>
          {session && (
            <Button
              type="button"
              className="btn btn-secondary bg-danger text-white mt-3"
              onClick={handleSignOut}
            >
              Log out
            </Button>
          )}
        </Col>
      </Row>
  );
};

export default DocLoginHeader;
