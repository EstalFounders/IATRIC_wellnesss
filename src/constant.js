export const company_registrated_name = "Ttanshe health path pvt.ltd";
export const certificate_img_path = "images/doctorCertificate/";
export const profilePicture_img_path = "images/doctorPicture/";
export const doctorStamp_img_path = "images/doctorStamp/";
export const doctorSignature_img_path = "images/doctorSignature/";
export const prescription_img_path = "images/prescription/";
export const invoice_img_path = "images/invoice/";
export const storage_bucket_url = "gs://iatrichealthcare-998f5.appspot.com";
export const contact_no = "+91 7895959925";
export const email= 'customercare@healthpath.co.in'
export const countryCode = "+91" 
export const development_production_url = "https://vtdeveloper.d3pu3hm659dc5p.amplifyapp.com/"
export const doctor_info_local_storage = 'doctor_info'
export const super_admin_info_local_sotrage= 'super_admin_info'
export const single_call = "single_call"
export const invoice_bill_yellow_color = "#d1bd9a"
export const company_font_family = "TT Ramillas"
export const isNow = "Now"
export const SERVER_AVAILABLE_SLOTS_CODE = "304"

export const api = {
    addDoctor: "/api/addDoctor",
    doctorLogin: "/api/doctorLogin",
    medicineInfoApiCall: "/api/medicineInfo?medicineName=",
    prescriptionCall: "/api/prescription",
    sendWhatsAppCall: "/api/whatsApp",
    recommendedServies: "/api/lib/recommendedServices",
    bookConsultation: "/api/bookConsultation/",
    bookLabTest: "/api/bookLabTest/",
    consiltationFee: "/api/superAdmin/consultationFee",
    updateDoctorStatus: "/api/registerDoc/updateDoctorStatus",
    doctorUpdateRequest: "/api/registerDoc/doctorUpdateReq",
    leaveRequest: "/api/registerDoc/leaveRequest",
    labTest: "/api/labtest",
    labTestCategoryDetails:"/api/labtestcategorydetails",
    labTestDetails: "/api/superAdmin/labTest/labTestDetails",
    doctorEarning: "/api/registerDoc/doctorEarnings",
    addNewLab: "/api/superAdmin/addNewLab",
    addNewOffer: "/api/superAdmin/addNewOffer",
    globalVar: "/api/globalVar",
    userQuery: "/api/userQuery",
    getImageFomrFirebase: "/api/helper/getImageFromFirebase",
    getInvoice: "/api/helper/generateInvoice",
    uploadInvoice: "/api/helper/uploadInvoice",
    serviceOffered: "/api/superAdmin/serviceOffered",
}

export const services = [
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
    "Nursing care",
    "Home care",
    "Medicine Delivery",
    "Lab Investigation",
    "Corporate Healthcare",
    "Healthcamp",
]

export const consultationTypeMapping = {
    "Call": "Call",
    "Video": "Video",
    "Clinic": "Clinic",
    "Home Visit": "Home visit"
  };

// export const consultationTypeConstant =  {
//     call: "Call",
//     video: "Video",
//     clinic: "Clinic",
//     home_visit:"Home Visit"
// }

export const userTypeConstant = {
    patient: 'patient',
    doctor: 'doctor'
}

export const existingUser = "existing"
export const newUser = "new"
export const IN_TWENTY_MINUTES_NOW = "in_twenty_minutes_now"

export const appointment_status = {
    total: "TOTAL",
    open: "OPEN",
    completed: "COMPLETED",
    pending: "PENDING",
    confirmed: "CONFIRMED",
    cancelled: "CANCELLED",
    rescheduled: "RESCHEDULED"
}

export const labTest_status = {
    total: "TOTAL",
    completed: "COMPLETED",
    pending: "PENDING",
    unpaid: "UNPAID",
    cancelled: "CANCELLED",
    paid: "PAID"
}

export const labTest_payment_status = {
    PAID: "paid",
    UNPAID: "unpaid"
}

export const consultation = "Consultation"

export const sessionStorageName = {
    ConsultationFee: "ConsultationFee",
    SelectedLabel: "selectedLabel",
    doctorUpdateRequest: "doctorUpdateRequest",
    leaveUpdateRequest: "leaveUpdateRequest"
}

export const price_symbol = "₹"
export const showUpdate="showUpdate"
export const discount_type = {
    Percentage: "Percentage",
    Fixed: "Fixed",
    Free: "Free"
}

export const roles = {
    superAdmin: "superAdmin",
    doctor: "doctor",
    patient: "patient",
    employe: "employe"
}

export const superAdminConsultationtype = [
    "Call",
    "Video",
    "Home visit",
    "Clinic"
  ];

export const DoctorType = {
    Company: "Company",
    Individual: "Indiividual",
};

export const serviceOffered = {
    consultation: "Consultation",
    labTest: "Labtest",
}


