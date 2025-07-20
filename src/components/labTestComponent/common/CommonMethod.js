import { HiArrowCircleRight } from "react-icons/hi";
import cartEventEmitter from "../../../eventEmitter/CartEventEmitter";
import { useRef, useState } from "react";
import styles from "../css/FirstSection.module.css";
import { color_schema, eventEmitter } from "../../../constant";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setViewCheckupsData } from "../../../store/slices/labTest/labTestCategoryApiData";
import React from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";



import { isValidObjectId } from "mongoose";

export const MoreButton = ({ viewCheckupData, category }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <div>
      <div
        className={`px-4 labtest-btn`}
        onClick={() =>
          handleCheckupCateogry(dispatch, router, viewCheckupData, category)
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="d-flex flex-direction-row h6 mt-2">
          <div>More</div>
          <div className="ml-2">
            <HiArrowCircleRight
              color={isHovered ? color_schema.white : color_schema.black}
            />
          </div>
        </div>
      </div>
      {/* {isModalOpen && (
        <MoreModalComp
          onClose={handleCloseModal}
          healthCheckupData={healthCheckupData}
        />
      )} */}
    </div>
  );
};

export const handleCheckupCateogry = (
  dispatch,
  router,
  viewCheckupData,
  category
) => {
  dispatch(setViewCheckupsData(viewCheckupData));
  router.push({
    pathname: "/labTest/viewCheckups",
    query: { category: category },
  });
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
    cartEventEmitter.emit(eventEmitter.cartEventEmitter, item);
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
  if (testIncluded) {
    for (let i = 0; i < testIncluded.length; i++) {
      parameter_count += testIncluded[i].parameters.length;
    }
    return parameter_count;
  }
  return 0;
};

export const storeHealthCheckupData = (data) => {
  // Clear existing healthCheckupData from localStorage
  localStorage.removeItem("healthCheckupData");
  // Store new data
  sessionStorage.setItem("healthCheckupData", JSON.stringify([data]));
};

export const getHealthCheckupData = () => {
  const data = JSON.parse(sessionStorage.getItem("healthCheckupData")) || [];
  return data;
};

export const storeLabTestCategory = (data) => {
  // Clear existing healthCheckupData from localStorage
  sessionStorage.removeItem("labCategory");
  // Store new data
  sessionStorage.setItem("labCategory", JSON.stringify([data]));
};

export const getLabTestCategory = () => {
  const data = JSON.parse(sessionStorage.getItem("labCategory")) || [];
  return data;
};

export const formatPreparationRequired = (preparationArray) => {
  return preparationArray ? preparationArray.join(" , ") : "";
};

export const getCategoryCheckup = (
  categoryText,
  healthCheckupData,
  categoryDetails
) => {
  let matchedCategoryId = null;

  // 1. First check which category (category_name) includes the categoryText from the argument
  //    and get the _id of the matched category.
  //    Normalize strings to ignore spacing for robust matching.
  const normalizedCategoryText = categoryText.replace(/\s/g, "").toLowerCase();

  for (const category of categoryDetails) {
    if (category.category_name) {
      // Ensure category_name exists
      const normalizedCategoryName = category.category_name
        .replace(/\s/g, "")
        .toLowerCase();
      if (normalizedCategoryName.includes(normalizedCategoryText)) {
        matchedCategoryId = category._id;
        break; // Found the category, no need to continue loop
      }
    }
  }

  // console.log(`Normalized Category Text: ${normalizedCategoryText}`);
  // console.log(`Matched Category ID: ${matchedCategoryId}`);
  console.log(matchedCategoryId, healthCheckupData, "data on 156 common mehod");
  // 3. Then collect all the healthcheckupdata which has that _id as category_id and return
  if (matchedCategoryId) {
    const filteredCheckups = healthCheckupData.filter(
      (checkup) =>
        checkup.category_id &&
        checkup.category_id.toString() === matchedCategoryId.toString()
    );

    return filteredCheckups;
  } else {
    // If no matching category was found, return an empty array
    console.warn(
      `No category found matching '${categoryText}'. Returning empty array.`
    );
    return [];
  }
};

export const filterActiveHealthTest = (data) => {
  return data.filter((item) => item.isActive === true);
};

export const calculateDiscountedPrice = (discount, price) => {
  // Convert inputs to numbers to ensure calculations are correct
  // Use parseFloat to handle potential decimal prices
  const originalPrice = parseFloat(price);
  const discountPercentage = parseFloat(discount);

  // Basic validation: Check if inputs are valid numbers
  if (isNaN(originalPrice) || isNaN(discountPercentage)) {
    console.error(
      "Invalid input for calculateDiscountedPrice: Price and Discount must be valid numbers."
    );
    return price; // Return Not-a-Number for invalid inputs
  }

  // Ensure discount percentage is within a sensible range (0-100)
  if (discountPercentage < 0 || discountPercentage > 100) {
    console.warn(
      "Discount percentage is outside the typical range (0-100). Calculation proceeds."
    );
    // You might choose to return NaN or throw an error here depending on strictness
  }

  // Calculate the discount amount
  const discountAmount = originalPrice * (discountPercentage / 100);

  // Calculate the final discounted price
  const discountedPrice = originalPrice - discountAmount;

  // Optional: Round to 2 decimal places for currency, if needed
  // return parseFloat(discountedPrice.toFixed(2));

  return discountedPrice;
};
