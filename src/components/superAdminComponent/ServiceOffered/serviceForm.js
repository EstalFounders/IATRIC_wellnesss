// serviceForm.js - the shared shape, validation and payload rules of the
// super-admin "Service offered" panel (ServiceOfferedComp.js).
//
// Both forms in the panel (the "Add new service" card and the edit modal) render
// the same field list and run the same validation, so the rules live here once.
// They mirror src/models/serviceOffered.js exactly:
//
//   required  name, description, hsn_percentage, hsn_code, share, gst,
//             platformfee, processingfee
//   numbers   fee, hsn_percentage, share, gst, platformfee, processingfee,
//             freight
//   optional  fee, freight, image, subheading, subheadingHi, descriptionHi
//
// The API answers POST with `new ServiceOffered(req.body).save()`, which runs the
// model validators, so POSTing a blank required field fails server-side. We block
// it in the browser first with the same messages instead of surfacing a raw 500.
import { serviceCategoryType } from "../../../constant";

// Blank draft for the "Add new service" form (and the base the edit modal copies).
export const EMPTY_SERVICE = {
  name: "",
  description: "",
  subheading: "",
  subheadingHi: "",
  descriptionHi: "",
  image: "",
  imageFile: null,
  fee: "",
  hsn_percentage: "",
  hsn_code: "",
  share: "",
  gst: "",
  platformfee: "",
  processingfee: "",
  freight: "",
  isActive: true,
  categoryType: serviceCategoryType.MAJOR,
};

export const REQUIRED_FIELDS = [
  "name",
  "description",
  "hsn_percentage",
  "hsn_code",
  "share",
  "gst",
  "platformfee",
  "processingfee",
];

export const NUMERIC_FIELDS = [
  "fee",
  "hsn_percentage",
  "share",
  "gst",
  "platformfee",
  "processingfee",
  "freight",
];

export const FIELD_LABELS = {
  name: "Name",
  description: "Description",
  hsn_percentage: "HSN %",
  hsn_code: "HSN code",
  share: "Share",
  gst: "GST",
  platformfee: "Platform fee",
  processingfee: "Processing fee",
  fee: "Fee",
  freight: "Freight",
};

export const SERVICE_CATEGORY_OPTIONS = [
  { value: serviceCategoryType.MAJOR, label: "Major" },
  { value: serviceCategoryType.SUB, label: "Sub" },
];

// Rendered top-to-bottom by ServiceFields.js in both forms. `span` widens a
// field to the full grid width (textareas, the image path and the toggle).
export const SERVICE_FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "e.g., General physician", required: true },
  { name: "categoryType", label: "Category", type: "select", options: SERVICE_CATEGORY_OPTIONS },
  { name: "description", label: "Description", type: "textarea", placeholder: "Paragraph shown on the homepage speciality tab", required: true, span: true },
  { name: "subheading", label: "Subheading", type: "text", placeholder: "e.g., Primary care, always accessible" },
  { name: "subheadingHi", label: "Subheading (Hindi)", type: "text", placeholder: "हिंदी उपशीर्षक" },
  { name: "descriptionHi", label: "Description (Hindi)", type: "textarea", placeholder: "हिंदी विवरण", span: true },
  { name: "image", label: "Image", type: "image", span: true, help: "Uploaded to Firebase Storage (images/serviceImg). The public URL is stored on the service." },
  { name: "fee", label: "Fee", type: "number", placeholder: "e.g., 399" },
  { name: "hsn_percentage", label: "HSN %", type: "number", placeholder: "e.g., 18", required: true },
  { name: "hsn_code", label: "HSN code", type: "text", placeholder: "e.g., 9983", required: true },
  { name: "share", label: "Share", type: "number", placeholder: "Doctor share", required: true },
  { name: "gst", label: "GST", type: "number", placeholder: "GST amount", required: true },
  { name: "platformfee", label: "Platform fee", type: "number", placeholder: "Platform fee", required: true },
  { name: "processingfee", label: "Processing fee", type: "number", placeholder: "Processing fee", required: true },
  { name: "freight", label: "Freight", type: "number", placeholder: "Freight (default 0)" },
  { name: "isActive", label: "Active", type: "toggle", span: true },
];

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

// Returns a { fieldName: message } map; empty means valid. Shared by both forms.
export const validateService = (draft) => {
  const errors = {};

  REQUIRED_FIELDS.forEach((key) => {
    if (isBlank(draft[key])) {
      errors[key] = `${FIELD_LABELS[key]} is required`;
    }
  });

  NUMERIC_FIELDS.forEach((key) => {
    // A value that is already flagged (missing required) or legitimately empty
    // (optional fee/freight) needs no further check.
    if (errors[key] || isBlank(draft[key])) return;
    const value = Number(draft[key]);
    if (!Number.isFinite(value) || value < 0) {
      errors[key] = `${FIELD_LABELS[key]} must be a number of 0 or more`;
    }
  });

  return errors;
};

// Turns any draft (add form or edited row) into the JSON body the API expects:
// the copy fields are trimmed, the numeric fields cast to Number and the optional
// blanks dropped so the model defaults (freight 0, isActive true) still apply.
export const toPayload = (draft) => {
  const payload = {
    name: String(draft.name ?? "").trim(),
    description: String(draft.description ?? "").trim(),
    hsn_code: String(draft.hsn_code ?? "").trim(),
    subheading: draft.subheading ?? "",
    subheadingHi: draft.subheadingHi ?? "",
    descriptionHi: draft.descriptionHi ?? "",
    image: draft.image ?? "",
    categoryType: draft.categoryType || serviceCategoryType.MAJOR,
    isActive: Boolean(draft.isActive),
  };

  NUMERIC_FIELDS.forEach((key) => {
    if (isBlank(draft[key])) return;
    payload[key] = Number(draft[key]);
  });

  return payload;
};
