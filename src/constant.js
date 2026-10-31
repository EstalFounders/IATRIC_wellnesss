export const company_registrated_name = "Ttanshe health path pvt.ltd";

// Firebase Storage roots are environment scoped. NEXT_PUBLIC_* is required because
// src/utils.js uploads prescriptions/invoices from the browser too, and the value is
// baked into both bundles at build time.
//   staging (default) : images/…, metadata/…
//   production        : set NEXT_PUBLIC_IMAGES_FOLDER=production_img and
//                       NEXT_PUBLIC_METADATA_FOLDER=production_img in .env.production.local
//                       (gitignored) on the production VPS only, then rebuild.
const trimSlashes = (value) => String(value || "").replace(/^\/+/, "").replace(/\/+$/, "");
const IMAGES_ROOT = trimSlashes(process.env.NEXT_PUBLIC_IMAGES_FOLDER) || "images";
const METADATA_ROOT = trimSlashes(process.env.NEXT_PUBLIC_METADATA_FOLDER) || "metadata";

export const certificate_img_path = `${IMAGES_ROOT}/doctorCertificate/`;
export const profilePicture_img_path = `${IMAGES_ROOT}/doctorPicture/`;
export const doctorStamp_img_path = `${IMAGES_ROOT}/doctorStamp/`;
export const doctorSignature_img_path = `${IMAGES_ROOT}/doctorSignature/`;
export const prescription_img_path = `${IMAGES_ROOT}/prescription/`;
export const invoice_img_path = `${IMAGES_ROOT}/invoice/`;
export const staffProfilePicture_img_path = `${IMAGES_ROOT}/staff/profilePicture/`;
// Consultation recordings uploaded by the meeting room (MediaRecorder blob).
export const consultation_recording_folder = `${IMAGES_ROOT}/consultationRecording`;

// Marketing panel media (homepage banner object + blog covers).
export const banner_img_path = `${METADATA_ROOT}/img.png`;
export const blog_img_folder = `${METADATA_ROOT}/blogImg`;

// Homepage / SuperAdmin service-tab images. Requested path is image/serviceImg;
// scoped under IMAGES_ROOT so staging (`images/serviceImg`) and production
// (`production_img/serviceImg`) never share objects.
export const service_img_folder = `${IMAGES_ROOT}/serviceImg`;

export const storage_bucket_url = "gs://iatrichealthcare-998f5.appspot.com";
export const contact_no = "+91 78959 59925";
export const email = "customercare@healthpath.co.in";
// Staff / doctor support helpline. Used ONLY by the doctor panel and the team's
// HR/document correspondence - everything a patient sees (site, prescription,
// invoice) must keep using `contact_no` / `email` above.
export const staff_support_no = "+91 81306 54581";
export const staff_support_email = "hrhealthpath@gmail.com";
export const countryCode = "+91";
export const development_production_url =
  process.env.NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL || "staging.healthpath.co.in/";
export const doctor_info_local_storage = "doctor_info";
export const super_admin_info_local_sotrage = "super_admin_info";
export const marketing_info_local_storage = "marketing_info";
export const medicine_cart_details_local_info = "medicineCartItems";
export const labtest_cart_details_local_info = "labTestcartItems";
export const single_call = "single_call";
export const invoice_bill_yellow_color = "#d1bd9a";
export const company_font_family = "TT Ramillas";
export const isNow = "Now";
export const SERVER_AVAILABLE_SLOTS_CODE = "304";
export const booking_btn_txt = "Book Now";

export const api = {
  addDoctor: "/api/addDoctor",
  staff: "/api/staff",
  uploadDoctorAvatar: "/api/doctor/upload-avatar",
  doctorLogin: "/api/doctorLogin",
  doctorForgotPassword: "/api/registerDoc/forgotPassword",
  medicineInfoApiCall: "/api/medicineInfo?medicineName=",
  getAllMedicine: "/api/medicineInfo",
  prescriptionCall: "/api/prescription",
  recordingCall: "/api/recording",
  sendWhatsAppCall: "/api/whatsApp",
  recommendedServies: "/api/lib/recommendedServices",
  bookConsultation: "/api/bookConsultation/",
  bookLabTest: "/api/bookLabTest/",
  consiltationFee: "/api/superAdmin/consultationFee",
  superAdmin_notification: "/api/superAdmin/notification",
  updateDoctorStatus: "/api/registerDoc/updateDoctorStatus",
  doctorUpdateRequest: "/api/registerDoc/doctorUpdateReq",
  leaveRequest: "/api/registerDoc/leaveRequest",
  labTest: "/api/labtest",
  labTestCategoryDetails: "/api/labtestcategorydetails",
  labTestDetails: "/api/superAdmin/labTest/labTestDetails",
  doctorEarning: "/api/registerDoc/doctorEarnings",
  addNewLab: "/api/superAdmin/addNewLab",
  globalVar: "/api/globalVar",
  userQuery: "/api/userQuery",
  joinUsQuery: "/api/joinUsQuery",
  getImageFomrFirebase: "/api/helper/getImageFromFirebase",
  getInvoice: "/api/helper/generateInvoice",
  uploadInvoice: "/api/helper/uploadInvoice",
  serviceOffered: "/api/superAdmin/serviceOffered",
  sendOtp: "/api/helper/whatsappConfirmationApi",
  serviceSuggestion: "/api/helper/getServiceSuggestion",
  helperApi: "/api/helperApi",
  consultationByMeetingId: "/api/getAppointmentId",
  marketingLogin: "/api/marketing/auth/login",
  marketingLogout: "/api/marketing/auth/logout",
  marketingSession: "/api/marketing/auth/session",
  marketingModules: "/api/marketing/modules",
  marketingSeo: "/api/marketing/seo",
  marketingSeoMetadata: "/api/marketing/seo/metadata",
  marketingBlog: "/api/marketing/blog",
  marketingBlogPublic: "/api/marketing/blog/public",
  marketingBanner: "/api/marketing/banner",
  marketingBannerMetadata: "/api/marketing/banner/metadata",
};

export const speciality = [
  "General Physician",
  "Pediatrics",
  "Cardiology",
  "Dermatologist",
  "Orthopaedics",
  "Gynaecology & Obstetrics",
  "Ophthalmology",
  "Pulmonology",
  "Psychiatrist",
  "Dentistry",
  "Physiotherapy",
  "Nutritionist",
];

export const consultationTypeMapping = {
  Call: "Call",
  Video: "Video",
  Clinic: "Clinic",
  "Home Visit": "Home visit",
};

// export const consultationTypeConstant =  {
//     call: "Call",
//     video: "Video",
//     clinic: "Clinic",
//     home_visit:"Home Visit"
// }

export const userTypeConstant = {
  patient: "patient",
  doctor: "doctor",
};

export const existingUser = "existing";
export const newUser = "new";
export const IN_TWENTY_MINUTES_NOW = "in_twenty_minutes_now";

export const appointment_status = {
  total: "TOTAL",
  open: "OPEN",
  completed: "COMPLETED",
  pending: "PENDING",
  confirmed: "CONFIRMED",
  cancelled: "CANCELLED",
  rescheduled: "RESCHEDULED",
};

export const labTest_status = {
  total: "TOTAL",
  completed: "COMPLETED",
  pending: "PENDING",
  unpaid: "UNPAID",
  cancelled: "CANCELLED",
  paid: "PAID",
};

export const labTest_payment_status = {
  PAID: "paid",
  UNPAID: "unpaid",
};

export const payment_status = {
  INITIATED: "INITIATED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
};

export const payment = "payment";

export const consultation = "Consultation";

export const sessionStorageName = {
  ConsultationFee: "ConsultationFee",
  SelectedLabel: "selectedLabel",
  doctorUpdateRequest: "doctorUpdateRequest",
  leaveUpdateRequest: "leaveUpdateRequest",
};

export const price_symbol = "₹";
export const showUpdate = "showUpdate";
export const roles = {
  superAdmin: "superAdmin",
  doctor: "doctor",
  patient: "patient",
  employe: "employe",
};

export const superAdminConsultationtype = [
  { name: "Audio" },
  { name: "Video" },
  { name: "Home visit" },
  { name: "Clinic" },
];

export const DoctorType = {
  company: "Company",
  individual: "Individual",
};

export const serviceOffered = {
  consultation: "Consultation",
  labTest: "Labtest",
};

export const serviceCategoryType = {
  MAJOR: "MAJOR",
  SUB: "SUB",
};

export const CHOOSE_TIME = "ChooseTime";
export const IS_NOW = "Now";

export const address = "Sector 57 , Gurgaon, Haryana-122003";
export const facebook_page_url =
  "https://www.facebook.com/profile.php?id=61575112443781";
export const instagram_page_url =
  "https://www.instagram.com/healthpath.pvt/";
export const Linkdn_url =
  "https://www.linkedin.com/company/ttanshehealthpath/?viewAsMember=true";
export const color_schema = {
  green: "#3b5f1d",
  gold: "#916f38",
  // `yellow` kept for backwards compatibility; the gold in the current scheme.
  yellow: "#916f38",
  white: "#ffffff",
  grey: "#717171",
  ink: "#010101",
  black: "#000000",
};

export const style_schema = {
  font_family: "TT Ramillas, serif",
};

export const eventEmitter = {
  cartEventEmitter: "cartUpdate",
  navBarEventEmitter: "navbar-option",
  labTestEventEmitter: "labTestUpdate",
  medicineCartEventEmitter: "medicine-cart-update",
};

export const apiAction = { savePrescription: "savePrescription", getPrescription: "getPrescription" };

export const labtestCateogory = {
  fullBodyCheckup: "Full Body",
  sexualHealth: "Sexual Health",
  allergyTestCheckup: "Allergy",
};

export const medicine_discount = 0.95;

export const lab_test_discount = 0.95;

export const vapidKey =
  "BKcSS5CS3PZ8UEH5QxWcNzzeGDLLIra1YN8QRjEk9_36aZ_dkBPSiQ06XNOoeLAhkn0RT_yj5-zZLhXOB_YyrLE";

export const callToBook = "Get a Call back";
export const gst_no = "06AALCT8239J1ZS";

// next/image needs an explicit blurDataURL for remote images: Firebase Storage
// URLs are assembled at runtime, so Next.js cannot derive one from a static
// import. This is a 1x1 light-grey PNG (#f1f3f5) that Next.js stretches to a
// soft wash while the real image loads.
export const imageBlurDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4+PkrAAWyAtqHw3nPAAAAAElFTkSuQmCC";
