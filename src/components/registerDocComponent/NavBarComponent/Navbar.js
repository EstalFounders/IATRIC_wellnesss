// components/Navbar.js
import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import styles from "./Navbar.module.css";
import { IconContext } from "react-icons";
import Link from "next/link";
import { SidebarData } from "./SideBarData";
import { Col, Row } from "react-bootstrap";
import { color_schema } from "../../../constant";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: "#ffff" }}>
        <div className={styles.navbar}>
          <div className={styles["menu-bars"]}>
            <FaIcons.FaBars
              color={color_schema.green}
              size={30}
              onClick={showSidebar}
              className="ml-2"
            />
          </div>
        </div>
        <nav
          className={
            sidebar
              ? `${styles["nav-menu"]} ${styles.active}`
              : styles["nav-menu"]
          }
        >
          <ul className={styles["nav-menu-items"]} onClick={showSidebar}>
            <li className={styles["navbar-toggle"]}>
              <div className={styles["menu-bars"]}>
                <AiIcons.AiOutlineClose size={20} className="ml-4" />
              </div>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={`${item.cName}`}>
                  <Link href={item.path}>
                    <div className={`mt-5 m-4 border-bottom`}>
                      {item.icon}
                      <span className={styles.span}>{item.title}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
