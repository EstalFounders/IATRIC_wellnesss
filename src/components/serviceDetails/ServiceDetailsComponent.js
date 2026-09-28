import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
} from "@mui/material";
import IconRenderer from "./IconRenderer"; // adjust path as needed
import { callToBook, color_schema } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import CalltoBookPopup from "../Common/CalltoBookPopup";
import {
  getServiceDescription,
  resolveServiceKey,
  resolveServiceName,
} from "../../customUtils/serviceLinks";

const serviceDetails = {
  consultation: {
    seoTitle: "Expert Medical Consultation | Online & In-Clinic | HealthPath",
    seoDescription:
      "Book instant audio/video consultations or in-clinic visits with top-rated physicians. Trusted care from HealthPath.",
    online: [
      {
        name: "Audio",
        iconKey: "audio",
        description:
          "Consult with a certified doctor over a phone call for instant medical advice from anywhere.",
      },
      {
        name: "Video",
        iconKey: "video",
        description:
          "Face-to-face video consultations with experienced professionals at your convenience.",
      },
    ],
    offline: [
      {
        name: "In Clinic",
        iconKey: "in clinic",
        description:
          "Visit top-rated clinics near you for personalized in-person medical care and diagnosis.",
      },
      {
        name: "Home Visit",
        iconKey: "home visit",
        description:
          "Doctors visit your home for personalized care without needing to step out.",
      },
    ],
  },
  "nursing-services": {
    seoTitle: "Home & In-Clinic Nursing Services | GDA Support | HealthPath",
    seoDescription:
      "Compassionate nursing services including home visits, clinic support, and GDA care. Delivered by certified professionals.",
    offline: [
      {
        name: "Home Visit",
        iconKey: "home visit",
        description:
          "Qualified nurses provide care in the comfort of your home.",
      },
      {
        name: "In Clinic Visit",
        iconKey: "clinic visit",
        description: "Clinic-based nursing support for medical procedures.",
      },
      {
        name: "GDA Services",
        iconKey: "gda services",
        description:
          "General Duty Assistant services for patient mobility, hygiene, and daily support tasks.",
      },
    ],
  },
  "lab-test": {
    seoTitle: "Home Lab Sample Collection & Testing | HealthPath",
    seoDescription:
      "Convenient home sample collection and lab testing services. Accurate results, certified labs, trusted healthcare.",
    offline: [
      {
        name: "Home Sample Collection",
        iconKey: "home sample",
        description:
          "Phlebotomists collect lab samples from your home. Hassle-free and hygienic.",
      },
      {
        name: "Test In Lab",
        iconKey: "lab test",
        description:
          "Visit certified labs for reliable diagnostic testing services.",
      },
    ],
  },
  "medicine-delivery": {
    seoTitle: "Medicine Delivery & HomeCare Equipment | HealthPath",
    seoDescription:
      "Reliable medicine delivery, home care support, and medical equipment for patients and families. Fast & safe.",
    offline: [
      {
        name: "At Home",
        iconKey: "medicine at home",
        description:
          "Prescription medicines delivered directly to your doorstep.",
      },
      {
        name: "For Home Care",
        iconKey: "home care",
        description:
          "Essential supplies for home caregiving including support aids and hygiene kits.",
      },
      {
        name: "HomeCare Equipment",
        iconKey: "equipment",
        description:
          "Wheelchairs, beds, oxygen concentrators, and more available for rent or purchase.",
      },
    ],
  },
  "community-care": {
    seoTitle: "Corporate & Community Healthcare Programs | HealthPath",
    seoDescription:
      "Health camps, medical rooms, training sessions, and audits for large groups and organizations. Scalable wellness.",
    offline: [
      {
        name: "Medical Rooms OHL",
        iconKey: "medical room",
        description:
          "Onsite health lounges for continuous workplace medical support.",
      },
      {
        name: "Equipment Calibrator",
        iconKey: "equipment calibrator",
        description:
          "Ensure medical equipment accuracy with professional calibration services.",
      },
      {
        name: "Bulk Medicine",
        iconKey: "bulk medicine",
        description:
          "Affordable bulk medicine supplies for organizations or camps.",
      },
      {
        name: "Health Camp",
        iconKey: "health camp",
        description:
          "Organized healthcare checkup camps for communities or corporates.",
      },
      {
        name: "Task Show",
        iconKey: "task show",
        description:
          "Health awareness activities conducted through live task demonstrations.",
      },
      {
        name: "Session",
        iconKey: "session",
        description: "Interactive wellness sessions hosted by experts.",
      },
      {
        name: "Training",
        iconKey: "training",
        description:
          "Staff training in first aid, CPR, hygiene, and basic health support.",
      },
      {
        name: "Audits",
        iconKey: "audits",
        description: "Health safety audits to ensure compliance and readiness.",
      },
    ],
  },
};

const ServiceDetail = () => {
  const router = useRouter();
  const [isCalltoBookDialog, setIsCalltoBookDialog] = useState(false);

  // Display name for the heading (clean name, never a raw slug/id) and the key
  // for the rich content blocks in `serviceDetails`.
  const serviceName = resolveServiceName(router.query);
  const serviceKey = resolveServiceKey(router.query);

  const medical_service = serviceDetails[serviceKey];

  const handleOpenCalltoBookDialog = (serviceName) => {
    setIsCalltoBookDialog(true);
  };
  const handleCloseCalltoBookDialog = () => {
    setIsCalltoBookDialog(false);
  };

  const handleCalltoBookPopupSubmit = (mobNo) => {
    setMobNo(mobNo);
    setOtpConfirmationPopup(true);
  };

  if (!medical_service) {
    // No dedicated content block for this service: show the clean service name
    // and a booking CTA instead of a dead end.
    const fallbackTitle = serviceName
      ? `${serviceName} | HealthPath`
      : "Our Services | HealthPath";

    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Head>
          <title>{fallbackTitle}</title>
          <meta
            name="description"
            content={
              serviceName
                ? `Book ${serviceName} services with HealthPath - online consultation, home visits and clinic care.`
                : "Explore the services offered by HealthPath and book a consultation."
            }
          />
        </Head>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {serviceName || "Our Services"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {getServiceDescription(serviceName) ||
            "Choose how you would like to consult and our team will confirm the next available slot."}
        </Typography>

        <ConsultationButton path={"/appointment"}>{callToBook}</ConsultationButton>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{medical_service.seoTitle}</title>
        <meta name="description" content={medical_service.seoDescription} />
      </Head>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {serviceName || medical_service.seoTitle}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {getServiceDescription(serviceName) || medical_service.seoDescription}
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Online Services */}
          {medical_service.online && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Online Services
                </Typography>
              </Grid>
              {medical_service.online.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%", // Make card take full available height
                      justifyContent: "space-between", // Push button to bottom if added later
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow: 3,
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-4px) scale(1.02)",
                        backgroundColor: "#eaf5e0ff",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start", // Keep icon + text aligned at top
                        flexGrow: 1, // Make content stretch
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          padding: 1,
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          border: `1px solid ${color_schema.green}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconRenderer name={item.iconKey} size={28} />
                      </Box>
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexGrow: 1 }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </CardContent>
                    <div>
                      <ConsultationButton
                        onClick={() => handleOpenCalltoBookDialog(item.name)}
                      >
                        {callToBook}
                      </ConsultationButton>
                    </div>
                  </Card>
                </Grid>
              ))}
            </>
          )}

          {/* Offline Services */}
          {medical_service.offline && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Offline Services
                </Typography>
              </Grid>
              {medical_service.offline.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%", // Make card take full available height
                      justifyContent: "space-between", // Push button to bottom if added later
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow: 3,
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-4px) scale(1.02)",
                        backgroundColor: "#eaf5e0ff",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start", // Keep icon + text aligned at top
                        flexGrow: 1, // Make content stretch
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          padding: 1,
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          border: `1px solid ${color_schema.green}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconRenderer name={item.iconKey} size={28} />
                      </Box>
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexGrow: 1 }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </CardContent>
                    <div>
                      <ConsultationButton
                        onClick={() => handleOpenCalltoBookDialog(item.name)}
                      >
                        {callToBook}
                      </ConsultationButton>
                    </div>
                  </Card>
                </Grid>
              ))}
            </>
          )}
        </Grid>
        <CalltoBookPopup
          show={isCalltoBookDialog}
          onClose={handleCloseCalltoBookDialog}
          onSubmit={handleCalltoBookPopupSubmit}
        />
      </Container>
    </>
  );
};
export default ServiceDetail;
