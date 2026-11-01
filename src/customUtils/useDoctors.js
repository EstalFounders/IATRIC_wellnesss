// customUtils/useDoctors.js
//
// The one way components consume doctor data.
//
// Mount -> check redux -> the thunk fetches only when the slice is empty or the
// cached roster is older than its freshness window, then stores the answer.
// Because the guard lives in the thunk's `condition`, a page with ten doctor
// widgets still performs a single request, the cached list paints instantly and a
// doctor added in the panel shows up on the next visit without clearing storage.
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDoctors,
  selectAllDoctors,
  selectDoctorsError,
  selectDoctorsStatus,
} from "../store/slices/bookingWebsite/allDoctorsPageSlice";

export const useDoctors = ({ enabled = true, force = false } = {}) => {
  const dispatch = useDispatch();
  const doctors = useSelector(selectAllDoctors);
  const status = useSelector(selectDoctorsStatus);
  const error = useSelector(selectDoctorsError);

  useEffect(() => {
    if (!enabled) return;
    // Fire-and-forget on purpose: the slice carries `status`/`error`, so no
    // component needs to keep a local loading flag.
    dispatch(fetchAllDoctors({ force }));
  }, [dispatch, enabled, force]);

  // Explicit refresh (after an add/edit/decision) - bypasses the cache.
  const refetch = useCallback(
    () =>
      dispatch(fetchAllDoctors({ force: true }))
        .unwrap()
        .catch((fetchError) => {
          console.error("Failed to refresh the doctor list:", fetchError);
          return null;
        }),
    [dispatch]
  );

  return {
    doctors,
    // Only a cold start (nothing cached yet) counts as loading: a background
    // revalidation must not flash a spinner over an already rendered roster.
    isLoading:
      enabled &&
      doctors.length === 0 &&
      (status === "loading" || status === "idle"),
    error,
    isLoaded: doctors.length > 0,
    refetch,
  };
};

export default useDoctors;
