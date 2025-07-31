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
import { useRouter } from "next/router";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PAGE_LIMIT = 50;

const MedicineDeliveryComp = () => {
  const router = useRouter();
  const query = router.query;

  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [selectedAlphabet, setSelectedAlphabet] = useState(query.alpha || "A");
  const [page, setPage] = useState(Number(query.page) || 1);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const { snackbarOpen, handleAddToCart, handleSnackbarClose } =
    useAddToCart();

  // Fetch data from backend
  const fetchMedicines = async (alphabet) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/medicineInfo`, {
        params: { alphabet, limit: 1000 }, // get all to client-filter
      });
      setMedicines(res.data.medicines);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(selectedAlphabet);
  }, [selectedAlphabet]);

  // Sync URL when state changes
  useEffect(() => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          alpha: selectedAlphabet,
          search: searchTerm || undefined,
          page,
        },
      },
      undefined,
      { shallow: true }
    );
  }, [selectedAlphabet, searchTerm, page]);

  // Filtered and paginated result
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) =>
      med.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  const totalPages = Math.ceil(filteredMedicines.length / PAGE_LIMIT);
  const paginatedMedicines = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filteredMedicines.slice(start, start + PAGE_LIMIT);
  }, [filteredMedicines, page]);

  const handleAlphabetClick = (letter) => {
    setSelectedAlphabet(letter);
    setSearchTerm("");
    setPage(1);
  };

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
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
            <Grid item xs={12} sm={6} md={4} key={medicine._id}>
              <Card
                sx={{
                  height: "100%",
                  transition: "0.3s",
                  borderRadius: "30px",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                    border: "1px solid #3b5f1d",
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
                      color: "#3b5f1d",
                      border: "1px solid #3b5f1d",
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
    </Box>
  );
};

export default MedicineDeliveryComp;
