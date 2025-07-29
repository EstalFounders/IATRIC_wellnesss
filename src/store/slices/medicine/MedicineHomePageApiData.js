// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allMedicineDetails: [],
};

const medicineHomePageApiDataSlice = createSlice({
  name: "medicine-data",
  initialState,
  reducers: {
    setAllMedicineDetails: (state, action) => {
      state.allMedicineDetails = action.payload;
    },
  },
});

// Export actions
export const { setAllMedicineDetails } = medicineHomePageApiDataSlice.actions;

// Export reducer
export default medicineHomePageApiDataSlice.reducer;
