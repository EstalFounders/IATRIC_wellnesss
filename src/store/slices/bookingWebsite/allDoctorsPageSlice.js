// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allDoctors: [],
  doctorInfo: null,
  serviceTypes: [],
};

const allDoctorsPageSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setAllDoctors: (state, action) => {
      state.allDoctors = action.payload;
    },
    setDoctorInfo: (state, action) => {
      state.doctorInfo = action.payload;
    },
    setServiceTypes: () => {
      state.serviceTypes = action.payload;
    },
  },
});

// Export actions
export const { setAllDoctors, setDoctorInfo } = allDoctorsPageSlice.actions;

// Export reducer
export default allDoctorsPageSlice.reducer;
