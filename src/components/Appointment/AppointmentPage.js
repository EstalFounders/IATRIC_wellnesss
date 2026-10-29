import React, { useEffect, useRef, useState } from "react";
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
import {
  consultationTypeNames,
  toConsultationTypeEntries,
  typeKeyFor,
} from "../../utils/consultationFee";
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

  // Anchor + one-shot flag for the deep-link scroll (?doctorId=...): once the
  // doctor has been preselected, the page smooth-scrolls to the booking form.
  const appointmentFormRef = useRef(null);
  const didAutoScrollRef = useRef(false);

  // Services come from the globalData slice (single source of truth, serviceOffered
  // MAJOR items) - populated by getServiceOffered below / fetchBasicConfiguration.
  const services = useSelector((state) => state.globalData?.services || []);

  // No-doctor ("Any Doctor") baseline: the consultation services that exist in
  // serviceOffered (Audio/Video today) and their fees.
  const serviceConsultationOptions = (Array.isArray(services) ? services : [])
    .filter((s) =>
      CONSULTATION_SERVICE_NAMES.some(
        (name) => s.name && s.name.toLowerCase().includes(name.toLowerCase())
      )
    )
    .map((s) => ({ name: s.name, fee: s.fee }));

  // When a specific doctor is selected, the boxes show that doctor's own
  // consultation types and prices instead of the generic serviceOffered fees.
  const selectedDoctor = doctors.find(
    (doctor) => String(doctor._id) === String(selectedDoctorId)
  );
  const doctorConsultationOptions = selectedDoctor
    ? toConsultationTypeEntries(selectedDoctor.consultationType).map(
        (entry) => ({ name: entry.name, fee: entry.price })
      )
    : [];

  const consultationOptions = selectedDoctorId
    ? doctorConsultationOptions
    : serviceConsultationOptions;

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
      // Back to the generic serviceOffered consultation options (Audio/Video).
      const first = serviceConsultationOptions[0];
      setConsultationType(first ? first.name : "");
      setConsultationPrice(first ? first.fee || "" : "");
    }
    setShowDatePicker(timeSelection === CHOOSE_TIME && choice === "any");
  };

  // Selects a doctor by id (shared by the dropdown and the ?doctorId route param).
  const applyDoctorSelection = (selectedId) => {
    if (!selectedId) return;
    const selectedDoctor =
      filteredDoctors.find(
        (doctor) => String(doctor._id) === String(selectedId)
      ) ||
      doctors.find((doctor) => String(doctor._id) === String(selectedId));
    if (!selectedDoctor) return;

    setSelectedDoctorId(selectedDoctor._id);
    setDoctorChoice("specific");
    setDoctorName(selectedDoctor.name);
    setDoctorMobileNumber(selectedDoctor.mobileNumber);

    // Show this doctor's own consultation types with their prices and
    // preselect the first one so the selected tile + fee stay in sync.
    const options = toConsultationTypeEntries(
      selectedDoctor.consultationType
    ).map((entry) => ({ name: entry.name, fee: entry.price }));
    const first = options[0];
    setConsultationType(first ? first.name : "");
    setConsultationPrice(first ? first.fee || "" : "");
  };

  const handleDoctorSelection = (event) => {
    applyDoctorSelection(event.target.value);
  };

  // Pre-select the doctor passed in the URL (?doctorId=<id>) once the doctor
  // list has loaded, e.g. landing from a doctor card's "Book Consultation".
  useEffect(() => {
    const doctorIdFromQuery =
      typeof router.query.doctorId === "string"
        ? router.query.doctorId.trim()
        : "";
    if (!doctorIdFromQuery || !doctors || doctors.length === 0) return;
    if (String(selectedDoctorId) === String(doctorIdFromQuery)) return;
    applyDoctorSelection(doctorIdFromQuery);
  }, [router.query.doctorId, doctors]);

  // Once the deep-linked doctor has actually been preselected, smooth-scroll to
  // the booking form so the user does not have to scroll manually after landing.
  useEffect(() => {
    const doctorIdFromQuery =
      typeof router.query.doctorId === "string"
        ? router.query.doctorId.trim()
        : "";
    if (!doctorIdFromQuery || !selectedDoctorId || didAutoScrollRef.current) return;
    if (String(selectedDoctorId) !== String(doctorIdFromQuery)) return;

    didAutoScrollRef.current = true;
    appointmentFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [router.query.doctorId, selectedDoctorId]);

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
    const key = typeKeyFor(selectedOption);
    const filtered = doctors.filter((doctor) =>
      consultationTypeNames(doctor.consultationType).some(
        (name) => typeKeyFor(name) === key
      )
    );
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

  /**
   * Creates the appointment and hands the patient over to the payment gateway.
   *
   * `overrides` is what makes the fallback slot cards bookable: they must send
   * the slot the patient just clicked, and React state updates are asynchronous -
   * posting the render-time `consultationData` would re-run the server's "Now"
   * search and answer with the same alternative-slot list again (the slot would
   * never be booked).
   *
   * Returns true once an appointment exists and the payment modal is opening.
   */
  const bookConsultation = async (overrides = {}) => {
    try {
      const response = await bookConsultationApiCall({
        consultationData: { ...consultationData, ...overrides },
        setIsLoading,
      });
      const data = await response.json();
      if (data.status === SERVER_AVAILABLE_SLOTS_CODE) {
        // Nothing free today (or the slot was taken while this modal was open):
        // show the server's next available slots.
        setAvailableSlotsFromServer(data.nextSlots || []);
        setNoSLotAvailableMessage(data.message);
        setOpenAvailableSlotsFromServer(true);
        return false;
      }
      // Payment gate: the appointment is PENDING until payment is verified by
      // the backend. Open the payment modal.
      setPendingPayment({
        appointmentId: data.appointmentId,
        amount: data.amount,
        consultationType,
      });
      return true;
    } catch (err) {
      console.error("Booking failed:", err);
      setSnackBarMessage("An error occurred. Please try again.");
      handleOpenSnackBar();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * "Book" on one of the alternative slots returned for a "Now" request: books
   * exactly that slot and goes straight to the payment gateway - same booking
   * call and same checkout as a normal booking, with no calendar/OTP detour.
   */
  const handleBookAlternativeSlot = async (slot) => {
    const slotDoctorId = slot.doctorId ? String(slot.doctorId) : selectedDoctorId;
    const knownDoctor = [...filteredDoctors, ...doctors].find(
      (doctor) => String(doctor._id) === slotDoctorId
    );
    const alternativeDoctorName =
      slot.doctorName || knownDoctor?.name || doctorName || "";
    const alternativeDoctorMobile =
      slot.doctorMobileNumber || knownDoctor?.mobileNumber || doctorMobileNumber || "";
    const alternativeDate = new Date(slot.startTime);

    // `appointmentTime: CHOOSE_TIME` + the explicit `selectedSlot` tell the API to
    // lock this slot instead of searching for one "now".
    const booked = await bookConsultation({
      selectedDoctorId: slotDoctorId,
      doctorName: alternativeDoctorName,
      doctorMobileNumber: alternativeDoctorMobile,
      appointmentTime: CHOOSE_TIME,
      selectedSlot: slot,
      selectedDate: alternativeDate,
    });

    if (booked) {
      // Keep the form in sync with what was just booked before the payment modal
      // takes over.
      setSelectedDoctorId(slotDoctorId);
      setDoctorName(alternativeDoctorName);
      setDoctorMobileNumber(alternativeDoctorMobile);
      setSelectedSlot(slot);
      setSelectedDate(alternativeDate);
      setAppointmentTime(CHOOSE_TIME);
      setOpenAvailableSlotsFromServer(false);
    }
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
          <div ref={appointmentFormRef}>
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
          </div>

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
              onBookSlot={handleBookAlternativeSlot}
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