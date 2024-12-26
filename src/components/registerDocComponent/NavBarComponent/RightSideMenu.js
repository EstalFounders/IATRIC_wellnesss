// Dropdown.js
import { signOut } from "next-auth/react";
import React, { useState } from 'react';
import { FiCircle } from 'react-icons/fi';
import styles from './RightSideMenu.module.css';
import { FaAngleDown } from 'react-icons/fa';

const Dropdown = ({user}) => {
  console.log(user, 'doctor name on right side menu')
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (item) => {
    console.log(`Clicked on ${item}`);
    if(item == 'logout') 
    try {
        await signOut();
        // Additional logic after successful sign-out
        router.push("/registerDoc/login"); // Redirect to the login screen
      } catch (error) {
        console.error("Error during sign-out:", error);
      }
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles['dropdown-toggle']} onClick={toggleDropdown}>
      <strong>{user.user.name.split(' ')[0]}</strong>
      <FaAngleDown size={20}  className={styles['arrow-icon']} /> 
      </div>

      {isOpen && (
        <div className={styles['dropdown-menu']}>
          <div className={styles['dropdown-item']} onClick={() => handleItemClick('item1')}>
            Item 1
          </div>
          <div className={styles['dropdown-item']} onClick={() => handleItemClick('item2')}>
            Item 2
          </div>
          <div className={styles['dropdown-item']} onClick={() => handleItemClick('item3')}>
            Item 3
          </div>
          <div className={styles['dropdown-item']} onClick={() => handleItemClick('logout')}>
            Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
