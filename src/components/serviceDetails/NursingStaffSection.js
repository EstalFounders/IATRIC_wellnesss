// NursingStaffSection.js
// "Our Nursing Staff" section rendered on the nursing-care service page. Fetches
// the staff list from /api/staff and shows one card per member (photo, name,
// role) linking to the dynamic /nursing-staff/[id] profile page.
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { api, color_schema, imageBlurDataUrl } from "../../constant";

const NursingStaffSection = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(api.staff)
      .then((res) => res.json())
      .then((data) => {
        if (active) setStaff(Array.isArray(data.staff) ? data.staff : []);
      })
      .catch((err) => console.error("Failed to fetch nursing staff:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: color_schema.green }} />
      </Box>
    );
  }

  if (!staff.length) return null;

  return (
    <Box component="section" sx={{ mt: 6 }}>
      <Typography
        variant="h4"
        component="h2"
        align="center"
        gutterBottom
        sx={{ fontWeight: 700, color: color_schema.green }}
      >
        Our Nursing Staff
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ maxWidth: 720, mx: "auto", mb: 4 }}
      >
        Meet our certified nurses - trained for in-home and in-clinic nursing
        care across Gurgaon.
      </Typography>

      <Grid container spacing={3}>
        {staff.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {member.profilePictureUrl ? (
                <Box sx={{ position: "relative", height: 220, flexShrink: 0 }}>
                  <Image
                    placeholder="blur"
                    blurDataURL={imageBlurDataUrl}
                    src={member.profilePictureUrl}
                    alt={member.name}
                    fill
                    sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 360px"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#eaf5e0",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{ color: color_schema.green, fontWeight: 700 }}
                  >
                    {member.name?.charAt(0)?.toUpperCase() || "N"}
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.jobTitle}
                </Typography>
                <Link
                  href={`/nursing-staff/${member._id}`}
                  passHref
                  legacyBehavior
                >
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{
                      display: "inline-block",
                      mt: 1.5,
                      fontWeight: 600,
                      color: color_schema.green,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    View Profile
                  </Typography>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NursingStaffSection;
