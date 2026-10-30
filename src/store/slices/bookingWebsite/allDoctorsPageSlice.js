// store/slices/bookingWebsite/allDoctorsPageSlice.js
//
// The single redux home for the doctor roster (`GET /api/addDoctor`).
// Every consumer - the public listing, the booking flow, the doctor panel and
// the super-admin panel - reads `state.allDoctorS.allDoctors` and loads it with
// the `fetchAllDoctors` thunk, so the list is fetched once and shared.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../../constant";

// Stable empty reference so selectors do not trigger needless re-renders.
const EMPTY_LIST = [];

const initialState = {
  allDoctors: [],
  doctorInfo: null,
  serviceTypes: [],
  // Mirrors the thunk lifecycle so every consumer renders the same states.
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// The endpoint answers with an array today; the `{ doctors: [...] }` shape is
// tolerated so an API tweak cannot blank the whole site.
const normalizeDoctors = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.doctors)) return payload.doctors;
  return [];
};

// One request per page load, shared by every mounted consumer. A plain module
// flag (not the persisted `status`) so a stale "loading" from an abandoned
// request can never block the next page from loading the roster.
let inFlight = false;

/**
 * Loads the doctor roster into redux - cache first.
 *
 * `condition` is what makes every caller "check redux, then fall back to the
 * API": the request is skipped when the slice already holds a list, and a
 * second component mounting while a request is in flight joins that request
 * instead of firing its own. Pass `{ force: true }` for an explicit refresh.
 */
export const fetchAllDoctors = createAsyncThunk(
  "allDoctorsPage/fetchAllDoctors",
  async (_args, { rejectWithValue }) => {
    inFlight = true;
    try {
      const response = await fetch(api.addDoctor);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return normalizeDoctors(await response.json());
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch doctors");
    } finally {
      inFlight = false;
    }
  },
  {
    condition: (args, { getState }) => {
      if (inFlight) return false;
      if (args?.force) return true;
      return !getState().allDoctorS?.allDoctors?.length;
    },
  }
);

const allDoctorsPageSlice = createSlice({
  name: "allDoctorsPage",
  initialState,
  reducers: {
    setAllDoctors: (state, action) => {
      state.allDoctors = normalizeDoctors(action.payload);
      state.status = "succeeded";
      state.error = null;
    },
    setDoctorInfo: (state, action) => {
      state.doctorInfo = action.payload;
    },
    setServiceTypes: (state, action) => {
      state.serviceTypes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDoctors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allDoctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "Failed to fetch doctors";
      });
  },
});

/* ── Selectors: the only approved way to read doctor data ─────────────────── */

export const selectAllDoctors = (state) =>
  state.allDoctorS?.allDoctors || EMPTY_LIST;

export const selectDoctorsStatus = (state) => state.allDoctorS?.status || "idle";

export const selectDoctorsError = (state) => state.allDoctorS?.error || null;

export const selectDoctorById = (id) => (state) =>
  selectAllDoctors(state).find(
    (doctor) => doctor && (doctor._id === id || doctor.id === id)
  ) || null;

// Export actions
export const { setAllDoctors, setDoctorInfo, setServiceTypes } =
  allDoctorsPageSlice.actions;

// Export reducer
export default allDoctorsPageSlice.reducer;
