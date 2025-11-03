// store/slices/appointmentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryDetails: "",
  articleDetails: "",
};

const UtilBlogDataSlice = createSlice({
  name: "lab-test-details",
  initialState,
  reducers: {
    setViewCategory: (state, action) => {
      state.categoryDetails = action.payload;
    },
    setViewArticle: (state, action) => {
      state.articleDetails = action.payload;
    },
  },
});

// Export actions
export const { setViewCategory, setViewArticle } = UtilBlogDataSlice.actions;

// Export reducer
export default UtilBlogDataSlice.reducer;
