// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import appointmentReducer from "./slices/registerDoc/appointmentSlice";
import notificationDataSlice from "./slices/notificationSectionApiData";
import homepageSlice from "./slices/superAdmin/homepageSlice";
import otherDetailsSlice from "./slices/superAdmin/otherDetailsSlice";
import labTestCateogryDataSlice from "./slices/labTest/labTestCategoryApiData";
import allDoctorsPageSlice from "./slices/bookingWebsite/allDoctorsPageSlice";
import userDetailsPageSlice from "./slices/authentication/userDetailsSlice";
import medicineHomePageApiDataSlice from "./slices/medicine/MedicineHomePageApiData.js";
import otherConfigSlice from "./slices/bookingWebsite/otherConfig.js";
import UtilBlogDataSlice from "./slices/blog/utilBlogStore.js";

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
const superAdminOtherDetailsReducer = persistReducer(
  persistConfig,
  otherDetailsSlice
);
const LabTestHomepageReducer = persistReducer(
  persistConfig,
  labTestCateogryDataSlice
);
const allDoctors = persistReducer(persistConfig, allDoctorsPageSlice);
const userDetailsSlice = persistReducer(persistConfig, userDetailsPageSlice);
const medicineDetailsSlice = persistReducer(
  persistConfig,
  medicineHomePageApiDataSlice
);

const otherConfig = persistReducer(persistConfig, otherConfigSlice);
const utilBlogStore = persistReducer(persistConfig, UtilBlogDataSlice);

export const makeStore = () =>
  configureStore({
    reducer: {
      appointment: appointmentPersistedReducer,
      notificationData: notificationPersistedReducer,
      superAdminHomePage: superAdminHomePageReducer,
      labtestHomepage: LabTestHomepageReducer,
      allDoctorS: allDoctors,
      userDetails: userDetailsSlice,
      medicineDetails: medicineDetailsSlice,
      otherDetailsSlice: superAdminOtherDetailsReducer,
      otherConfigSlice: otherConfig,
      utilBlogStoreSlice: utilBlogStore,
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
