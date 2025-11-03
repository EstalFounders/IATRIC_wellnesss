// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeConsultation: "",
};

const otherConfigSlice = createSlice({
  name: "other_config",
  initialState,
  reducers: {
    setActiveConsultation: (state, action) => {
      state.activeConsultation = action.payload;
    },
  },
});

// Export actions
export const { setActiveConsultation } = otherConfigSlice.actions;

// Export reducer
export default otherConfigSlice.reducer;
