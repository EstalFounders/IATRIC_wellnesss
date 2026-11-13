import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  invoice_img_path,
  prescription_img_path,
} from "./constant";
import { storage } from "../lib/firebase";
import { v4 as uuidv4 } from "uuid";

/**
 * `JSON.parse` for values that come back from storage or the URL. An unreadable
 * blob there is normal (older build wrote another shape, another tab cleared it,
 * private mode quota) and must never take a page down - a bare `JSON.parse` throws
 * `SyntaxError: Unexpected token u in JSON at position 0` for a missing key,
 * because `getItem` returned `null` and got stringified into "null"... only
 * `JSON.parse(null)` returns null, an empty string or a half-written value throws.
 *
 * @param {*} raw - the raw string (or anything else) to parse
 * @param {*} [fallback] - returned when parsing fails; defaults to null
 */
export const safeJsonParse = (raw, fallback = null) => {
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
};

export const animation = () => {
  if (typeof window !== "undefined") {
    try {
      // Safely load and initialize WOW.js to prevent environment crashes
      const WOWJS = require("wowjs");
      new WOWJS.WOW({ live: false, mobile: true }).init();
    } catch (error) {
      console.error("Failed to initialize WOW.js animation:", error);
    }
  }
};

export const stickyNav = () => {
  if (typeof window === "undefined") return;
  
  let offset = window.scrollY;
  const stickys = document.querySelectorAll(".header");
  for (let i = 0; i < stickys.length; i++) {
    const sticky = stickys[i];
    if (sticky) {
      if (offset > 60) {
        sticky.classList.add("stricky-fixed");
      } else {
        sticky.classList.remove("stricky-fixed");
      }
    }
  }
};

// The mobile-menu stylesheet (public/css/menu.css, max-width: 991px) sets
// `html { overflow: hidden }` and `body { overflow-y: auto }`, so on phones the
// page scroller is <body>, not the window. Anything that only calls
// window.scrollTo() - including Next.js' own scroll-to-top on navigation - is a
// no-op there, which is why a new page used to keep the previous scroll offset.
export const scrollPageToTop = () => {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  if (document.body) document.body.scrollTop = 0;
};

// scrollIntoView() walks every ancestor scroll container, so it also works when
// <body> is the scroller. `hash` may be passed with or without the leading "#".
export const scrollToAnchor = (hash, behavior = "smooth") => {
  if (typeof document === "undefined") return;
  const id = String(hash || "").replace(/^#/, "");
  const target = id && document.getElementById(id);
  if (target) target.scrollIntoView({ behavior, block: "start" });
};

export const aTagClick = () => {
  const aTag = document.querySelectorAll("[href='#']");
  for (let i = 0; i < aTag.length; i++) {
    const a = aTag[i];
    a.addEventListener("click", (e) => {
      e.preventDefault();
    });
  }
};

export const dataImage = () => {
  let d = document.querySelectorAll("[data-bg]");
  for (let i = 0; i < d.length; i++) {
    const element = d[i];
    element.style.backgroundImage = `url(${element.getAttribute("data-bg")})`;
  }
};

export const pagination = (listClass, sort, active) => {
  let list = document.querySelectorAll(listClass);
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (active === 1) {
      if (i < sort) {
        element.classList.remove("d-none");
      } else {
        element.classList.add("d-none");
      }
    } else {
      if (i >= (active - 1) * sort && i < active * sort) {
        element.classList.remove("d-none");
      } else {
        element.classList.add("d-none");
      }
    }
  }
};

export const getPagination = (totalNumber, sort) => {
  let arr = new Array(Math.ceil(totalNumber / sort))
    .fill()
    .map((_, idx) => idx + 1);
  return arr;
};

export const sendPrescriptionToFirebase = async (file, details) => {
  const storageRef = ref(
    storage,
    `${prescription_img_path}/patient=${details.patientName},doctor=${
      details.doctorName
    }_${uuidv4()}`
  );
  const metadata = {
    contentType: file.type || "application/pdf",
  };
  const snapshot = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};

export const sendInvoiceToFirebase = async (file, invoiceNumber) => {
  console.log(invoiceNumber, "invoice no", file, "file");
  const storageRef = ref(
    storage,
    `${invoice_img_path}/invoiceNo=${invoiceNumber}_${uuidv4()}`
  );
  const metadata = {
    contentType: file.type || "application/pdf",
  };
  const snapshot = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};