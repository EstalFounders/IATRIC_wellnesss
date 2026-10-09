// doctorProfileSubmit.js
// Submit helpers behind the dedicated doctor profile pages
// (pages/registerDoc/profile.js and pages/superAdmin/doctorProfile.js).
//
// These flows used to live in the "Edit Doctor Details" popup (DoctorModalComp),
// its doctor-panel entry point (RegisterDocLoginHeader) and the super-admin list
// (RecentDoctors/DocItemCards). They are kept React-free and store-free so both
// pages share one implementation and the payloads stay unit-testable.

import { api, userTypeConstant } from "../../../../constant";
import { appendEducationTraining } from "../../../../customUtils/educationTraining";
import { appendLanguages } from "../../../../customUtils/languages";

const isFile = (value) => typeof File !== "undefined" && value instanceof File;

/**
 * Keep only what the user actually changed.
 *
 * Semantics are the popup's (and the approval API's):
 *   * arrays are compared entry by entry; the stored value can still be a legacy
 *     string ("mon-sunday", "Hindi, English"), which never equals the parsed
 *     array - that is why `editedDoctor` must not be pre-normalised;
 *   * a File on `profilePictureUrl` is returned as `pendingPhoto` instead of
 *     being diffed: a File would serialise to "{}" in the JSON approval body.
 *
 * @param {object} original stored doctor document
 * @param {object} edited   form state (`{...doctor}` plus the touched keys)
 * @returns {{changedFields: object, hasChanges: boolean, pendingPhoto: File|null}}
 */
export const buildChangedFields = (original, edited) => {
  const stored = original || {};
  const changedFields = {};
  let hasChanges = false;
  let pendingPhoto = null;

  Object.keys(edited).forEach((key) => {
    // A new photo arrives as a File, which cannot travel in the JSON request;
    // it is uploaded first and only its URL is submitted.
    if (key === "profilePictureUrl" && isFile(edited[key])) {
      pendingPhoto = edited[key];
      hasChanges = true;
      return;
    }

    if (Array.isArray(edited[key])) {
      const updatedArray = edited[key];
      const originalArray = stored[key] || [];

      // Compare arrays (length and content)
      const arraysAreEqual =
        Array.isArray(originalArray) &&
        updatedArray.length === originalArray.length &&
        updatedArray.every((value, index) => value === originalArray[index]);

      if (!arraysAreEqual) {
        hasChanges = true;
        changedFields[key] = updatedArray;
      }
      return;
    }

    if (edited[key] !== stored[key]) {
      hasChanges = true;
      changedFields[key] = edited[key];
    }
  });

  return { changedFields, hasChanges, pendingPhoto };
};

/**
 * Upload a photo picked in the Doctor Panel and return its Firebase URL.
 * The URL is what goes into the approval request - passing the File itself would
 * serialise to "{}" in the JSON body and the new photo would be lost.
 * See pages/api/doctor/upload-avatar.js.
 *
 * @param {File}   file
 * @param {string} doctorId
 * @returns {Promise<string>} the uploaded photo URL
 */
export const uploadDoctorAvatarWeb = async (file, doctorId) => {
  const formData = new FormData();
  formData.append("profilePicture", file, file.name || "doctor-photo.jpg");
  if (doctorId) formData.append("doctorId", doctorId);

  const response = await fetch(api.uploadDoctorAvatar, {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "photo upload failed");
  }

  return data.url;
};

/**
 * Doctor Panel -> super-admin approval queue.
 * POST /api/registerDoc/doctorUpdateReq?id=&name=
 */
export const submitDoctorChangeRequest = async ({
  doctorId,
  doctorName,
  changedFields,
}) => {
  const response = await fetch(
    `${api.doctorUpdateRequest}/?id=${doctorId}&name=${encodeURIComponent(
      doctorName || ""
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ changedFields }),
    }
  );

  return response.json();
};

/**
 * Super admin -> direct multipart update.
 * PUT /api/addDoctor?id=
 */
export const submitDoctorUpdate = async (editedDoctor) => {
  const formData = new FormData();

  formData.append("name", editedDoctor.name);
  formData.append("expertise", editedDoctor.expertise);
  // Optional; keep the stored value alive across an edit.
  formData.append("doctorRegistrationNo", editedDoctor.doctorRegistrationNo);
  formData.append("mobileNumber", editedDoctor.mobileNumber);
  // One field per entry, same as education + training below.
  appendLanguages(formData, editedDoctor.language);
  formData.append("workDays", editedDoctor.workDays);
  formData.append("overview", editedDoctor.overview);
  // One field per entry; blank rows are dropped and a blank field clears the
  // list on the API side.
  appendEducationTraining(formData, editedDoctor.educationTraining);
  formData.append("workExperience", editedDoctor.workExperience);
  formData.append("consultationType", editedDoctor.consultationType);
  formData.append(
    "serviceOffered",
    (editedDoctor.serviceOffered || []).join(",")
  );
  formData.append("location", editedDoctor.location);
  formData.append("profilePicture", editedDoctor.profilePictureUrl);
  formData.append("doctorType", editedDoctor.doctorType);
  formData.append("price", editedDoctor.price);
  formData.append("slotStartTime", editedDoctor.slotStartTime);
  formData.append("slotEndTime", editedDoctor.slotEndTime);
  (editedDoctor.diplomasCertificatesUrls || []).forEach(
    (certificate, index) => {
      formData.append(`diplomasCertificatesUrls[${index}]`, certificate);
    }
  );

  const response = await fetch(`${api.addDoctor}?id=${editedDoctor._id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Doctor update failed (${response.status})`);
  }

  return response;
};

/**
 * Run the save flow for one origin.
 *
 * Doctor Panel  - only the changed keys are queued for approval; a picked photo
 *                 is uploaded first and a failed upload does not block the rest
 *                 of the changes (same behaviour as the popup).
 * Super admin   - the whole form is PUT to /api/addDoctor.
 *
 * @param {object}   args
 * @param {string}   args.origin       userTypeConstant.doctor for the panel
 * @param {object}   args.doctor       stored doctor (approval baseline)
 * @param {object}   args.editedDoctor form state
 * @param {function} [args.onStatus]   progress text callback (photo upload)
 * @returns {Promise<{ok: boolean, message: string, photoAlert?: string}>}
 */
export const saveDoctorProfile = async ({
  origin,
  doctor,
  editedDoctor,
  onStatus = () => {},
}) => {
  if (origin !== userTypeConstant.doctor) {
    await submitDoctorUpdate(editedDoctor);
    return { ok: true, message: "Doctor has been updated" };
  }

  const { changedFields, hasChanges, pendingPhoto } = buildChangedFields(
    doctor,
    editedDoctor
  );

  // If no changes were detected, exit early
  if (!hasChanges) {
    return { ok: false, message: "You have changed nothing" };
  }

  // New photo: upload it first so the approval request carries a real URL.
  let photoAlert = "";
  if (pendingPhoto) {
    try {
      onStatus("Uploading your profile photo...");
      changedFields.profilePictureUrl = await uploadDoctorAvatarWeb(
        pendingPhoto,
        editedDoctor._id
      );
    } catch (error) {
      // The photo failed but the rest of the profile changes still go through.
      photoAlert = `Your new photo could not be uploaded (${error.message}). The rest of your profile changes will still be submitted.`;
    } finally {
      onStatus("");
    }
  }

  // Only the photo changed and it failed - there is nothing left to submit.
  if (!Object.keys(changedFields).length) {
    return { ok: false, message: photoAlert || "You have changed nothing" };
  }

  const data = await submitDoctorChangeRequest({
    doctorId: editedDoctor._id,
    doctorName: doctor?.name,
    changedFields,
  });

  return {
    ok: true,
    message: data?.message || "Your changes were sent for approval.",
    photoAlert,
  };
};

