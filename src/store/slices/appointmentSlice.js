// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  todaysAppointments: []
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
  },
});

// Export actions
export const { setAppointments, setTodaysAppointments } = appointmentSlice.actions;

// Export reducer
export default appointmentSlice.reducer;
