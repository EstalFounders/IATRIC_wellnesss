// src/store/slices/bookingWebsite/globalDataSlice.js
// Single source of truth for website-wide "services" (categoryType MAJOR) and
// "speciality" (categoryType SUB) lists, fed from the serviceOffered API.
import { createSlice } from "@reduxjs/toolkit";
import { serviceCategoryType } from "../../../constant";
import { isLabService } from "../../../customUtils/serviceKeys";

const initialState = {
  services: [],
  speciality: [],
};

// The lab service exists twice in servicesoffereds today (the active MAJOR rows
// "Labtest" and "Lab Investigation"), which made it render twice everywhere:
// both mega-menu columns, the homepage marquee and the mobile drawer (where the
// two rows even collided on the same React key). Keep the first row only, so one
// lab entry survives in its original position - the left Quick Links column.
const collapseLabDuplicates = (items) => {
  let labSeen = false;

  return items.filter((item) => {
    if (!isLabService(item.name || item.title || item.service)) return true;
    if (labSeen) return false;
    labSeen = true;
    return true;
  });
};

// Split the raw serviceOffered payload into the two website lists.
// Missing categoryType falls back to the model default (MAJOR).
const splitByCategory = (payload) => {
  const active = collapseLabDuplicates(
    (Array.isArray(payload) ? payload : []).filter(
      (item) => item && item.isActive !== false
    )
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
