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
  // stamp and in the doctor identity block. Compulsory: the Add Doctor POST goes
  // through `Doctor.create`, so a blank value is rejected right there. Documents
  // created before this rule stay readable - the stamp simply drops its
  // "Reg. No:" line - and their owner is asked for the number on the next
  // profile save, because the PUT / approval paths use `findByIdAndUpdate`
  // without `runValidators` and therefore do not re-run this validator.
  doctorRegistrationNo: {
    type: String,
    trim: true,
    required: [true, "Registration number is required"],
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
  overview: {
    type: String,
    required: true,
  },
  workExperience: {
    type: String,
    required: true,
  },
  consultationType: {
    type: Array,
    required: true,
  },
  serviceOffered: {
    type: Array,
    required: true,
  },
  location: {
    type: String,
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
  doctorType: {
    type: String,
    required: [true, "Doctor type is required"],
  },
  price: {
    type: Number,
    // Optional on the super-admin "Add Doctor" form.
    required: false,
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
