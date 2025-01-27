// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allAppointments: [],
  labTest: [],
  allDoctors: []
};

const homepageSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAllappointments: (state, action) => {
      state.allAppointments = action.payload;
    },
    setAllLabTest: (state, action) => {
      state.labTest = action.payload;
    },
    setAllDoctor: (state, action) => {
      state.allDoctors = action.payload;
    },
  },
});

// Export actions
export const { setAllappointments,setAllLabTest, setAllDoctor } = homepageSlice.actions;

// Export reducer
export default homepageSlice.reducer;
