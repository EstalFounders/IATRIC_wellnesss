import React from "react";
import { Box, Typography, Grid, Paper, Container } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const benefits = [
  {
    icon: <LocalHospitalIcon fontSize="large" />,
    title: "Access to Experts",
    description: "Connect with top specialists from the comfort of your home.",
  },
  {
    icon: <VerifiedUserIcon fontSize="large" />,
    title: "Verified Doctors",
    description: "All our doctors are certified and verified for quality care.",
  },
  {
    icon: <AccessTimeIcon fontSize="large" />,
    title: "24/7 Availability",
    description: "Book appointments anytime, including nights and weekends.",
  },
];

const BenefitSection = () => {
  return (
    <div className="wide-100">
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Why Choose Us?
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {benefits.map((benefit, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: "center", borderRadius: 3 }}
            >
              <Box sx={{ color: "#3b5f1d", mb: 2 }}>{benefit.icon}</Box>
              <Typography variant="h6">{benefit.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {benefit.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
    </div>
  );
  
};

export default BenefitSection;
