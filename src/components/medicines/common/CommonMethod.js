import { useState } from "react";
import {
  eventEmitter,
  medicine_cart_details_local_info,
} from "../../../constant";
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";

export const useAddToCart = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleAddToCart = (item) => {
    cartEventEmitter.emit(eventEmitter.medicineCartEventEmitter, item);
    setSnackbarOpen(true);
    setIsClicked(true);

    setTimeout(() => {
      setIsClicked(false);
    }, 100);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false); // Close Snackbar
  };

  return { snackbarOpen, isClicked, handleAddToCart, handleSnackbarClose };
};

export const calculateTotalPrice = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + parseFloat(item.price);
  }, 0);
};

export const getMedicineCartItems = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(medicine_cart_details_local_info);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
    return [];
  }
};

export const setMedicineCartItems = (items) => {
  try {
    localStorage.setItem(
      medicine_cart_details_local_info,
      JSON.stringify(items)
    );
  } catch (error) {
    console.error("Failed to save cart to localStorage", error);
  }
};
