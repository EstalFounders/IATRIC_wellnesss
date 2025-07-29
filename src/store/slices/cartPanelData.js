import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lab_test_cart_details: [],
  medicine_cart_details: [],
};

const cartPanelData = createSlice({
  name: "Cart Panel",
  initialState,
  reducers: {
    // Add to lab_test_cart_details array
    setLabTestCartDetails: (state, action) => {
      const newItem = action.payload;
      const exists = state.lab_test_cart_details.some(
        (item) => item._id === newItem._id
      );
      if (!exists) {
        state.lab_test_cart_details.push(newItem);
      } else {
        // Optional: Replace if exists
        state.lab_test_cart_details = state.lab_test_cart_details.map((item) =>
          item._id === newItem._id ? newItem : item
        );
      }
    },

    // Add to medicine_cart_details array
    setMedicineCartDetails: (state, action) => {
      const newItem = action.payload;
      const exists = state.medicine_cart_details.some(
        (item) => item._id === newItem._id
      );
      if (!exists) {
        state.medicine_cart_details.push(newItem);
      } else {
        // Optional: Replace if exists
        state.medicine_cart_details = state.medicine_cart_details.map((item) =>
          item._id === newItem._id ? newItem : item
        );
      }
    },
  },
});

export const { setLabTestCartDetails, setMedicineCartDetails } =
  cartPanelData.actions;

export default cartPanelData.reducer;
