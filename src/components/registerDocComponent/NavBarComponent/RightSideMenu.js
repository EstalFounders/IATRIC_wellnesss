// Dropdown.js
import React, { useState } from "react";
import { FiCircle } from "react-icons/fi";
import styles from "./RightSideMenu.module.css";
import { FaAngleDown } from "react-icons/fa";
import { signOut } from "next-auth/react";

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
        await signOut({
          callbackUrl: "/registerDoc/login",
          redirect: true,
        });
        // Additional logic after successful sign-out
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
