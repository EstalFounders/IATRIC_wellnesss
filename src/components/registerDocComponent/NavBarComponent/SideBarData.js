import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

export const SidebarData = [
  {
    title: "Home",
    path: "/registerDoc/homepage",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Prescription",
    path: "/registerDoc/prescription",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text",
  },
  {
    title: "Payment",
    path: "/registerDoc/doctorEarnings",
    icon: <IoIcons.IoIosWallet />,
    cName: "nav-text",
  },
  {
    title: "Contract",
    path: "/registerDoc/prescription",
    icon: <IoIcons.IoMdClipboard />,
    cName: "nav-text",
  },
  
];
