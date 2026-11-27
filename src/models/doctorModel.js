import mongoose from "mongoose";

const { Schema } = mongoose;

const doctorSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    // Optional on the super-admin "Add Doctor" form. NOTE: `unique` was removed
    // on purpose — a unique index on gender made it impossible to register a
    // second doctor of the same gender.
    required: false,
  },
  mobileNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  expertise: {
    type: String,
    required: [true, "Area of expertise is required"],
  },
  // Medical registration number, printed as the third line of the prescription
  // stamp and in the doctor identity block. Optional: a doctor can be registered
  // without it and the number can be filled in later from the edit form. It is
  // deliberately NOT unique either - the registration rules were dropped on
  // request, so `db.js` removes the stale `doctorRegistrationNo_1` unique index.
  doctorRegistrationNo: {
    type: String,
    trim: true,
    required: false,
  },
  // NOTE: the old `degree` field was removed from the doctor module. It is
  // intentionally absent from this schema so mongoose strips it from every
  // create/update payload; `scripts/removeDoctorDegree.js` unsets it on the
  // documents that still carry it.
  language: {
    // Repeatable ("English", "Hindi"). Stored as an array of trimmed strings so
    // one doctor can list several languages; helpers live in
    // `src/customUtils/languages.js`. Legacy documents hold a single
    // comma/slash separated String and are upgraded by
    // `scripts/cleanDoctorLanguages.js`. Mongoose casts such a String to a
    // one-element array on read, so old documents keep working meanwhile.
    type: [String],
    default: [],
    // `required` is a no-op on a mongoose 8 array path (an empty array counts as
    // present), so the old "Language is required" rule is kept as a validator
    // instead. Blank entries are dropped by `parseLanguages` before this runs.
    validate: {
      validator: (values) => Array.isArray(values) && values.length > 0,
      message: "Language is required",
    },
  },
  workDays: {
    type: String,
    required: [true, "Working days is required"],
  },
  weeklyAvailability: {
    type: [new Schema({
      day: { type: String, required: true },
      ranges: [{
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      }],
    }, { _id: false })],
    default: undefined,
  },
  overview: {
    type: String,
    required: true,
  },
  workExperience: {
    // Repeatable ("8 years - Cardiology"). Stored as an array of trimmed
    // strings like `educationTraining`, but at least one entry is required.
    // Legacy documents hold a single String and are cast by mongoose to a
    // one-element array on read; `parseWorkExperience`
    // (src/customUtils/workExperience.js) normalises new writes. `required` is
    // a no-op on a mongoose 8 array path, so the rule is kept as a validator
    // instead (same as `language`).
    type: [String],
    default: [],
    validate: {
      validator: (values) => Array.isArray(values) && values.length > 0,
      message: "Work experience is required",
    },
  },
  totalyearofexperience: {
    // Total years of experience as a plain number (e.g. 15), kept separate from
    // the repeatable `workExperience` entries which may be free text.
    type: Number,
    required: false,
    default: 0,
  },
  consultationType: {
    // Array of `{ name, price }` entries; legacy string entries are tolerated
    // by every reader (see consultationTypeName in src/utils/consultationFee.js).
    // Entries may also carry the optional `clinicName` / `clinicLocation` typed
    // in Add Doctor step 3 - `Array` stores them as-is (a sub-schema would strip
    // the keys).
    type: Array,
    required: true,
  },
  serviceOffered: {
    // Optional for now: the Add Doctor form renders the field disabled (see
    // SERVICES_OFFERED_ENABLED in lib/addDoctorSteps.js) and sends `[]` when the
    // admin leaves it alone. `required: true` on an array rejects an empty
    // array, so it has to be off while the field is turned off.
    type: Array,
    required: false,
  },
  location: {
    // Structured `{ state, city }` (set by the Add Doctor form's India location
    // picker). `Mixed` is used on purpose so legacy documents that still hold a
    // plain string ("Mumbai", "None") keep reading correctly; readers normalise
    // through `formatLocation` / `parseLocation` in
    // `src/customUtils/indiaLocations.js`.
    type: Schema.Types.Mixed,
    required: false,
  },
  educationTraining: {
    // Repeatable ("MBBS - Johns Hopkins University"). Optional on the
    // super-admin "Add Doctor" form; stored as an array of trimmed strings so
    // one doctor can carry several degrees/trainings.
    type: [String],
    default: [],
    required: false,
  },
  password: {
    type: String,
    // Optional on the super-admin "Add Doctor" form. A doctor created without a
    // password simply cannot log in until one is set.
    required: false,
    // Stored as a bcrypt hash and excluded from normal queries; read it only
    // with .select("+password") in login / password verification.
    select: false,
  },
  profilePictureUrl: {
    type: String,
    required: false,
  },
  diplomasCertificatesUrls: {
    type: Array,
    required: false,
  },
  doctorStampUrl: {
    type: String,
    required: false,
  },
  doctorSignatureUrl: {
    type: String,
    required: false,
  },
  // ── Statutory / payout details (Add Doctor wizard, step 4) ────────────────
  // All optional: a doctor can be registered first and the banking details added
  // later. Every field here is `select: false` on purpose - GET /api/addDoctor is
  // a PUBLIC endpoint that returns whole documents, so a PAN or an account number
  // must never travel with the doctor listing. Read them explicitly:
  //   Doctor.findById(id).select("+panNumber +bankDetails +panCardUrl")
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    required: false,
    select: false,
    // The API validates with its own friendly message (customUtils/bankDetails);
    // this stays loose so it can never reject a request the API accepted.
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]$|^$/, "PAN number is invalid"],
  },
  bankDetails: {
    type: new Schema(
      {
        accountHolderName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        ifscCode: { type: String, trim: true, uppercase: true },
        bankName: { type: String, trim: true },
        branchName: { type: String, trim: true },
      },
      { _id: false }
    ),
    required: false,
    select: false,
  },
  panCardUrl: {
    type: String,
    required: false,
    select: false,
  },
  doctorType: {
    type: String,
    required: [true, "Doctor type is required"],
  },
  slotStartTime: {
    type: Date,
  },
  slotEndTime: {
    type: Date,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  isActive: { type: Boolean, default: true },
  unavailableDates: { type: [String], default: [] },
  doctorShare: { type: Number, default: 0 }
});

// Check if the model already exists to prevent overwriting
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;
