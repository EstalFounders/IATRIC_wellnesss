// DoctorSupportStrip.js
// Small "Need help?" strip that the doctor panel renders as its footer
// (pages/registerDoc/* -> <Layouts header={9} footer={8}>). The super-admin
// pages also pass footer={7} and stay chrome-free - they never render this.
//
// The contacts here are deliberately the STAFF/DOCTOR ones
// (healthpathhr@gmail.com / +91 84485 59925). Anything a patient sees (website,
// printed prescription, invoice) uses `contact_no` / `email` from constant.js,
// which are the customer-care number and address.
import React from "react";
import { MdEmail, MdPhone } from "react-icons/md";
import { staff_support_email, staff_support_no } from "../../constant";
import styles from "./DoctorSupportStrip.module.css";

const DoctorSupportStrip = () => (
  <div className={styles.strip}>
    <span className={styles.text}>
      Need help? For panel issues, document uploads or any team query, reach the
      HealthPath team:
    </span>
    <span className={styles.links}>
      <a className={styles.link} href={`mailto:${staff_support_email}`}>
        <MdEmail size={18} />
        {staff_support_email}
      </a>
      <a
        className={styles.link}
        href={`tel:${staff_support_no.replace(/\s+/g, "")}`}
      >
        <MdPhone size={18} />
        {staff_support_no}
      </a>
    </span>
  </div>
);

export default DoctorSupportStrip;
