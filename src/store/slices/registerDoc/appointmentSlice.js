// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  todaysAppointments: [],
  doctorEarnings: []
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    setTodaysAppointments: (state, action) => {
        state.todaysAppointments = action.payload;
      },
      setDoctorEarning: (state, action) => {
        state.doctorEarnings = action.payload;
      },
  },
});

// Export actions
export const { setAppointments, setTodaysAppointments, setDoctorEarning } = appointmentSlice.actions;

// Export reducer
export default appointmentSlice.reducer;
