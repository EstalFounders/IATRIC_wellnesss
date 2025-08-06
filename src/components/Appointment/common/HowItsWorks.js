import React from "react";
import { Box, Typography, Grid, Avatar } from "@mui/material";
import {
  TouchApp,
  ChatBubbleOutline,
  LocalPharmacy,
} from "@mui/icons-material";

const steps = [
  {
    icon: <TouchApp fontSize="large" />,
    label: "Select a speciality or symptom",
  },
  {
    icon: <ChatBubbleOutline fontSize="large" />,
    label: "Audio/ video call with a verified doctor",
  },
  {
    icon: <LocalPharmacy fontSize="large" />,
    label: "Get a digital prescription & a free follow-up",
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ textAlign: "center", py: 6, px: 2}}>
      <Typography variant="h4" fontWeight={600} mb={5}>
        How it works
      </Typography>

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={3}
        sx={{ position: "relative", maxWidth: 1000 }}
      >
        {steps.map((step, index) => (
          <Grid
            item
            xs={12}
            sm={4}
            key={index}
            sx={{ position: "relative", textAlign: "center" }}
          >
            <Avatar
              sx={{
                bgcolor: "#f4f2fa",
                width: 80,
                height: 80,
                margin: "0 auto",
                mb: 2,
              }}
            >
              {step.icon}
            </Avatar>
            <Typography variant="body1">{step.label}</Typography>

            {/* Connecting lines */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50px",
                  right: "-50%",
                  width: "100%",
                  height: "2px",
                  bgcolor: "#e0e0e0",
                  zIndex: -1,
                  display: { xs: "none", sm: "block" },
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HowItWorks;
