import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { invoice_img_path, prescription_img_path } from "./constant";
import { storage } from "./lib/firebase";
import { v4 as uuidv4 } from "uuid";

export const animation = () => {
  if (typeof window !== "undefined") {
     window.WOW = require("wowjs");
  }
  new WOW.WOW({ live: false, mobile: true }).init();
};
export const stickyNav = () => {
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
  let d = document.querySelectorAll("[data-bg");
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
  console.log(details.patientName, "details");
  const storageRef = ref(
    storage,
    `${prescription_img_path}/patient=${details.patientName},doctor=${
      details.doctorName
    }_${uuidv4()}`
  );
  const metadata = {
    contentType: file.type,
  };
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const sendInvoiceToFirebase = async (file, invoiceNumber) => {
  console.log(invoiceNumber, "invoice no", file, "file");
  const storageRef = ref(
    storage,
    `${invoice_img_path}/invoiceNo=${invoiceNumber}_${uuidv4()}`
  );
  const metadata = {
    contentType: file.type,
  };
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  return url;
};
