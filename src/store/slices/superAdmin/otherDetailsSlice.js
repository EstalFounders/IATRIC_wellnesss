// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 consultationType: []
};

const otherDetailsSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setConsultationType: (state, action) => {
      state.consultationType = action.payload;
    },
  },
});

// Export actions
export const { setConsultationType } = otherDetailsSlice.actions;

// Export reducer
export default otherDetailsSlice.reducer;
