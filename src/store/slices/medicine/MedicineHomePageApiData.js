// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allMedicineDetails: [],
  medicineDetail: "",
};

const medicineHomePageApiDataSlice = createSlice({
  name: "medicine-data",
  initialState,
  reducers: {
    setAllMedicineDetails: (state, action) => {
      state.allMedicineDetails = action.payload;
    },
    setMedicineDetail: (state, action) => {
      state.medicineDetail = action.payload;
    },
  },
});

// Export actions
export const { setAllMedicineDetails, setMedicineDetail } =
  medicineHomePageApiDataSlice.actions;

// Export reducer
export default medicineHomePageApiDataSlice.reducer;
