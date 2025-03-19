// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allDoctors: [],
};

const allDoctorsPageSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAllDoctors: (state, action) => {
      state.allDoctors = action.payload;
    },
  },
});

// Export actions
export const { setAllDoctors } = allDoctorsPageSlice.actions;

// Export reducer
export default allDoctorsPageSlice.reducer;
