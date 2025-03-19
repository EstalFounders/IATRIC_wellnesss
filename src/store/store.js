// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import appointmentReducer from "./slices/registerDoc/appointmentSlice";
import notificationDataSlice from "./slices/notificationSectionApiData";
import homepageSlice from "./slices/superAdmin/homepageSlice";
import labTestCateogryDataSlice from "./slices/labTest/labTestCategoryApiData";
import allDoctorsPageSlice from "./slices/bookingWebsite/allDoctorsPageSlice";
import userDetailsPageSlice from "./slices/authentication/userDetailsSlice";

const persistConfig = {
  key: "root",
  storage,
};

const appointmentPersistedReducer = persistReducer(
  persistConfig,
  appointmentReducer
);
const notificationPersistedReducer = persistReducer(
  persistConfig,
  notificationDataSlice
);
const superAdminHomePageReducer = persistReducer(persistConfig, homepageSlice);
const LabTestHomepageReducer = persistReducer(
  persistConfig,
  labTestCateogryDataSlice
);
const allDoctors = persistReducer(persistConfig, allDoctorsPageSlice);
const userDetailsSlice = persistReducer(persistConfig, userDetailsPageSlice);

export const makeStore = () =>
  configureStore({
    reducer: {
      appointment: appointmentPersistedReducer,
      notificationData: notificationPersistedReducer,
      superAdminHomePage: superAdminHomePageReducer,
      labtestHomepage: LabTestHomepageReducer,
      allDoctorS: allDoctors,
      userDetails: userDetailsSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
          ignoredPaths: ["some.nonSerializablePath"], // Ignore specific paths in state
        },
      }),
  });

export const wrapper = createWrapper(makeStore);
