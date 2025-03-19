// store/slices/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userDetails: "",
};

const userDetailsPageSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
  },
});

// Export actions
export const { setUserDetails } = userDetailsPageSlice.actions;

// Export reducer
export default userDetailsPageSlice.reducer;
