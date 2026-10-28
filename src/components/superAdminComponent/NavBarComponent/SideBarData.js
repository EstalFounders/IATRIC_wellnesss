// SideBarData.js - the drawer of the super-admin panel.
//
// group renders a heading above the first item of each block, so the drawer is
// no longer one flat wall of links; title is Title Case and cName is gone
// because the component styles the rows itself.
import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import {
  MdMedicalServices,
  MdOutlineQueryStats,
  MdUpdate,
} from "react-icons/md";
import { ImLab } from "react-icons/im";
import { BiSolidOffer } from "react-icons/bi";
import { TbFileInvoice } from "react-icons/tb";
import { FaBookMedical } from "react-icons/fa";

export const SidebarData = [
  {
    group: "Overview",
    title: "Home",
    path: "/superAdmin/homepage",
    icon: <AiIcons.AiFillHome />,
  },
  {
    group: "Doctors",
    title: "Add doctor",
    path: "/superAdmin/addDoctor",
    icon: <IoIcons.IoIosPaper />,
  },
  {
    title: "Book consultation",
    path: "/superAdmin/bookConsultationFromAdmin",
    icon: <FaBookMedical />,
  },
  {
    title: "Consultations booked",
    path: "/superAdmin/consultationBooked",
    icon: <FaIcons.FaListAlt />,
  },
  {
    title: "Consultation fee",
    path: "/superAdmin/consultationFee",
    icon: <IoIcons.IoIosPricetags />,
  },
  {
    title: "Update requests",
    path: "/superAdmin/viewAllDoctorUpdateRequest",
    icon: <MdUpdate />,
  },
  {
    title: "Leave requests",
    path: "/superAdmin/viewAllDoctorLeaveRequest",
    icon: <MdUpdate />,
  },
  {
    group: "Staff",
    title: "Manage staff",
    path: "/superAdmin/staff",
    icon: <FaIcons.FaUsers />,
  },
  {
    title: "Add staff member",
    path: "/superAdmin/addStaff",
    icon: <FaIcons.FaUserPlus />,
  },
  {
    group: "Labs",
    title: "Lab tests",
    path: "/superAdmin/labTest",
    icon: <FaIcons.FaCartPlus />,
  },
  {
    title: "Lab tests booked",
    path: "/superAdmin/labTestBooked",
    icon: <FaIcons.FaCartPlus />,
  },
  {
    title: "Add lab",
    path: "/superAdmin/addLab",
    icon: <ImLab />,
  },
  {
    group: "Content and billing",
    title: "Service offered",
    path: "/superAdmin/serviceOffered",
    icon: <MdMedicalServices />,
  },
  {
    title: "Offers",
    path: "/superAdmin/offers",
    icon: <BiSolidOffer />,
  },
  {
    title: "Customer query",
    path: "/superAdmin/customerQuery",
    icon: <MdOutlineQueryStats />,
  },
  {
    title: "Invoice",
    path: "/superAdmin/invoice",
    icon: <TbFileInvoice />,
  },
  {
    title: "Logs",
    path: "/superAdmin/logs",
    icon: <FaIcons.FaListAlt />,
  },
];
