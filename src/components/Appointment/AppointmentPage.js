import React, { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  api,
  CHOOSE_TIME,
  IN_TWENTY_MINUTES_NOW,
  SERVER_AVAILABLE_SLOTS_CODE,
  sessionStorageName,
  imageBlurDataUrl,
  superAdminConsultationtype,
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
  SYSTEM_CONSULTATION_TYPES,
  toConsultationTypeEntries,
  typeKeyFor,
} from "../../utils/consultationFee";
import AvailableSlotsModel from "./modal/AvailableSlotsModel";
import AvailableSlots from "./AvailableSlots";
import BookingStepModal from "./modal/BookingStepModal";
import AppointmentDetailsStep from "./AppointmentDetailsStep";
import BookingPaymentStep from "./BookingPaymentStep";
import OtpConfirmationPopup from "./OtpConfirmationPopup";
import { IS_NOW } from "../../../pages/api/utils/constants";
import AppointmentForm from "./Appointmentform";
import { normalizeReturnPaymentStatus } from "../../lib/paymentStatus";
import { useDoctors } from "../../customUtils/useDoctors";
import { useGlobalData } from "../../customUtils/useGlobalData";
import { matchesServiceOffered } from "../filterbar/filterDoctors";
import { useDispatch, useSelector } from "react-redux";
import {
  bookConsultationApiCall,
  getServiceOffered,
} from "../ApiService/BookConsultationApiCall";
import Demo5Doctors1 from "../../components/Demo-5/Demo5Doctors1";
import HowItWorks from "./common/HowItsWorks";
import FaqSection from "./common/FAQComponent";
import { useLanguage } from "../../i18n/LanguageContext";
import CommonHealthConcerns from "./CommonHealthConcern";
import { scrollToAnchor } from "../../utils";

// The consultation types the panel defines (src/constant.js) and the only ones
// that are bookable, in that order. A serviceOffered row becomes an option only
// when its name resolves to one of these keys; the label stays the constant name
// because the booking API switches on exactly these values.
const CONSULTATION_TYPE_NAMES = superAdminConsultationtype.map(
  (type) => type.name,
);

const specialityKey = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

/**
 * The speciality a doctor is filed under.
 *
 * `/timetable` and the "Book Consultation" doctor cards land on this page with
 * only `?doctorId=` (plus a `date`/`time` pair), so nothing but the doctor record
 * itself says which speciality the booking belongs to. Its `serviceOffered` is the
 * same field the details dropdown lists, so the first entry that is an actual
 * option there is the answer - matched case-insensitively and returned in the
 * dropdown's casing, because a `<select>` only shows a value that equals its
 * option text exactly.
 *
 * Consultation types share the same field and are skipped (they are never
 * speciality options), as are free-text names the panel does not offer. "" means
 * "no opinion" - the patient keeps whatever they picked or still has to pick one.
 */
const specialityForDoctor = (doctor, specialityNames = []) => {
  const canonical = new Map();
  (specialityNames || []).forEach((name) => {
    const key = specialityKey(name);
    if (key && !canonical.has(key)) canonical.set(key, String(name).trim());
  });
  if (!canonical.size) return "";

  const offered = Array.isArray(doctor?.serviceOffered)
    ? doctor.serviceOffered
    : [];

  for (const entry of offered) {
    const name = typeof entry === "string" ? entry : entry?.name;
    const key = specialityKey(name);
    if (!key || !canonical.has(key)) continue;
    // `typeKeyFor` slugs anything it does not know, so compare against the
    // system keys instead of testing it for truthiness.
    if (
      SYSTEM_CONSULTATION_TYPES.some((type) => type.key === typeKeyFor(name))
    ) {
      continue;
    }
    return canonical.get(key);
  }

  return "";
};

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

  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12),
  );
};

const AppointmentPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  // The super-admin console books on behalf of a customer, so it gets the form
  // only - the public /appointment page keeps the marketing sections below.
  const isAdminBooking = router.asPath.includes(
    "/superAdmin/bookConsultationFromAdmin",
  );
  // State variables
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
  const { doctors } = useDoctors();
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [name, setName] = useState("");
  const [mobNo, setMobNo] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState();
  const [consultationType, setConsultationType] = useState("");
  // Speciality is a required choice and also narrows the doctor list, so it is
  // owned here (not inside the form) - the booking guard below has to see it.
  const [speciality, setSpeciality] = useState("");
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
  // The booking runs as a four-step sequence and this string is the single
  // pointer to where the patient is:
  //   "contact" -> the card above (name + mobile)
  //   "otp"     -> step 2, mobile verification modal
  //   "details" -> step 3, speciality/doctor/date/time modal
  //   "payment" -> step 4, summary + secure payment modal
  // Every value the steps edit stays in this component, so closing or moving
  // between steps never loses what was already typed.
  const [bookingStep, setBookingStep] = useState("contact");
  const [timeSelection, setTimeSelection] = useState(IS_NOW);
  const [serviceType, setServiceType] = useState("");
  const [pendingPayment, setPendingPayment] = useState(null);
  // Identifies the body of the appointment that `pendingPayment` belongs to. It
  // lets "Proceed to Pay" reuse an appointment that was already created (the
  // patient went Back to edit something and came forward again) instead of
  // booking a second, duplicate appointment - and forces a fresh booking when a
  // booking-relevant field actually changed.
  const pendingBookingSignatureRef = useRef("");
  // Every slot fetch is stamped with the request it belongs to. A slow reply that
  // arrives after the patient already switched doctor/date is dropped instead of
  // repopulating the list with rows that belong to the previous choice.
  const slotsRequestRef = useRef(0);

  // Anchor + one-shot flag for the deep-link scroll (?doctorId=...): once the
  // doctor has been preselected, the page smooth-scrolls to the booking form.
  const appointmentFormRef = useRef(null);
  const didAutoScrollRef = useRef(false);

  // Optional `?date=YYYY-MM-DD&time=HH:MM` pair handed over by the weekly
  // timetable ("Book an Appointment" on `/timetable`). Both halves are IST, so
  // the slot below can be looked up by rebuilding the instant (+05:30, no DST).
  const deepLinkDate =
    typeof router.query.date === "string" ? router.query.date.trim() : "";
  const deepLinkTime =
    typeof router.query.time === "string" ? router.query.time.trim() : "";

  // Services come from the globalData slice (single source of truth, serviceOffered
  // MAJOR items) - populated by getServiceOffered below / fetchBasicConfiguration.
  const services = useSelector((state) => state.globalData?.services || []);
  // The speciality dropdown's own option list: `specialityForDoctor` only returns
  // names that exist here, so the select always has a matching option.
  const { specialityNames } = useGlobalData();

  // Consultation fees come from two levels, and the form shows the level it
  // books:
  //   * "Any Doctor" -> the fee of the matching serviceOffered row
  //                     (Audio / Video / Home visit / Clinic)
  //   * a doctor     -> that doctor's own price for the type
  //                     (doctor.consultationType holds [{ name, price }])
  // serviceOffered also holds non-consultation MAJOR items (lab tests, packages),
  // so only rows resolving to a type from src/constant.js are offered, in the
  // constant order.
  const activeServices = (Array.isArray(services) ? services : []).filter(
    (service) => service && service.isActive !== false,
  );

  const serviceForType = (typeName) => {
    const key = typeKeyFor(typeName);
    if (!key) return null;
    return (
      activeServices.find((service) => typeKeyFor(service.name) === key) ||
      activeServices.find((service) =>
        typeKeyFor(service.name).includes(key),
      ) ||
      null
    );
  };

  const serviceConsultationOptions = CONSULTATION_TYPE_NAMES.map((typeName) => {
    const service = serviceForType(typeName);
    return service ? { name: typeName, fee: service.fee } : null;
  }).filter(Boolean);

  const selectedDoctor = (doctors || []).find(
    (doctor) => String(doctor._id) === String(selectedDoctorId),
  );

  // A doctor's own types/prices, limited to the constant types. A type the doctor
  // left unpriced falls back to the serviceOffered fee, so the tile never shows a
  // mode with no amount next to a tile that does.
  const doctorConsultationOptionsFor = (doctor) => {
    if (!doctor) return [];

    const entries = toConsultationTypeEntries(doctor.consultationType);

    return CONSULTATION_TYPE_NAMES.map((typeName) => {
      const key = typeKeyFor(typeName);
      const entry = entries.find((item) => typeKeyFor(item.name) === key);
      if (!entry) return null;

      const serviceFee = serviceForType(typeName)?.fee;
      const fee =
        entry.price === null || entry.price === undefined
          ? serviceFee
          : entry.price;

      // Keep "" (rather than 0) when nothing is priced anywhere: the tile then
      // shows just the mode name and the API resolves the stored fee.
      return {
        name: typeName,
        fee: fee === undefined || fee === null ? "" : fee,
      };
    }).filter(Boolean);
  };

  const doctorConsultationOptions =
    doctorConsultationOptionsFor(selectedDoctor);

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

    const match = consultationOptions.find(
      (option) => typeKeyFor(option.name) === typeKeyFor(requested),
    );
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
    agreedToTerms,
    name,
    mobNo,
    consultationType,
    speciality,
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
    setAgreedToTerms,
    setName,
    setMobNo,
    setSpeciality,
    // Date picks go through here: a slot picked on the previous day is not
    // bookable on the new one, and the "when" must follow the reset.
    setSelectedDate: (date) => {
      setSelectedDate(date);
      setSelectedSlot("");
      setAppointmentTime(timeSelection);
    },
    setServiceType,
    setServiceTypeId,
    setConsultationPrice,
  };

  // All functions that use state, update to use appointmentState
  const fetchSlots = async () => {
    const requestId = slotsRequestRef.current + 1;
    slotsRequestRef.current = requestId;
    const formattedDate = appointmentState.selectedDate
      ? appointmentState.selectedDate.toISOString()
      : new Date().toISOString();
    const doctorId = appointmentState.selectedDoctorId;
    // Drop the previous doctor's/day's times immediately: keeping them on screen
    // until the reply lands is what let a stale row be picked and posted.
    setAvailableSlots([]);
    const response = await fetch(
      `/api/slots/fetchSlot/?doctor=${doctorId}&date=${formattedDate}`,
    );
    const data = await response.json();
    // Out-of-order reply: a newer fetch has started since this one was sent.
    if (slotsRequestRef.current !== requestId) return;
    if (data.success) {
      const rows = Array.isArray(data.data) ? data.data : [];
      // Stamp every row with the doctor/day it was fetched for, so the rendered
      // list can be checked against the form instead of trusting fetch timing.
      setAvailableSlots(
        rows.map((slot) => ({
          ...slot,
          doctorId: String(slot.doctorId || doctorId || ""),
          slotDate: formattedDate,
        })),
      );
      setSlotEmpty(rows.length === 0);
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
    const {
      serviceParam,
      appointmentId: orderIdFromReturn,
      payment_status: returnPaymentStatus,
      status: returnStatus,
    } = router.query;
    if (typeof serviceParam === "string") {
      const matched = services.find((service) =>
        service.name
          ?.trim()
          .toLowerCase()
          .includes(serviceParam.trim().toLowerCase()),
      );
      if (matched) {
        setServiceType(matched.name);
      }
    }
    // Returned from Cashfree checkout (our server return_url appends the Cashfree order_id as ?appointmentId=<orderId>).
    // Open the PaymentModal in verify-only mode so it auto-polls the backend status.
    if (typeof orderIdFromReturn === "string" && orderIdFromReturn.trim()) {
      const single = (value) => (Array.isArray(value) ? value[0] : value);
      setPendingPayment({
        appointmentId: null,
        amount: consultationprice,
        consultationType,
        autoVerifyOrderId: orderIdFromReturn,
        // A dismissed/failed checkout carries its status back in the URL - the
        // modal must show that instead of polling an order that stays ACTIVE.
        initialStatus: normalizeReturnPaymentStatus(
          single(returnPaymentStatus) || single(returnStatus),
        ),
      });
      // Clean the query param so refresh doesn't re-trigger
      const cleanQuery = { ...router.query };
      delete cleanQuery.appointmentId;
      router.replace(
        { pathname: router.pathname, query: cleanQuery },
        undefined,
        {
          shallow: true,
        },
      );
      // The verify-only checkout is the payment step of the sequence.
      setBookingStep("payment");
    }
  }, [router.query]);

  useEffect(() => {
    if (appointmentState.selectedDoctorId && appointmentState.selectedDate) {
      fetchSlots();
    }
  }, [appointmentState.selectedDoctorId, appointmentState.selectedDate]);

  const handleDoctorChoiceChange = (event) => {
    const choice = event.target.value;
    setDoctorChoice(choice);
    if (choice === "any") {
      setSelectedDoctorId("");
      // The doctor that was picked (and the slot that belonged to them) must not
      // be posted: the API books exactly what the form shows.
      setDoctorName("");
      setDoctorMobileNumber("");
      setSelectedSlot("");
      // Back to the generic serviceOffered consultation options (the four types
      // from src/constant.js).
      const first = serviceConsultationOptions[0];
      setConsultationType(first ? first.name : "");
      setConsultationPrice(first ? first.fee || "" : "");
      // `serviceType` (the posted/stored copy) needs no reset here: the effect
      // below re-syncs it from `speciality`, which is what the dropdown shows.
    }
    setShowDatePicker(timeSelection === CHOOSE_TIME && choice === "any");
  };

  // Selects a doctor by id (shared by the dropdown and the ?doctorId route param).
  const applyDoctorSelection = (selectedId) => {
    if (!selectedId) return;
    const selectedDoctor =
      filteredDoctors.find(
        (doctor) => String(doctor._id) === String(selectedId),
      ) || doctors.find((doctor) => String(doctor._id) === String(selectedId));
    if (!selectedDoctor) return;

    setSelectedDoctorId(selectedDoctor._id);
    setDoctorChoice("specific");
    setDoctorName(selectedDoctor.name);
    setDoctorMobileNumber(selectedDoctor.mobileNumber);
    // A slot chosen for the previous doctor is not theirs to book.
    setSelectedSlot("");

    // Show this doctor's own consultation types with their prices and
    // preselect the first one so the selected tile + fee stay in sync.
    const options = doctorConsultationOptionsFor(selectedDoctor);
    const first = options[0];
    setConsultationType(first ? first.name : "");
    setConsultationPrice(first ? first.fee || "" : "");

    // Speciality follows the doctor. A deep link (`?doctorId=…`, e.g. the weekly
    // timetable) arrives here with the select still empty, and this is the only
    // moment the doctor record is at hand, so the appointment would otherwise be
    // saved without one. A speciality the patient picked by hand is kept when the
    // doctor offers it (the dropdown is filtered by that choice); anything else is
    // replaced, because switching doctors means switching field.
    const doctorSpeciality = specialityForDoctor(
      selectedDoctor,
      specialityNames,
    );

    if (
      doctorSpeciality &&
      (!speciality || !matchesServiceOffered(selectedDoctor, speciality))
    ) {
      setSpeciality(doctorSpeciality);
      // `serviceType` is the posted/persisted field and only mirrors the dropdown
      // on a change event, which this programmatic pick never fires.
      setServiceType(doctorSpeciality);
    }
  };

  /**
   * Safety net for the speciality: the doctor roster and the speciality options
   * hydrate independently (redux-persist first paint vs. the serviceOffered
   * request), so a doctor preselect can land before the option list is known and
   * leave the field empty. Fill it as soon as both sides are known - and only
   * while it is still empty, so a value the patient picked or edited is never
   * overwritten.
   */
  useEffect(() => {
    if (speciality || !selectedDoctorId) return;

    const doctor = [...filteredDoctors, ...doctors].find(
      (item) => String(item._id) === String(selectedDoctorId),
    );
    const resolved = specialityForDoctor(doctor, specialityNames);
    if (!resolved) return;

    setSpeciality(resolved);
    setServiceType(resolved);
  }, [speciality, selectedDoctorId, doctors, filteredDoctors, specialityNames]);

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

  // Pre-select the speciality passed in the URL (?speciality=<name>), e.g. the
  // "Book Now" CTA on a service tab (`Tabs1`). The value has to equal an option
  // of the details dropdown exactly, so it is resolved against `specialityNames`
  // (that list supplies the options) and consultation types - which also appear
  // there but are not specialities - are skipped. Only an empty field is filled:
  // a speciality the patient picked, or one derived from `?doctorId=`, wins.
  useEffect(() => {
    const requested =
      typeof router.query.speciality === "string"
        ? router.query.speciality.trim()
        : "";
    if (!requested || speciality) return;

    const isConsultationType = SYSTEM_CONSULTATION_TYPES.some(
      (type) => type.key === typeKeyFor(requested),
    );
    if (isConsultationType) return;

    const key = specialityKey(requested);
    const match = (specialityNames || []).find(
      (name) => specialityKey(name) === key,
    );
    if (!match) return;

    setSpeciality(match);
    // `serviceType` is the posted/persisted field and only mirrors the dropdown
    // on a change event, which this programmatic pick never fires.
    setServiceType(match);
  }, [router.query.speciality, specialityNames, speciality]);

  /**
   * The dropdown owns the speciality; `serviceType` is only the copy that gets
   * posted and stored. Every programmatic path (URL param, doctor preselect, "Any
   * Doctor" reset) has to leave the two identical - otherwise the appointment is
   * saved with a speciality the patient is not looking at, and the "Any Doctor"
   * search on the server is scoped to that leftover value. `?service=` (legacy,
   * serviceType only) keeps working because an empty speciality is never touched.
   */
  useEffect(() => {
    if (!speciality) return;
    if (serviceType !== speciality) setServiceType(speciality);
  }, [speciality, serviceType]);

  // Once the deep-linked doctor has actually been preselected, smooth-scroll to
  // the booking form so the user does not have to scroll manually after landing.
  useEffect(() => {
    const doctorIdFromQuery =
      typeof router.query.doctorId === "string"
        ? router.query.doctorId.trim()
        : "";
    if (!doctorIdFromQuery || !selectedDoctorId || didAutoScrollRef.current)
      return;
    if (String(selectedDoctorId) !== String(doctorIdFromQuery)) return;

    didAutoScrollRef.current = true;
    appointmentFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [router.query.doctorId, selectedDoctorId]);

  // Deep link to the booking form (`/appointment#appointment-form`, e.g. the "Book
  // Now" CTA on the health-concern cards). The browser's own hash scrolling is not
  // reliable here because <body> is the page scroller on phones (see
  // scrollPageToTop in src/utils), so the target is scrolled into view explicitly
  // once the page has painted. `block: "start"` + `scroll-margin-top` keep the
  // card's top edge just inside the viewport.
  useEffect(() => {
    if (router.asPath.split("#")[1] !== "appointment-form") return;
    const frame = requestAnimationFrame(() =>
      scrollToAnchor("appointment-form"),
    );
    return () => cancelAnimationFrame(frame);
  }, [router.asPath]);

  const handleTimeSelection = (event) => {
    const timeChoice = event.target.value;
    setAppointmentTime(timeChoice);
    setTimeSelection(timeChoice);
    // Leaving "Choose time" invalidates the slot picked in that mode.
    if (timeChoice !== CHOOSE_TIME) {
      setSelectedSlot("");
    }
    setShowDatePicker(timeChoice === CHOOSE_TIME && doctorChoice === "any");
  };

  // Landing with a slot from the timetable: open "Choose time" on that day so
  // the slot grid (and the preselection below) belongs to it. Noon UTC is the
  // same calendar day everywhere within +/-12h, and it is the anchor
  // `fetchSlot` buckets by (see `todayAtNoonUTC`).
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deepLinkDate)) return;
    const day = new Date(`${deepLinkDate}T12:00:00Z`);
    if (Number.isNaN(day.getTime())) return;

    setTimeSelection(CHOOSE_TIME);
    setAppointmentTime(CHOOSE_TIME);
    setShowDatePicker(false);
    setSelectedDate(day);
  }, [deepLinkDate]);

  // Re-applies whenever the slot grid is rebuilt (the doctor's real rows replace
  // the generic grid once they are fetched), but only once per list, so a slot
  // the patient then picks by hand is not overridden.
  const deepLinkListRef = useRef(null);
  useEffect(() => {
    // The timetable always sends `doctorId` too: wait until that doctor is
    // actually selected, otherwise the generic grid would be matched against.
    if (!selectedDoctorId) return;
    if (!deepLinkDate || !deepLinkTime) return;
    if (deepLinkListRef.current === locallyCreatedSlots) return;

    const wanted = new Date(
      `${deepLinkDate}T${deepLinkTime}:00+05:30`,
    ).getTime();
    if (Number.isNaN(wanted)) return;

    const match = locallyCreatedSlots.find(
      (slot) => new Date(slot.startTime).getTime() === wanted,
    );
    if (!match) return;

    deepLinkListRef.current = locallyCreatedSlots;
    setSelectedSlot(match);
  }, [selectedDoctorId, deepLinkDate, deepLinkTime, locallyCreatedSlots]);

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  /**
   * A fetched slot row carries the doctor and the day it was fetched for (added in
   * `fetchSlots`). Rows generated in the browser ("Any Doctor" grid, the weekly
   * timetable deep link) carry no stamp and are left to the server's own checks.
   */
  const slotMatchesForm = (slot) => {
    if (!slot || typeof slot !== "object") return true;
    if (
      slot.doctorId &&
      selectedDoctorId &&
      String(slot.doctorId) !== String(selectedDoctorId)
    ) {
      return false;
    }
    const formDate = selectedDate instanceof Date ? selectedDate.toISOString() : "";
    if (slot.slotDate && formDate && slot.slotDate !== formDate) return false;
    return true;
  };

  const handleConsultationChange = (event) => {
    const selectedType = event.target.value;
    const matching = consultationOptions.find(
      (opt) => opt.name === selectedType,
    );
    if (matching) {
      setConsultationType(matching.name);
      setConsultationPrice(matching.fee || "");
    }
    filterDoctors(selectedType);

    // The doctor dropdown only lists doctors that offer the selected type. When
    // the current choice is not one of them, the form goes back to "Any Doctor" -
    // exactly what the dropdown already shows - instead of posting a doctor the
    // patient can no longer see under a fee that was just replaced.
    if (selectedDoctorId) {
      const key = typeKeyFor(selectedType);
      const stillOffered = (doctors || []).some(
        (doctor) =>
          String(doctor._id) === String(selectedDoctorId) &&
          consultationTypeNames(doctor.consultationType).some(
            (name) => typeKeyFor(name) === key,
          ),
      );

      if (!stillOffered) {
        setSelectedDoctorId("");
        setDoctorChoice("any");
        setDoctorName("");
        setDoctorMobileNumber("");
        setSelectedSlot("");
        const serviceMatch = serviceConsultationOptions.find(
          (option) => typeKeyFor(option.name) === key,
        );
        if (serviceMatch) {
          setConsultationPrice(serviceMatch.fee || "");
        }
      }
    }
  };

  const filterDoctors = (selectedOption) => {
    const key = typeKeyFor(selectedOption);
    const filtered = doctors.filter((doctor) =>
      consultationTypeNames(doctor.consultationType).some(
        (name) => typeKeyFor(name) === key,
      ),
    );
    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    if (doctors) {
      filterDoctors(consultationType);
    }
  }, [doctors]);

  useEffect(() => {
    if (timeSelection !== CHOOSE_TIME) return;

    // A named doctor has a real 20-minute grid stored in `slots`: list those rows
    // (unbooked, not finished yet) instead of the generic 8-23 grid, otherwise
    // the slot picked on the timetable could not be listed - or booked - here.
    if (selectedDoctorId) {
      const now = Date.now();
      const formDate = selectedDate instanceof Date ? selectedDate.toISOString() : "";
      setLocallyCreatedSlots(
        (availableSlots || [])
          .filter(
            (slot) =>
              !slot.isBooked &&
              new Date(slot.endTime).getTime() > now &&
              // Only rows fetched for *this* doctor and *this* day; a row left
              // over from the previous choice must never be selectable.
              (!slot.doctorId ||
                String(slot.doctorId) === String(selectedDoctorId)) &&
              (!slot.slotDate || !formDate || slot.slotDate === formDate),
          )
          .map((slot) => ({
            _id: String(slot._id),
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false,
            doctorId: slot.doctorId,
            slotDate: slot.slotDate,
          })),
      );
      return;
    }

    const slots = generateSlotsForChooseTime(selectedDate, 8, 23, 20);
    setLocallyCreatedSlots(slots);
  }, [selectedDate, timeSelection, selectedDoctorId, availableSlots]);

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

  // Validation messages are shown in the small Alert that every step renders
  // (the card and the modals share `openSnackBar`/`snackBarMessage`).
  const showBookingAlert = (msg) => {
    setSnackBarMessage(msg);
    handleOpenSnackBar();
  };

  /**
   * Step 1 -> Step 2: the only fields on the card are the name and the mobile
   * number, so this guard validates exactly those before the OTP modal opens.
   */
  const handleContactContinue = () => {
    if (!name.trim()) {
      showBookingAlert(t("af.errName"));
      return;
    }
    if (!mobNo.trim() || !isMobileValid(mobNo)) {
      showBookingAlert(t("ap.errMobile"));
      return;
    }
    setBookingStep("otp");
  };

  /**
   * Step 2 -> Step 3: the mobile number is verified, nothing is booked yet.
   */
  const handleOtpVerified = () => {
    setBookingStep("details");
  };

  // Identifies what a booking POST would send. Used to decide whether the
  // appointment already created for the payment step is still the right one.
  const bookingSignature = () =>
    [
      selectedDoctorId,
      appointmentTime,
      consultationType,
      selectedDate instanceof Date ? selectedDate.toISOString() : "",
      selectedSlot?._id || "",
      name.trim(),
      mobNo.trim(),
    ].join("|");

  /**
   * Step 3 -> Step 4: validates the appointment details, then creates the
   * appointment (unchanged POST /api/consultation payload - see
   * `consultationData` + `bookConsultation`) and opens the payment step.
   *
   * The payment step is opened first so the modal can show its "preparing"
   * state while the request is in flight; a refusal puts the patient back on
   * the details step with the server's message.
   */
  const handleProceedToPay = async () => {
    if (isLoading) return;
    // Checked first: "All fields are required." would not tell the patient which
    // dropdown still needs a value.
    if (!speciality.trim()) {
      showBookingAlert(t("af.selectSpecialityError"));
      return;
    }
    if (!consultationType.trim() || appointmentTime === "") {
      showBookingAlert(t("ap.errFields"));
      return;
    }
    if (timeSelection === CHOOSE_TIME && !selectedSlot) {
      showBookingAlert(t("ap.errSlot"));
      return;
    }
    // The slot must still belong to the doctor and the day shown on the form. A
    // doctor/date switch can leave a row from the previous fetch selected, and
    // posting it would try to lock another doctor's slot (or the wrong day) for
    // the fee on screen - the server then answers "slot already booked".
    if (
      timeSelection === CHOOSE_TIME &&
      selectedSlot &&
      !slotMatchesForm(selectedSlot)
    ) {
      setSelectedSlot("");
      showBookingAlert(t("ap.errSlot"));
      return;
    }
    if (!agreedToTerms) {
      showBookingAlert(t("ap.errTerms"));
      return;
    }

    const signature = bookingSignature();
    // Already booked for exactly this input: reuse it instead of posting a
    // second appointment (create-order is idempotent per appointment id).
    if (
      pendingPayment?.appointmentId &&
      pendingBookingSignatureRef.current === signature
    ) {
      setBookingStep("payment");
      return;
    }

    // Anything else is a new booking - never pay for an appointment whose
    // doctor/slot was edited in the meantime.
    setPendingPayment(null);
    pendingBookingSignatureRef.current = "";
    setBookingStep("payment");

    const booked = await bookConsultation();
    if (booked) {
      pendingBookingSignatureRef.current = signature;
    } else {
      setBookingStep("details");
    }
  };

  const consultationData = {
    selectedDoctorId,
    appointmentTime,
    selectedDate,
    selectedSlot,
    name,
    doctorName,
    doctorMobileNumber,
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
      // A refusal (validation, no doctor free, ...) answers with a message but no
      // appointment. Opening the payment modal on a missing id showed a checkout
      // for a booking that was never created.
      if (!data.appointmentId) {
        setSnackBarMessage(
          data.message || "All doctor are busy right now, No slot is available",
        );
        handleOpenSnackBar();
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
    const slotDoctorId = slot.doctorId
      ? String(slot.doctorId)
      : selectedDoctorId;
    const knownDoctor = [...filteredDoctors, ...doctors].find(
      (doctor) => String(doctor._id) === slotDoctorId,
    );
    const alternativeDoctorName =
      slot.doctorName || knownDoctor?.name || doctorName || "";
    const alternativeDoctorMobile =
      slot.doctorMobileNumber ||
      knownDoctor?.mobileNumber ||
      doctorMobileNumber ||
      "";
    const alternativeDate = new Date(slot.startTime);
    // A slot card can belong to a doctor other than the one on the form, and this
    // path posts immediately - React state set here would not be part of the
    // request. The speciality therefore travels as an override, resolved from the
    // slot's own doctor (falls back to the patient's pick when the doctor record is
    // not loaded or offers nothing the dropdown knows).
    const alternativeSpeciality =
      specialityForDoctor(knownDoctor, specialityNames) || speciality;

    // `appointmentTime: CHOOSE_TIME` + the explicit `selectedSlot` tell the API to
    // lock this slot instead of searching for one "now".
    const booked = await bookConsultation({
      selectedDoctorId: slotDoctorId,
      doctorName: alternativeDoctorName,
      doctorMobileNumber: alternativeDoctorMobile,
      appointmentTime: CHOOSE_TIME,
      selectedSlot: slot,
      selectedDate: alternativeDate,
      serviceType: alternativeSpeciality,
    });

    if (booked) {
      // Keep the form in sync with what was just booked before the payment step
      // takes over.
      setSelectedDoctorId(slotDoctorId);
      setDoctorName(alternativeDoctorName);
      setDoctorMobileNumber(alternativeDoctorMobile);
      setSpeciality(alternativeSpeciality);
      setServiceType(alternativeSpeciality);
      setSelectedSlot(slot);
      setSelectedDate(alternativeDate);
      setAppointmentTime(CHOOSE_TIME);
      setTimeSelection(CHOOSE_TIME);
      setOpenAvailableSlotsFromServer(false);
      // This booking was made from a slot card, not from the details step, so it
      // gets its own signature (an edit there would force a fresh booking).
      pendingBookingSignatureRef.current = "";
      setBookingStep("payment");
    }
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
          {/* `w-100`: the wrapper is a flex item of the row, so without a width the
              card sized to its content and a long line (e.g. the "no doctor for
              this speciality" hint) widened the whole form. */}
          <div
            id="appointment-form"
            ref={appointmentFormRef}
            className="w-100 d-flex justify-content-center"
          >
            <AppointmentForm
              appointmentState={appointmentState}
              setter={setter}
              handleContactContinue={handleContactContinue}
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

          {/* Same flex-item trap as the form wrapper above: this is a direct child
              of the row, so without an explicit width AND a shrinkable min-width
              it sizes to the card strip's max-content, the strip's own
              `overflow-x:auto` never overflows and phones cannot swipe it. */}
          <div className="w-100 appointment-concerns-wrap">
            <CommonHealthConcerns />
          </div>

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
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                alt="success_response"
                src={"/images/success.png"}
                width={100}
                height={100}
              />
              <div className={`${styles.successText} mt-3`}>Thank you!</div>
              <div className={styles.successText}>{message}</div>
            </div>
          </AppointmentBookingModal>
          {/* Step 2 — OTP verification. The card above stays mounted, so the
              name/mobile (and every other value) survive a close/back. */}
          <BookingStepModal
            isOpen={bookingStep === "otp"}
            step={2}
            onClose={() => setBookingStep("contact")}
            title={t("af.otpTitle")}
            subtitle={t("af.otpSubtitle")}
          >
            <OtpConfirmationPopup
              mobile={mobNo}
              name={name}
              showHeading={false}
              onConfirm={handleOtpVerified}
              onBack={() => setBookingStep("contact")}
            />
          </BookingStepModal>

          {/* Step 3 — appointment details (speciality, doctor, date, time). */}
          <BookingStepModal
            isOpen={bookingStep === "details"}
            step={3}
            size="lg"
            onClose={() => setBookingStep("contact")}
            title={t("af.detailsTitle")}
            subtitle={t("af.detailsSubtitle")}
          >
            <AppointmentDetailsStep
              appointmentState={appointmentState}
              setter={setter}
              doctors={doctors}
              handleDoctorChoiceChange={handleDoctorChoiceChange}
              handleDoctorSelection={handleDoctorSelection}
              handleTimeSelection={handleTimeSelection}
              handleSlotSelection={handleSlotSelection}
              handleConsultationChange={handleConsultationChange}
              handleCloseSnackBar={handleCloseSnackBar}
              onBack={() => setBookingStep("contact")}
              onProceed={handleProceedToPay}
            />
          </BookingStepModal>

          {/* Step 4 — secure payment (the booking summary is shown on /payment/thankyou). */}
          <BookingStepModal
            isOpen={bookingStep === "payment"}
            step={4}
            onClose={() => {
              // Never drop a booking that is still being created; otherwise go
              // back to the details step (the pending appointment is reused).
              if (!isLoading) setBookingStep("details");
            }}
            title={t("af.paymentTitle")}
            subtitle={t("af.paymentSubtitle")}
          >
            <BookingPaymentStep
              appointmentState={appointmentState}
              pendingPayment={pendingPayment}
              isLoading={isLoading}
              onBack={() => {
                // Return to the details modal; the PENDING appointment is kept
                // and reused when the input did not change (see
                // `pendingBookingSignatureRef`).
                if (!isLoading) setBookingStep("details");
              }}
              onBookAgain={() => {
                // "Book again" on a cancelled checkout starts a fresh sequence,
                // so the abandoned appointment is not reused by mistake.
                if (!isLoading) {
                  setPendingPayment(null);
                  pendingBookingSignatureRef.current = "";
                  setBookingStep("contact");
                }
              }}
              onPaymentDone={() => {
                setMessage(t("ap.confirmed"));
                setBookingResponse(true);
                setPendingPayment(null);
                pendingBookingSignatureRef.current = "";
                setBookingStep("contact");
              }}
            />
          </BookingStepModal>

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
        </div>
        {/* End row */}
      </div>
      {isLoading ? <Preloader /> : ""}
      {/* End container */}
    </div>
  );
};

export default AppointmentPage;
