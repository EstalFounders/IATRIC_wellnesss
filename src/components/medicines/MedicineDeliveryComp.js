import React, { useState, useEffect, useCallback } from "react";
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
import { useRouter } from "next/router";
import { color_schema } from "../../constant";
import { useAddToCart } from "./common/CommonMethod";
import { setMedicineDetail } from "../../store/slices/medicine/MedicineHomePageApiData";
import { useDispatch } from "react-redux";
import FaqSection from "../Common/FaqSection";
import { getFaqsForTopic } from "../../../data/faqs";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ITEMS_PER_PAGE = 25;
const SEARCH_DEBOUNCE_MS = 300;

const MedicineDeliveryComp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedAlphabet, setSelectedAlphabet] = useState("A");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // FAQs for medicine delivery only - the group data/faqs.js defines for it.
  const medicineFaqs = getFaqsForTopic("medicine-delivery");

  const { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose } =
    useAddToCart();

  // Server side filtering + paging. The API used to ignore the `alphabet` param,
  // so every letter click downloaded the whole catalogue (27k documents / ~6 MB)
  // and this component paginated that array in the browser.
  const fetchMedicines = useCallback(async (alphabet, currentPage, term) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/medicineInfo`, {
        params: {
          // A typed term searches the whole catalogue, otherwise the letter tab
          // narrows it down.
          alphabet: term ? undefined : alphabet,
          search: term || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });
      setMedicines(res.data?.medicines || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
      setError("Failed to fetch medicines. Please try again.");
      setMedicines([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search box so typing does not fire one request per keystroke.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMedicines(selectedAlphabet, page, debouncedSearch);
  }, [fetchMedicines, selectedAlphabet, page, debouncedSearch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleAlphabetClick = (letter) => {
    setSelectedAlphabet(letter);
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handlePageChange = (_, value) => {
    setPage(value);
  };

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
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && medicines.length === 0 && (
        <Typography sx={{ mt: 3, textAlign: "center" }}>
          No medicines found.
        </Typography>
      )}
      {!loading && (
        <Grid container spacing={3}>
          {medicines.map((medicine) => (
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
      )}
      {loading && (
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
