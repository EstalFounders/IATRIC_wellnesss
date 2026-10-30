// store/slices/superAdmin/homepageSlice.js
// Panel-side lists for the super-admin dashboard. The doctor roster is NOT here:
// it has one home - store/slices/bookingWebsite/allDoctorsPageSlice.js - and is
// read everywhere through `useDoctors` (src/customUtils/useDoctors.js).
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allAppointments: [],
  labTest: [],
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
    setAllLab: (state, action) => {
      state.allLab = action.payload;
    },
    setServiceOffered: (state, action) => {
      state.serviceOffered = action.payload;
    },
  },
});

// Export actions
export const { setAllappointments,setAllLabTest, setAllLab,setServiceOffered } = homepageSlice.actions;

// Export reducer
export default homepageSlice.reducer;
