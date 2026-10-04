import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Pagination,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FavoriteBorder,
  ShoppingCart,
} from "@mui/icons-material";
import axios from "axios";
import { color_schema } from "../../constant";
import { useAddToCart } from "./common/CommonMethod";
import { setMedicineDetail } from "../../store/slices/medicine/MedicineHomePageApiData";
import { useDispatch } from "react-redux";
import FaqSection from "../Common/FaqSection";
import { getFaqsForTopic } from "../../../data/faqs";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PAGE_LIMIT = 50;

const MedicineDeliveryComp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allAlphabetMedicines, setAllAlphabetMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedAlphabet, setSelectedAlphabet] = useState("A");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 25;
  const dispatch = useDispatch();

  // FAQs for medicine delivery only - the group data/faqs.js defines for it.
  const medicineFaqs = getFaqsForTopic("medicine-delivery");

  const { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose } =
    useAddToCart();

  const fetchMedicines = async (alphabet) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/medicineInfo`, {
        params: { alphabet }, // should return all medicines with this alphabet
      });
      const all = res.data.medicines || [];
      setAllAlphabetMedicines(all);
      setFilteredMedicines(all);
      setPage(1);
      setTotalPages(Math.ceil(all.length / itemsPerPage));
    } catch (error) {
      console.error("Failed to fetch medicines", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(selectedAlphabet);
  }, [selectedAlphabet]);

  useEffect(() => {
    const filtered = allAlphabetMedicines.filter((med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedicines(filtered);
    setPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, allAlphabetMedicines]);

  const handleAlphabetClick = (letter) => {
    setSelectedAlphabet(letter);
    setSearchTerm("");
  };

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const paginatedMedicines = filteredMedicines.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleViewDetails = (medicine) => {
    dispatch(setMedicineDetail(medicine));
    router.push("/medicine/viewDetails");
  };

  return (
    <Box sx={{ px: 4, py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
        Medicine Delivery
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        Search and order your medicines online. Home delivery available.
      </Typography>

      {/* Alphabet Filter */}
      <div className="d-flex justify-content-center">
        <Box sx={{ my: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {ALPHABETS.map((letter) => {
            const isSelected = letter === selectedAlphabet;
            return (
              <Button
                key={letter}
                variant="outlined"
                onClick={() => handleAlphabetClick(letter)}
                sx={{
                  minWidth: "36px",
                  padding: "6px 12px",
                  color: isSelected ? color_schema.white : color_schema.yellow,
                  backgroundColor: isSelected
                    ? color_schema.green
                    : "transparent",
                  borderBottom: `1px solid ${color_schema.green}`,
                  borderTop: "none",
                  borderRight: "none",
                  borderLeft: "none",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                    backgroundColor: color_schema.green,
                    color: color_schema.white,
                  },
                }}
              >
                {letter}
              </Button>
            );
          })}
        </Box>
      </div>

      {/* Search Field */}
      <TextField
        fullWidth
        placeholder="Search for medicine..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1 }} />,
        }}
        sx={{ mb: 3 }}
      />

      {/* Medicine List */}
      {!loading ? (
        <Grid container spacing={3}>
          {paginatedMedicines.map((medicine) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={medicine._id}
              onClick={() => handleViewDetails(medicine)}
            >
              <Card
                sx={{
                  height: "100%",
                  transition: "0.3s",
                  borderRadius: "30px",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                    border: `1px solid ${color_schema.green}`,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6">{medicine.name}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {medicine.description}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    ₹{medicine.price}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                  <IconButton>
                    <FavoriteBorder />
                  </IconButton>
                  <Button
                    sx={{
                      color: color_schema.green,
                      border: `1px solid ${color_schema.green}`,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-4px) scale(1.02)",
                        color: `${color_schema.white}`,
                        backgroundColor: `${color_schema.yellow}`,
                      },
                    }}
                    onClick={() => handleAddToCart({ medicine })}
                    endIcon={<ShoppingCart />}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ mt: 3 }}>Loading medicines...</Typography>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "transparent",
                color: color_schema.yellow,
                "&:hover": {
                  backgroundColor: color_schema.green,
                  color: color_schema.white,
                  borderColor: color_schema.green,
                },
              },
              "& .Mui-selected": {
                backgroundColor: color_schema.green,
                color: color_schema.white,
                borderColor: color_schema.green,
                "&:hover": {
                  backgroundColor: color_schema.green,
                  color: color_schema.white,
                },
              },
            }}
          />
        </Box>
      )}

      {/* Snackbar */}
      {snackbarOpen && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message="Item added to cart"
        />
      )}

      {/* FAQs for medicine delivery only - the same copy /faqs shows for it. */}
      {medicineFaqs ? (
        <Box sx={{ mt: 6 }}>
          <FaqSection
            items={medicineFaqs.items}
            title="Frequently Asked Questions"
            headingId="faq-medicine-delivery"
            seeAllHref={`/faqs#${medicineFaqs.anchor}`}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default MedicineDeliveryComp;
