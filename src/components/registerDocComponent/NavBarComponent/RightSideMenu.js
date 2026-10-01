// Dropdown.js
import React, { useState } from "react";
import { FiCircle } from "react-icons/fi";
import styles from "./RightSideMenu.module.css";
import { FaAngleDown } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { doctor_info_local_storage, single_call } from "../../../constant";

const Dropdown = ({
  user,
  onLogout,
  handleShowModel,
  handleShowLeaveReqestModel,
  handleShowManageSlotsModel,
}) => {
  console.log(user, "doctor name on right side menu");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (item) => {
    console.log(`Clicked on ${item}`);
    if (item == "Profile") handleShowModel();
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
        <strong>{user ? user.user.name.split(" ")[0] : null}</strong>
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
