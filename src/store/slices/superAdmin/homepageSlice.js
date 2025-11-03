// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allAppointments: [],
  labTest: [],
  allDoctors: [],
  allLab:[],
  serviceOffered: [],
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
    setAllLab: (state, action) => {
      state.allLab = action.payload;
    },
    setServiceOffered: (state, action) => {
      state.serviceOffered = action.payload;
    },
  },
});

// Export actions
export const { setAllappointments,setAllLabTest, setAllDoctor, setAllLab,setServiceOffered } = homepageSlice.actions;

// Export reducer
export default homepageSlice.reducer;
