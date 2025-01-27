// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appointmentReducer from './slices/appointmentSlice';
import notificationDataSlice from './slices/notificationSectionApiData'
import homepageSlice from './slices/superAdmin/homepageSlice'

const persistConfig = {
  key: 'root',
  storage,
};

const appointmentPersistedReducer = persistReducer(persistConfig, appointmentReducer);
const notificationPersistedReducer = persistReducer(persistConfig,notificationDataSlice)
const superAdminHomePageReducer = persistReducer(persistConfig,homepageSlice)

export const makeStore = () =>
  configureStore({
    reducer: {
      appointment: appointmentPersistedReducer,
      notificationData: notificationPersistedReducer,
      superAdminHomePage: superAdminHomePageReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            ignoredPaths: ['some.nonSerializablePath'], // Ignore specific paths in state
          },
        }),
  });

export const wrapper = createWrapper(makeStore);
