// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allTestDetails: [],
  allCheckUpDetails: [],
  viewCheckups: [],
  categoryDetails: [],
};

const labTestCateogryDataSlice = createSlice({
  name: "lab-test-details",
  initialState,
  reducers: {
    setAllTestDetails: (state, action) => {
      state.allTestDetails = action.payload;
    },
    setHealthTestData: (state, action) => {
      state.allCheckUpDetails = action.payload;
    },
    setViewCheckupsData: (state, action) => {
      state.viewCheckups = action.payload;
    },
    setCategoryDetails: (state, action) => {
      state.categoryDetails = action.payload;
    },
  },
});

// Export actions
export const {
  setAllTestDetails,
  setHealthTestData,
  setViewCheckupsData,
  setCategoryDetails,
} = labTestCateogryDataSlice.actions;

// Export reducer
export default labTestCateogryDataSlice.reducer;
