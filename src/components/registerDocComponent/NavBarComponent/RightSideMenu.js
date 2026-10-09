// Dropdown.js
import React, { useState } from "react";
import { FiCircle } from "react-icons/fi";
import styles from "./RightSideMenu.module.css";
import { FaAngleDown } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { doctor_info_local_storage, single_call } from "../../../constant";
import { doctorShortName } from "../../../utils/doctorName";

const Dropdown = ({
  user,
  onLogout,
  handleShowLeaveReqestModel,
  handleShowManageSlotsModel,
}) => {
  console.log(user, "doctor name on right side menu");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // The panel stores the whole next-auth session (`{ user: <doctor>, expires }`),
  // but a session whose `user` claim is missing (or a blob written by an older
  // build that kept the doctor document at the top level) has no nested doc.
  // Reading `user.user.name` unguarded used to crash EVERY doctor page with
  // "Cannot read properties of undefined (reading 'name')" - same tolerance as
  // readSessionDoctor() in DoctorProfile/lib/doctorProfileSession.js.
  const doctor = user?.user ?? user;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (item) => {
    console.log(`Clicked on ${item}`);
    if (item == "Profile")
      // The dedicated profile page replaced the "Edit Doctor Details" popup, so
      // the header no longer passes a `handleShowModel` callback.
      router.push("/registerDoc/profile");
    if (item == "Manage Slots") handleShowManageSlotsModel();
    if (item == "Leave Request") handleShowLeaveReqestModel();
    if (item == "Logout")
      try {
        // `redirect: false` stops next-auth from sending the browser to the
        // absolute callbackUrl it builds server-side (a stale NEXTAUTH_URL
        // used to make that http://localhost:3000/registerDoc/login).
        await signOut({ redirect: false });
        sessionStorage.removeItem(doctor_info_local_storage);
        sessionStorage.removeItem(single_call);
        // Always a *relative* path: the browser resolves it against the domain
        // that is actually serving the panel.
        window.location.replace("/registerDoc/login");
      } catch (error) {
        console.error("Error during sign-out:", error);
      }
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles["dropdown-toggle"]} onClick={toggleDropdown}>
        <strong>{doctor?.name ? doctorShortName(doctor.name) : null}</strong>
        <FaAngleDown size={20} className={styles["arrow-icon"]} />
      </div>

      {isOpen && (
        <div className={styles["dropdown-menu"]}>
          <div
            className={styles["dropdown-item"]}
            onClick={() => handleItemClick("Profile")}
          >
            Your Profile
          </div>
          <div
            className={styles["dropdown-item"]}
            onClick={() => handleItemClick("Manage Slots")}
          >
            Manage Slots
          </div>
          <div
            className={styles["dropdown-item"]}
            onClick={() => handleItemClick("Leave Request")}
          >
            Leave Request
          </div>
          <div
            className={styles["dropdown-item"]}
            onClick={() => handleItemClick("Logout")}
          >
            Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
