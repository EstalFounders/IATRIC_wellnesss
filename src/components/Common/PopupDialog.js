import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { ThemeProvider } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import styled from "@emotion/styled";
import { Col, Row } from "react-bootstrap";
import { FaHome, FaVideo, FaWhatsapp, FaWpforms } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { IoMdCall } from "react-icons/io";
import { BiSolidClinic } from "react-icons/bi";
import { useRouter } from "next/router";
import { color_schema } from "../../constant";

const StyledDialog = styled(Dialog)`
  min-width: 300px;
`;

const StyledListItem = styled(ListItem)`
  &:hover {
    background-color: ${({ theme }) => `${color_schema.yellow}`};
  }
`;

const PopupDialog = ({ isOpen, onClose, options }) => {
  const router = useRouter();
  const theme = useTheme();
  const numberToIcon = {
    0: FiPhoneCall, 
    1: FaWhatsapp,
    2: IoMdCall,
    3: FaVideo,
    4: BiSolidClinic,
    5: FaHome,
    // Add more mappings as needed
  };

  const handleNavigate = (serviceName) => {
    if (!serviceName) return; // null check
    router.push(`/appointment?service=${encodeURIComponent(serviceName)}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledDialog open={isOpen} onClose={onClose}>
        <DialogTitle className="bg-green-gradient text-white">
          <b>Choose an option</b>
        </DialogTitle>
        <List>
          {options
            ? options.map((option, index) => {
                const IconComponent = numberToIcon[option.icon]; // Use the icon from the option directly
                return (
                  <StyledListItem
                    button
                    key={index}
                    onClick={() => handleNavigate(option.navigateTo)}
                    className="border mt-1"
                  >
                    <Row>
                      <Col>{IconComponent ? <IconComponent /> : ""}</Col>
                      <Col style={{ whiteSpace: "nowrap" }}>{option.label}</Col>
                    </Row>
                  </StyledListItem>
                );
              })
            : ""}
        </List>
      </StyledDialog>
    </ThemeProvider>
  );
};

export default PopupDialog;
