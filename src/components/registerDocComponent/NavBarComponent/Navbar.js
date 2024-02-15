// components/Navbar.js
import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import styles from "./Navbar.module.css";
import { IconContext } from "react-icons";
import Link from "next/link";
import { SidebarData } from "./SideBarData";
import { Col, Row } from "react-bootstrap";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: "#ffff" }}>
        <div className={styles.navbar}>
          <div className={styles["menu-bars"]}>
            <FaIcons.FaBars
              color="#000000"
              size={30}
              onClick={showSidebar}
              className="ml-4 border"
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
                <AiIcons.AiOutlineClose />
              </div>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <Col className="mt-3 ml-4">
                  <Row>
                    <Col>
                      <Link className={styles.span} href={item.path}>
                        {item.title}
                      </Link>
                    </Col>
                    <Col>{item.icon}</Col>
                  </Row>
                </Col>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
