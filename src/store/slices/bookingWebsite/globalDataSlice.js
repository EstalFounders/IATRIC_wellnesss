// src/store/slices/bookingWebsite/globalDataSlice.js
// Single source of truth for website-wide "services" (categoryType MAJOR) and
// "speciality" (categoryType SUB) lists, fed from the serviceOffered API.
import { createSlice } from "@reduxjs/toolkit";
import { serviceCategoryType } from "../../../constant";

const initialState = {
  services: [],
  speciality: [],
};

// Split the raw serviceOffered payload into the two website lists.
// Missing categoryType falls back to the model default (MAJOR).
const splitByCategory = (payload) => {
  const active = (Array.isArray(payload) ? payload : []).filter(
    (item) => item && item.isActive !== false
  );

  return {
    services: active.filter(
      (item) =>
        (item.categoryType || serviceCategoryType.MAJOR) ===
        serviceCategoryType.MAJOR
    ),
    speciality: active.filter(
      (item) => item.categoryType === serviceCategoryType.SUB
    ),
  };
};

const globalDataSlice = createSlice({
  name: "globalData",
  initialState,
  reducers: {
    setServiceOfferedData: (state, action) => {
      const { services, speciality } = splitByCategory(action.payload);
      state.services = services;
      state.speciality = speciality;
    },
    setServices: (state, action) => {
      state.services = action.payload;
    },
    setSpeciality: (state, action) => {
      state.speciality = action.payload;
    },
    resetGlobalData: (state) => {
      state.services = [];
      state.speciality = [];
    },
  },
});

// Export actions
export const {
  setServiceOfferedData,
  setServices,
  setSpeciality,
  resetGlobalData,
} = globalDataSlice.actions;

// Export reducer
export default globalDataSlice.reducer;
