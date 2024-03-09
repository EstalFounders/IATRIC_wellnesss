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
import { FaWhatsapp, FaWpforms } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";

const StyledDialog = styled(Dialog)`
  min-width: 300px;
`;

const StyledListItem = styled(ListItem)`
  &:hover {
    background-color: ${({ theme }) => "#3b5f1d"};
  }
`;

const PopupDialog = ({ isOpen, onClose, options }) => {
  const theme = useTheme();
  const numberToIcon = {
    0: FiPhoneCall,
    1: FaWhatsapp,
    2: FaWpforms,
    // Add more mappings as needed
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledDialog open={isOpen} onClose={onClose}>
        <DialogTitle style={{ backgroundColor: "#8e8333" }}>
          <b>Choose an option</b>
        </DialogTitle>
        <List>
          {options.map((option, index) => {
            const IconComponent = numberToIcon[index];
            return (
              <StyledListItem
                button
                key={index}
                onClick={() => option.action()}
                className="border mt-1"
              >
                <Row>
                  <Col>
                    <IconComponent />
                  </Col>
                  <Col>{option.label}</Col>
                </Row>
              </StyledListItem>
            );
          })}
        </List>
      </StyledDialog>
    </ThemeProvider>
  );
};

export default PopupDialog;
