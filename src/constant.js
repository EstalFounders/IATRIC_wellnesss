export const certificate_img_path = "images/doctorCertificate/";
export const profilePicture_img_path = "images/doctorPicture/";
export const doctorStamp_img_path = "images/doctorStamp/";
export const doctorSignature_img_path = "images/doctorSignature/";
export const prescription_img_path = "images/prescription/";
export const storage_bucket_url = "gs://iatrichealthcare-998f5.appspot.com";
export const contact_no = "+91 96259 42020";
export const email= 'iatrichealthcare@gmail.com'
export const twilioPhoneNumber = '+14155238886'
export const countryCode = "+91" 
export const development_production_url = "https://development.d2xrlfkxmadgut.amplifyapp.com/"
export const doctor_info_local_storage = 'doctor_info'
export const super_admin_info_local_sotrage= 'super_admin_info'

export const api = {
    addDoctor: "/api/addDoctor",
    doctorLogin: "/api/doctorLogin",
    medicineInfoApiCall: "/api/medicineInfo?medicineName=",
    prescriptionCall: "/api/prescription",
    sendWhatsAppCall: "/api/whatsApp",
    recommendedServies: "/api/lib/recommendedServices",
    bookConsultation: "/api/bookConsultation/"
}

export const services = [
    "General Physician",
    "Pediatrics",
    "Cardiology",
    "Dermatologist",
    "Orthopaedics",
    "Gynaecology",
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
    "Obstetrics",
]

export const consultationTypeMapping = {
    "Call": "Online consultations",
    "Video": "Online consultations",
    "Clinic": "Offline consultations",
    "Home Visit": "Home visit"
  };

export const consultationTypeConstant =  {
    call: "Call",
    video: "Video",
    clinic: "Clinic",
    home_visit:"Home Visit"
}

export const userTypeConstant = {
    patient: 'patient',
    doctor: 'doctor'
}

export const existingUser = "existing"
export const newUser = "new"

export const appointment_status = {
    total: "TOTAL",
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

export const consultation = "Consultation"


