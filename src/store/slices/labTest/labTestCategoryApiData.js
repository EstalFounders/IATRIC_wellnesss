// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mostPopularCheckup: [],
};

const labTestCateogryDataSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setMostPopularCheckUp: (state, action) => {
      state.mostPopularCheckup = action.payload;
    },
  },
});

// Export actions
export const { setMostPopularCheckUp } = labTestCateogryDataSlice.actions;

// Export reducer
export default labTestCateogryDataSlice.reducer;
