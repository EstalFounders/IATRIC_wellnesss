// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  doctorUpdateRequest: [],
  doctorLeaveRequest: []
};

const notificationDataSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setDoctorUpdateRequest: (state, action) => {
      state.doctorUpdateRequest = action.payload;
    },
    setDoctorLeaveRequest: (state, action) => {
      state.doctorLeaveRequest = action.payload;
    },
  },
});

// Export actions
export const { setDoctorUpdateRequest, setDoctorLeaveRequest } = notificationDataSlice.actions;

// Export reducer
export default notificationDataSlice.reducer;
