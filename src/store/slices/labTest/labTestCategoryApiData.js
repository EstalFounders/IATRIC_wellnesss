// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allTestDetails: [],
  healthTestData: ""
};

const labTestCateogryDataSlice = createSlice({
  name: "lab-test-details",
  initialState,
  reducers: {
    setAllTestDetails: (state, action) => {
      state.allTestDetails = action.payload;
    },
    setHealthTestData: (state, action) => {
      state.healthTestData = action.payload;
    }
  },
});

// Export actions
export const { setAllTestDetails, setHealthTestData } = labTestCateogryDataSlice.actions;

// Export reducer
export default labTestCateogryDataSlice.reducer;
