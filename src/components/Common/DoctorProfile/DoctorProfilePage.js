// DoctorProfilePage.js
// Page shell behind pages/registerDoc/profile.js ("Your Profile" in the doctor
// panel) and pages/superAdmin/doctorProfile.js (the pencil in the doctor list).
//
// It resolves the doctor for the active origin, renders the shared
// DoctorProfileForm and runs the origin-specific save flow
// (lib/doctorProfileSubmit.js):
//   * doctor     - the logged-in doctor from the panel session; saving sends only
//                  the changed fields to the approval queue.
//   * superAdmin - the doctor named by `?id=`, looked up in the persisted redux
//                  list first; saving PUTs the whole form to /api/addDoctor.
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import DoctorProfileForm from "./DoctorProfileForm";
import { saveDoctorProfile } from "./lib/doctorProfileSubmit";
import styles from "./DoctorProfileForm.module.css";
import { userTypeConstant } from "../../../constant";
import { useDoctors } from "../../../customUtils/useDoctors";
import { readSessionDoctor } from "./lib/doctorProfileSession";

const DOCTOR_LIST_ROUTE = "/superAdmin/homepage";
const DOCTOR_PANEL_ROUTE = "/registerDoc/homepage";

const DoctorProfilePage = ({ origin }) => {
  const isDoctor = origin === userTypeConstant.doctor;
  const router = useRouter();

  // The shared redux roster - a deep link / refresh is served from here and only
  // falls back to the API when the doctor is not in it yet (`useDoctors` decides).
  const {
    doctors: storedDoctors,
    isLoading: doctorsLoading,
    refetch: refetchDoctors,
  } = useDoctors();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [banner, setBanner] = useState("");

  // Doctor panel: the logged-in doctor, exactly like the header / popup did.
  useEffect(() => {
    if (!isDoctor) return;
    setDoctor(readSessionDoctor());
    setLoading(false);
  }, [isDoctor]);

  // Super admin: the doctor named by `?id=`. The roster arrives from redux (the
  // hook loads it when the slice is empty), so this only reacts to that data.
  useEffect(() => {
    if (isDoctor || !router.isReady) return;

    const wantedId = router.query.id;
    if (!wantedId) {
      setLoading(false);
      return;
    }

    const fromStore = storedDoctors.find(
      (item) => item._id === wantedId || item.id === wantedId
    );

    if (fromStore) {
      setDoctor(fromStore);
      setLoading(false);
      return;
    }

    // Still fetching the roster: stay on the loading state. Once the request is
    // done and the id is still absent, the "not found" state renders.
    if (doctorsLoading) {
      setLoading(true);
      return;
    }

    setDoctor(null);
    setLoading(false);
  }, [isDoctor, router.isReady, router.query.id, storedDoctors, doctorsLoading]);

  const goBack = useCallback(() => {
    router.push(isDoctor ? DOCTOR_PANEL_ROUTE : DOCTOR_LIST_ROUTE);
  }, [isDoctor, router]);

  // Refresh the shared roster so the list behind this page is up to date.
  const refreshDoctorList = refetchDoctors;

  const handleSave = async (editedDoctor) => {
    setSaving(true);
    setBanner("");
    try {
      const result = await saveDoctorProfile({
        origin,
        doctor,
        editedDoctor,
        onStatus: setUploadStatus,
      });

      if (!result.ok) {
        if (result.message) window.alert(result.message);
        return;
      }

      // The photo warning (if any) is shown first, then the server message -
      // the same order the popup used.
      if (result.photoAlert) window.alert(result.photoAlert);
      window.alert(result.message);

      if (!isDoctor) await refreshDoctorList();
      goBack();
    } catch (error) {
      console.error("Error saving the doctor profile:", error);
      window.alert(
        "Something went wrong while saving the profile. Please try again."
      );
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  };

  if (loading) {
    return <div className={styles.state}>Loading the profile...</div>;
  }

  if (!doctor) {
    return (
      <div className={styles.state}>
        <p>
          {isDoctor
            ? "We could not read your profile from this session. Please sign in again."
            : "This doctor could not be found. Open the doctor list and try again."}
        </p>
        <button type="button" className={styles.ghostBtn} onClick={goBack}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <DoctorProfileForm
      // Re-mount for a different doctor so the form starts from fresh values.
      key={doctor._id}
      doctor={doctor}
      origin={origin}
      onSave={handleSave}
      onCancel={goBack}
      saving={saving}
      uploadStatus={uploadStatus}
      banner={banner}
    />
  );
};

export default DoctorProfilePage;
