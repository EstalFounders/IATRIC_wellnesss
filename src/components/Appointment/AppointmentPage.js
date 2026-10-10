import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  api,
  CHOOSE_TIME,
  consultationTypeMapping,
  IN_TWENTY_MINUTES_NOW,
  SERVER_AVAILABLE_SLOTS_CODE,
  sessionStorageName,
} from "../../constant";
import { generateSlotsForChooseTime, isWithinBusinessHours } from "../helper";
import { useRouter } from "next/router";
import styles from "./css/appointmentPage.module.css";
import Preloader from "../Preloader";
import AppointmentBookingModal from "./modal/AppointmentBookingModal";
import Image from "next/image";
import { isMobileValid } from "../../helper";
import AvailableSlotsModel from "./modal/AvailableSlotsModel";
import AvailableSlots from "./AvailableSlots";
import WhatsappConfirmationModel from "./modal/WhatsappConfirmationModel";
import OtpConfirmationPopup from "./OtpConfirmationPopup";
import PaymentModal from "./PaymentModal";
import { IS_NOW } from "../../../pages/api/utils/constants";
import AppointmentForm from "./Appointmentform";
import { fetchDoctors } from "../ApiService/ConsultationApiService";
import { useDispatch, useSelector } from "react-redux";
import {
  bookConsultationApiCall,
  getServiceOffered,
} from "../ApiService/BookConsultationApiCall";
import Demo5Doctors1 from "../../components/Demo-5/Demo5Doctors1";
import HowItWorks from "./common/HowItsWorks";
import FaqSection from "./common/FAQComponent";

// Consultation types to look for in services data
const CONSULTATION_SERVICE_NAMES = ["Audio", "Video"];

/**
 * Noon UTC of the user's calendar day.
 *
 * `/api/slots/fetchSlot` windows its query around the date it is given
 * (`setUTCHours(0)` .. `setUTCHours(23, 59)`), so the value has to be the UTC day
 * that matches the day the user sees. A plain `new Date()` is wrong early in the
 * morning in IST (e.g. 01:30 IST on the 11th is still the 10th in UTC, so the
 * "today" slots of the 11th were never requested), while UTC *midnight* of that
 * calendar day renders as the previous day west of Greenwich. Noon UTC is the same
 * day everywhere within +/-12h - the same trick `ManageSlotsModal` uses.
 */
const todayAtNoonUTC = () => {
  const now = new Date();

  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
};

const AppointmentPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  // The super-admin console books on behalf of a customer, so it gets the form
  // only - the public /appointment page keeps the marketing sections below.
  const isAdminBooking = router.asPath.includes(
    "/superAdmin/bookConsultationFromAdmin"
  );
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
  const [selectedDate, setSelectedDate] = useState(todayAtNoonUTC);
  const storedDoctors = useSelector((state) => state.allDoctorS.allDoctors);
  const [doctors, setDoctors] = useState(storedDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobNo, setMobNo] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState();
  const [consultationType, setConsultationType] = useState("");
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
  const [serviceType, setServiceType] = useState("");
  const [pendingPayment, setPendingPayment] = useState(null);

  // Services come from the globalData slice (single source of truth, serviceOffered
  // MAJOR items) - populated by getServiceOffered below / fetchBasicConfiguration.
  const services = useSelector((state) => state.globalData?.services || []);

  // Derive consultation options from services filter for Audio/Video
  const consultationOptions = (Array.isArray(services) ? services : [])
    .filter((s) =>
      CONSULTATION_SERVICE_NAMES.some(
        (name) => s.name && s.name.toLowerCase().includes(name.toLowerCase())
      )
    )
    .map((s) => ({ name: s.name, fee: s.fee }));

  // Set initial consultation type based on available options
  useEffect(() => {
    if (consultationOptions.length > 0) {
      if (!consultationType) {
        setConsultationType(consultationOptions[0].name);
        setConsultationPrice(consultationOptions[0].fee || "");
      }
    }
  }, [consultationOptions]);

  // Quick Links sub-pointers ("Book Doctor Consultation" > Audio / Video /
  // Clinic in Header1 / MobileMenu) deep-link as ?type=Audio|Video|Clinic.
  // Preselect the matching consultation tile so the form opens on the requested
  // mode; unknown or unavailable values keep the default tile.
  useEffect(() => {
    const requested =
      typeof router.query.type === "string" ? router.query.type.trim() : "";
    if (!requested) return;

    const match = consultationOptions.find((option) => {
      const name = String(option.name || "").toLowerCase();
      if (name === requested.toLowerCase()) return true;
      const mapped = consultationTypeMapping[requested];
      return Boolean(mapped) && name === String(mapped).toLowerCase();
    });
    if (!match) return;

    setConsultationType(match.name);
    setConsultationPrice(match.fee || "");
  }, [router.query.type, consultationOptions]);

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
    agreedToTerms,
    name,
    email,
    mobNo,
    consultationType,
    consultationOptions,
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
    setAgreedToTerms,
    setName,
    setEmail,
    setMobNo,
    setSelectedDate,
    setServiceType,
    setServiceTypeId,
    setConsultationPrice,
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
  }, [dispatch]);

  useEffect(() => {
    const { serviceParam, appointmentId: orderIdFromReturn } = router.query;
    if (typeof serviceParam === "string") {
      const matched = services.find((service) =>
        service.name?.trim().toLowerCase().includes(serviceParam.trim().toLowerCase())
      );
      if (matched) {
        setServiceType(matched.name);
      }
    }
    // Returned from Cashfree checkout (our server return_url appends the Cashfree order_id as ?appointmentId=<orderId>).
    // Open the PaymentModal in verify-only mode so it auto-polls the backend status.
    if (typeof orderIdFromReturn === "string" && orderIdFromReturn.trim()) {
      setPendingPayment({
        appointmentId: null,
        amount: consultationprice,
        consultationType,
        autoVerifyOrderId: orderIdFromReturn,
      });
      // Clean the query param so refresh doesn't re-trigger
      const cleanQuery = { ...router.query };
      delete cleanQuery.appointmentId;
      router.replace({ pathname: router.pathname, query: cleanQuery }, undefined, {
        shallow: true,
      });
    }
  }, [router.query]);

  useEffect(() => {
    if (appointmentState.selectedDoctorId && appointmentState.selectedDate) {
      fetchSlots();
    }
  }, [appointmentState.selectedDoctorId, appointmentState.selectedDate]);

  useEffect(() => {
    if (!(doctors > 0)) {
      fetchDoctors(dispatch, setDoctors, setIsDoctorLoading);
    }
  }, []);

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
    const matching = consultationOptions.find(
      (opt) => opt.name === selectedType
    );
    if (matching) {
      setConsultationType(matching.name);
      setConsultationPrice(matching.fee || "");
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
    if (timeSelection === CHOOSE_TIME && !selectedSlot) {
      setSnackBarMessage("Please select a time slot.");
      handleOpenSnackBar();
      return;
    }
    if (!agreedToTerms) {
      setSnackBarMessage(
        "Please read and accept the Terms & Conditions to continue."
      );
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
      if (status === SERVER_AVAILABLE_SLOTS_CODE) {
        setOpenAvailableSlotsFromServer(true);
        setAvailableSlotsFromServer(nextSlots);
        setNoSLotAvailableMessage(message);
        return;
      }
      if (response.ok) {
        // Payment gate: the appointment is PENDING until payment is
        // verified by the backend. Open the payment modal.
        setPendingPayment({
          appointmentId: data.appointmentId,
          amount: data.amount,
          consultationType,
        });
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
    bookConsultation();
  };

  return (
    <div
      id=""
      className={`wide-60 ${styles.appointmentWrap}${
        isAdminBooking ? ` ${styles.adminBooking}` : ""
      }`}
    >
      <div className="container-fluid">
        <div className="row d-flex justify-content-center align-item-center">
          {/* SERVICE DETAILS */}
          <AppointmentForm
            appointmentState={appointmentState}
            setter={setter}
            doctors={doctors}
            handleDoctorChoiceChange={handleDoctorChoiceChange}
            handleDoctorSelection={handleDoctorSelection}
            handleTimeSelection={handleTimeSelection}
            handleSlotSelection={handleSlotSelection}
            handleConsultationChange={handleConsultationChange}
            sendWhatsAppConfirmation={sendWhatsAppConfirmation}
            handleCloseSnackBar={handleCloseSnackBar}
          />

          {/* Marketing sections are for the public /appointment page only; the
              super-admin booking screen shows the form and nothing else. */}
          {!isAdminBooking && (
            <div>
              <Demo5Doctors1 />
            </div>
          )}

          {!isAdminBooking && (
            <div className="w-100 d-flex justify-content-center">
              <HowItWorks />
            </div>
          )}

          {!isAdminBooking && (
            <div>
              <FaqSection />
            </div>
          )}

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

          {pendingPayment && (
            <AppointmentBookingModal
              isOpen={!!pendingPayment}
              onClose={() => setPendingPayment(null)}
            >
              <PaymentModal
                appointmentId={pendingPayment.appointmentId}
                amount={pendingPayment.amount}
                consultationType={consultationType}
                autoVerifyOrderId={pendingPayment.autoVerifyOrderId || null}
                onPaymentDone={() => {
                  setMessage("Your consultation has been confirmed.");
                  setBookingResponse(true);
                  setPendingPayment(null);
                }}
                onClose={() => setPendingPayment(null)}
              />
            </AppointmentBookingModal>
          )}
        </div>
        {/* End row */}
      </div>
      {isLoading ? <Preloader /> : ""}
      {/* End container */}
    </div>
  );
};

export default AppointmentPage;