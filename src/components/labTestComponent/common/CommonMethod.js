import { HiArrowCircleRight } from "react-icons/hi";
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import { useState } from "react";
import MoreModalComp from "../modal/MoreButtonModel";

export const MoreButton = ({healthCheckupData}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
    <div style={{ color: "#4B82CB" }} className="btn ml-5 mb-5 font-weight-bold" onClick={handleOpenModal}>
      More <HiArrowCircleRight color="#4B82CB" />
    </div>
    {isModalOpen && <MoreModalComp onClose={handleCloseModal} healthCheckupData={healthCheckupData} />}
    </div>
  );
};

export const calculateTotalPrice = (cartItems) => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.healthCheckupData.price);
    }, 0);
  };
  

export const useAddToCart = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleAddToCart = (item) => {
    cartEventEmitter.emit("cartUpdate", item);
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

export const calculateParameters = (testIncluded) => {
  let parameter_count = 0;
  // Loop through each item in the testIncluded array
  for (let i = 0; i < testIncluded.length; i++) {
    parameter_count += testIncluded[i].parameters.length;
  }

  return parameter_count;
};

export const storeHealthCheckupData = (data) => {
    // Clear existing healthCheckupData from localStorage
    localStorage.removeItem('healthCheckupData');
    // Store new data
    localStorage.setItem('healthCheckupData', JSON.stringify([data]));
  }
  

export const getHealthCheckupData = () => {
    const data = JSON.parse(localStorage.getItem('healthCheckupData')) || [];
  return data;
}

export const formatPreparationRequired = (preparationArray) => {
    return preparationArray ? preparationArray.join(' , '):""
  };
