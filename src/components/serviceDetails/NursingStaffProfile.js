// NursingStaffProfile.js
// Dynamic "View Profile" page for a single nursing staff member. Fetches the
// member by id from /api/staff?id=<id> and renders their full details.
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { api, color_schema } from "../../constant";

const NursingStaffProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError("");
    fetch(`${api.staff}?id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) setMember(data.staff);
        else setError(data.error || "Staff member not found");
      })
      .catch(() => {
        if (active) setError("Failed to load the profile. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading || !id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: color_schema.green }} />
      </Box>
    );
  }

  if (error || !member) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error || "Staff member not found."}
        </Alert>
        <Button variant="outlined" onClick={() => router.back()}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
        <Grid container>
          <Grid item xs={12} md={4}>
            {member.profilePictureUrl ? (
              <Box sx={{ position: "relative", height: "100%", minHeight: 320 }}>
                <Image
                  src={member.profilePictureUrl}
                  alt={member.name}
                  fill
                  sizes="(max-width: 899px) 100vw, 400px"
                  style={{ objectFit: "cover" }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#eaf5e0",
                }}
              >
                <Typography
                  variant="h1"
                  sx={{ color: color_schema.green, fontWeight: 700 }}
                >
                  {member.name?.charAt(0)?.toUpperCase() || "N"}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: color_schema.green }}
              >
                {member.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                {member.jobTitle}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Bio
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {member.bio || "Not provided"}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Experience
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {member.experience || "Not provided"}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Education
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {member.education || "Not provided"}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{ color: color_schema.green, borderColor: color_schema.green }}
              >
                Back to Nursing Care
              </Button>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default NursingStaffProfile;
