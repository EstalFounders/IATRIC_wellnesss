import Link from "next/link";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  api,
  CHOOSE_TIME,
  consultationTypeMapping,
  IN_TWENTY_MINUTES_NOW,
  isNow,
  SERVER_AVAILABLE_SLOTS_CODE,
  sessionStorageName,
} from "../../constant";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CustomDialog from "../CustomPopup";
import {
  formatTime,
  generateSlotsForChooseTime,
  isWithinBusinessHours,
} from "../helper";
import { useRouter } from "next/router";
import styles from "./css/appointmentPage.module.css";
import { style } from "@mui/system";
import Preloader from "../Preloader";
import AppointmentBookingModal from "./modal/AppointmentBookingModal";
import Image from "next/image";
import { isMobileValid } from "../../helper";
import AvailableSlotsModel from "./modal/AvailableSlotsModel";
import AvailableSlots from "./AvailableSlots";
import WhatsappConfirmationModel from "./modal/WhatsappConfirmationModel";
import OtpConfirmationPopup from "./OtpConfirmationPopup";
import { IS_NOW } from "../../../pages/api/utils/constants";
import AppointmentForm from "./Appointmentform";
import bookConsultationFromAdmin from "../../../pages/superAdmin/bookConsultationFromAdmin";
import { ConsultationButton } from "../Common/commonUi";
import { fetchDoctors } from "../ApiService/ConsultationApiService";
import { useDispatch, useSelector } from "react-redux";
import {
  bookConsultationApiCall,
  getServiceOffered,
} from "../ApiService/BookConsultationApiCall";
import CommonHealthConcerns from "./CommonHealthConcern";
import Demo5Doctors1 from "../../components/Demo-5/Demo5Doctors1";
import HowItWorks from "./common/HowItsWorks";
import Statistic1 from "../Common/Statistic-1";
import FaqSection from "./common/FAQComponent";
import BenefitSection from "./common/BenefitsSection";

const AppointmentPage = () => {
  const router = useRouter();
  const isAppointmentPage = router.asPath.includes(
    "/superAdmin/bookConsultationFromAdmin"
  );
  const bookFromAdmin = router.asPath.includes(
    "/superAdmin/bookConsultationFromAdmin"
  )
    ? false
    : true;
  // State variables
  const [isDoctorLoading, setIsDoctorLoading] = useState();
  const [doctorChoice, setDoctorChoice] = useState("any");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorMobileNumber, setDoctorMobileNumber] = useState("");
  const [appointmentTime, setAppointmentTime] = useState(IS_NOW);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableSlotsFromServer, setAvailableSlotsFromServer] = useState([]);
  const [openAvailableSlotsFromServer, setOpenAvailableSlotsFromServer] =
    useState(false);
  const [locallyCreatedSlots, setLocallyCreatedSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobNo, setMobNo] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState();
  const [consultationType, setConsultationType] = useState("Call");
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [severity, setSeverity] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [consultationprice, setConsultationPrice] = useState("");
  const [bookingResponse, setBookingResponse] = useState();
  const withinBusinessHours = isWithinBusinessHours();
  const [slotEmpty, setSlotEmpty] = useState(false);
  const [noSLotAvailableMessage, setNoSLotAvailableMessage] = useState("");
  const [otpConfirmationPopup, setOtpConfirmationPopup] = useState(false);
  const [timeSelection, setTimeSelection] = useState(IS_NOW);
  const [services] = useState(
    useSelector((state) => state.superAdminHomePage.serviceOffered)
  );
  const [serviceType, setServiceType] = useState(services[0].name);

  const dispatch = useDispatch();

  // All state and setters/functions in one object
  const appointmentState = {
    doctorChoice,
    selectedDoctorId,
    appointmentTime,
    availableSlots,
    locallyCreatedSlots,
    showDatePicker,
    selectedDate,
    filteredDoctors,
    selectedSlot,
    symptoms,
    name,
    email,
    mobNo,
    consultationType,
    consultationTypes,
    openSnackBar,
    snackBarMessage,
    severity,
    isLoading,
    consultationprice,
    slotEmpty,
    timeSelection,
    serviceType,
    services,
    serviceTypeId,
  };

  const setter = {
    setSymptoms,
    setName,
    setEmail,
    setMobNo,
    setSelectedDate,
    setServiceType,
    setServiceTypeId,
  };

  // All functions that use state, update to use appointmentState
  const fetchSlots = async () => {
    const formattedDate = appointmentState.selectedDate
      ? appointmentState.selectedDate.toISOString()
      : new Date().toISOString();
    const doctorId = appointmentState.selectedDoctorId;
    const response = await fetch(
      `/api/slots/fetchSlot/?doctor=${doctorId}&date=${formattedDate}`
    );
    const data = await response.json();
    if (data.success) {
      setAvailableSlots(data.data);
      {
        data.data.length == 0 ? setSlotEmpty(true) : setSlotEmpty(false);
      }
    } else {
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    const getServices = async () => {
      await getServiceOffered({ dispatch });
    };
    getServices();
  }, []);

  useEffect(() => {
    const { serviceParam } = router.query;
    if (typeof serviceParam === "string") {
      setServiceType(
        services.map((service) => {
          if (service.name.trim().includes(serviceParam.trim()))
            return service.name;
        })
      );
    }
  }, [router.query]);

  useEffect(() => {
    const fetchConsultationFees = async () => {
      const storedConsultations = sessionStorage.getItem(
        sessionStorageName.ConsultationFee
      );
      let consultationFees;
      if (storedConsultations && storedConsultations !== "null") {
        consultationFees = JSON.parse(storedConsultations);
        if (Array.isArray(consultationFees) && consultationFees.length > 0) {
          setConsultationTypes(consultationFees);
          setConsultationPrice(consultationFees[0].fee);
        } else {
          consultationFees = null;
        }
      }
      if (!consultationFees) {
        const response = await fetch(api.consiltationFee, {
          method: "GET",
          cache: "no-cache",
        });
        consultationFees = await response.json();
        setConsultationTypes(consultationFees);
        setConsultationPrice(consultationFees[0].fee);
        sessionStorage.setItem(
          sessionStorageName.ConsultationFee,
          JSON.stringify(consultationFees)
        );
      }
      processSavedLabel(consultationFees);
    };

    const processSavedLabel = (consultationFees) => {
      const savedLabel = sessionStorage.getItem("selectedLabel");
      if (
        savedLabel &&
        Array.isArray(consultationFees) &&
        consultationFees.length > 0
      ) {
        const matchingConsultation = consultationFees.find(
          (consultation) => consultation.name === savedLabel
        );
        if (matchingConsultation) {
          setConsultationType(matchingConsultation.name);
          setConsultationPrice(matchingConsultation.fee);
        }
      }
    };

    fetchConsultationFees();
  }, []);

  useEffect(() => {
    if (appointmentState.selectedDoctorId && appointmentState.selectedDate) {
      fetchSlots();
    }
  }, [appointmentState.selectedDoctorId, appointmentState.selectedDate]);

  useEffect(() => {
    if (!(doctors > 0)) {
      fetchDoctors(dispatch, setDoctors, setIsDoctorLoading);
    }
  }, []); // Empty dependency array ensures the effect runs only once

  const handleDoctorChoiceChange = (event) => {
    const choice = event.target.value;
    setDoctorChoice(choice);
    if (choice === "any") {
      setSelectedDoctorId("");
    }
    setShowDatePicker(timeSelection === CHOOSE_TIME && choice === "any");
  };

  const handleDoctorSelection = (event) => {
    const selectedId = event.target.value;
    setSelectedDoctorId(selectedId);
    const selectedDoctor = filteredDoctors.find(
      (doctor) => doctor._id === selectedId
    );
    if (selectedDoctor) {
      setDoctorName(selectedDoctor.name);
      setDoctorMobileNumber(selectedDoctor.mobileNumber);
    }
  };

  const handleTimeSelection = (event) => {
    const timeChoice = event.target.value;
    setAppointmentTime(timeChoice);
    setTimeSelection(timeChoice);
    setShowDatePicker(timeChoice === CHOOSE_TIME && doctorChoice === "any");
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConsultationChange = (event) => {
    const selectedType = event.target.value;
    const matchingConsultation = consultationTypes.find(
      (consultation) => consultation.name === selectedType
    );
    if (matchingConsultation) {
      setConsultationType(matchingConsultation.name);
      setConsultationPrice(matchingConsultation.fee);
    }
    filterDoctors(selectedType);
  };

  const filterDoctors = (selectedOption) => {
    const type = consultationTypeMapping[selectedOption];
    const filtered = doctors.filter((doctor) => {
      if (type === "Call" || type === "Video") {
        return doctor.consultationType.includes(type);
      }
      if (type === "Clinic") {
        return doctor.consultationType.includes(type);
      }
      return doctor.consultationType === "Home visit";
    });
    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    if (doctors) {
      filterDoctors(consultationType);
    }
  }, [doctors]);

  useEffect(() => {
    if (timeSelection === CHOOSE_TIME && doctorChoice === "any") {
      const slots = generateSlotsForChooseTime(selectedDate, 8, 23, 20);
      setLocallyCreatedSlots(slots);
    }
  }, [selectedDate, timeSelection]);

  const handleOpenSnackBar = () => {
    setOpenSnackBar(true);
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const handleShowDialog = (msg) => {
    setMessage(msg);
    setBookingResponse(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMessage("");
  };

  useEffect(() => {
    if (selectedSlot) {
      const currentTime = new Date();
      const slotStartTime = new Date(selectedSlot.startTime);
      const timeDifference =
        Math.abs(slotStartTime - currentTime) / (1000 * 60);
      const durationIn20Min = timeDifference <= 20;
      if (durationIn20Min) {
        setAppointmentTime(IN_TWENTY_MINUTES_NOW);
      } else {
        setAppointmentTime(CHOOSE_TIME);
      }
    }
  }, [selectedSlot]);

  const sendWhatsAppConfirmation = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !mobNo.trim() ||
      !symptoms.trim() ||
      !consultationType.trim() ||
      appointmentTime === ""
    ) {
      setSnackBarMessage("All fields are required.");
      handleOpenSnackBar();
      return;
    }
    if (!isMobileValid(mobNo)) {
      setSnackBarMessage("Please enter 10 digit in mobile number");
      handleOpenSnackBar();
      return;
    }
    setOtpConfirmationPopup(true);
    setAvailableSlotsFromServer(true);
  };

  const consultationData = {
    selectedDoctorId,
    appointmentTime,
    selectedDate,
    selectedSlot,
    symptoms,
    name,
    doctorName,
    doctorMobileNumber,
    email,
    patientMobNo: mobNo,
    consultationprice,
    consultationType,
    serviceType,
  };

  const bookConsultation = async () => {
    try {
      const response = await bookConsultationApiCall({
        consultationData,
        setIsLoading,
      });
      const data = await response.json();
      const message = data.message;
      const nextSlots = data.nextSlots;
      const status = data.status;
      // const status = message
      if (status === SERVER_AVAILABLE_SLOTS_CODE) {
        setOpenAvailableSlotsFromServer(true);
        setAvailableSlotsFromServer(nextSlots);
        setNoSLotAvailableMessage(message);
        return;
      }
      if (response.ok) {
        handleShowDialog(message.message);
      } else {
        const errorData = await response.json();
        setSnackBarMessage(errorData.message || "Failed to book consultation.");
        handleOpenSnackBar();
      }
    } catch (err) {
      setSnackBarMessage("An error occurred. Please try again.");
      handleOpenSnackBar();
    } finally {
      setIsLoading(false);
    }
  };

  const selectNextAvailableSlot = async (slot) => {
    setSelectedSlot(slot);
  };

  const onBookNextAvailableSlot = async () => {
    bookConsultation();
  };

  const whatsappConfrimation = () => {
    setOtpConfirmationPopup(false);
    console.log("OTP confirmed, proceeding with booking");
    bookConsultation();
  };

  return (
    <div id="" className="wide-60">
      <div className="container-fluid">
        <div className="row d-flex justify-content-center align-item-center">
          {/* SERVICE DETAILS */}
          <AppointmentForm
            appointmentState={appointmentState}
            setter={setter}
            handleDoctorChoiceChange={handleDoctorChoiceChange}
            handleDoctorSelection={handleDoctorSelection}
            handleTimeSelection={handleTimeSelection}
            handleSlotSelection={handleSlotSelection}
            handleConsultationChange={handleConsultationChange}
            sendWhatsAppConfirmation={sendWhatsAppConfirmation}
            handleCloseSnackBar={handleCloseSnackBar}
          />

          {/* common health concern treatment */}
          <div className="w-75 w-md-100">
            <CommonHealthConcerns />
          </div>

          <div>
            <Demo5Doctors1 />
          </div>

          <div className="w-100 d-flex justify-content-center">
            <HowItWorks />
          </div>
          <div className="w-100">
            <Statistic1 />
          </div>

          <div>
            <BenefitSection />
          </div>

          <div>
            <FaqSection />
          </div>

          {/* END SIDEBAR */}
          <AppointmentBookingModal
            isOpen={bookingResponse}
            onClose={() => setBookingResponse(false)}
          >
            <div className={styles.successMessage}>
              <Image
                alt="success_response"
                src={"/images/success.png"}
                width={100}
                height={100}
              />
              <div className={`${styles.successText} mt-3`}>Thank you!</div>
              <div className={styles.successText}>{message}</div>
            </div>
          </AppointmentBookingModal>
          <AvailableSlotsModel
            isOpen={openAvailableSlotsFromServer}
            onClose={() => setOpenAvailableSlotsFromServer(false)}
          >
            <AvailableSlots
              slots={availableSlotsFromServer}
              selectSlot={selectNextAvailableSlot}
              onBookSlot={onBookNextAvailableSlot}
              message={noSLotAvailableMessage}
            />
          </AvailableSlotsModel>
          <WhatsappConfirmationModel
            isOpen={otpConfirmationPopup}
            onClose={() => setOtpConfirmationPopup(false)}
          >
            <OtpConfirmationPopup
              mobile={mobNo}
              onConfirm={whatsappConfrimation}
            />
          </WhatsappConfirmationModel>
        </div>
        {/* End row */}
      </div>
      {isLoading ? <Preloader /> : ""}
      {/* End container */}
    </div>
  );
};

export default AppointmentPage;
