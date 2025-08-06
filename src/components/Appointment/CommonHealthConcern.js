import React, { useRef } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { healthConcerns } from "../../../data/HealthConcern";
import { ConsultationButton } from "../Common/commonUi";

const CommonHealthConcerns = () => {
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - clientWidth
            : scrollLeft + clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 8 }, py: { xs: 4, sm: 6 } }}>
      <Typography
        variant="h4"
        fontWeight={600}
        gutterBottom
        textAlign={{ xs: "center", sm: "left" }}
      >
        Common Health Concerns
      </Typography>

      <Typography
        variant="subtitle1"
        color="text.secondary"
        mb={3}
        textAlign={{ xs: "center", sm: "left" }}
      >
        Consult a doctor online for any health issue
      </Typography>

      <Box sx={{ position: "relative" }}>
        {/* Left Arrow */}
        {!isSmallScreen && (
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              bgcolor: "white",
              boxShadow: 2,
              marginLeft: '2px'
            }}
          >
            <ArrowBackIos />
          </IconButton>
        )}

        {/* Scrollable List */}
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollBehavior: "smooth",
            gap: 2,
            pb: 1,
            px: isSmallScreen ? 0 : 4,
            scrollbarWidth: "none", // hide for Firefox
            "&::-webkit-scrollbar": { display: "none" }, // hide for Chrome
          }}
        >
          {healthConcerns.map((item, index) => (
            <Card
              key={index}
              sx={{
                minWidth: { xs: 240, sm: 260 },
                maxWidth: 280,
                flex: "0 0 auto",
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                height="160"
                image={item.image}
                alt={item.title}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  ₹ {item.price}
                </Typography>
                <ConsultationButton>Consult Now</ConsultationButton>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Right Arrow */}
        {!isSmallScreen && (
          <IconButton
            onClick={() => scroll("right")}
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              bgcolor: "white",
              boxShadow: 2,
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default CommonHealthConcerns;
