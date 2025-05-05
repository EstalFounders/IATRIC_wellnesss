import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { MdOutlineQueryStats, MdUpdate } from "react-icons/md";
import { ImLab } from "react-icons/im";
import { BiSolidOffer } from "react-icons/bi";
import { TbFileInvoice } from "react-icons/tb";

export const SidebarData = [
  {
    title: "HOME",
    path: "/superAdmin/homepage",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "ADD DOCTOR",
    path: "/superAdmin/addDoctor",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text",
  },
  {
    title: "LAB TEST",
    path: "/superAdmin/labTest",
    icon: <FaIcons.FaCartPlus />,
    cName: "nav-text",
  },
  {
    title: "CONSULTATION",
    path: "/superAdmin/consultationFee",
    icon: <IoIcons.IoIosPricetags />,
    cName: "nav-text",
  },
  {
    title: "UPDATE REQUEST",
    path: "/superAdmin/viewAllDoctorUpdateRequest",
    icon: <MdUpdate />,
    cName: "nav-text",
  },
  {
    title: "LEAVE REQUEST",
    path: "/superAdmin/viewAllDoctorLeaveRequest",
    icon: <MdUpdate />,
    cName: "nav-text",
  },
  {
    title: "LAB",
    path: "/superAdmin/addLab",
    icon: <ImLab />,
    cName: "nav-text",
  },
  {
    title: "OFFERS",
    path: "/superAdmin/offers",
    icon: <BiSolidOffer />,
    cName: "nav-text",
  },
  {
    title: "CUSTOMER QUERY",
    path: "/superAdmin/customerQuery",
    icon: <MdOutlineQueryStats />,
    cName: "nav-text",
  },
  {
    title: "INVOICE",
    path: "/superAdmin/invoice",
    icon: <TbFileInvoice />,
    cName: "nav-text",
  },
];
