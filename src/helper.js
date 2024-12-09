import { signIn } from "next-auth/react";
import { api, contact_no } from "./constant";
import { Pagination } from "react-bootstrap";

export const loginUser = async ({ email, password }) => {
  console.log("login user console");
  const res = await signIn("superAdmin-credentials", {
    redirect: false,
    email,
    password,
  });

  return res;
};

export async function loginDoctor({ email, password }) {
  console.log(email, "email", password, "password");
  const res = await signIn("doctor-credentials", {
    redirect: false,
    email,
    password,
  });

  return res;
}

export const dial = () => {
  window.location.href = `tel:${contact_no}`;
};

export const openSupportWhatsAppWeb = () => {
  // commented and remove phoneNumber from the argument
  // const formattedPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
  const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${contact_no}`;
  window.open(whatsappWebUrl, "_blank");
};

export const convertDateIntoTime = (dateString) => {
  // Create a Date object from the string
  const date = new Date(dateString);

  // Extract the hours and minutes
  const hours = date.getHours().toString().padStart(2, "0"); // Ensure two digits
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Ensure two digits

  // Format the time as HH:MM
  const time = `${hours}:${minutes}`;

  return time;
};

export const convertTimeIntoDate = (dateString) => {
  const [hours, minutes] = dateString.split(":");
  const updatedDate = new Date(); // You can set a specific date here if needed
  updatedDate.setHours(hours, minutes, 0, 0);
  // const formattedDate = updatedDate.toISOString().replace('Z', '+00:00');
  console.log(updatedDate, 'updated date in helper')
  return updatedDate;
};

export const CustomPagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; // Don't render pagination if only one page exists.

  return (
    <Pagination className="justify-content-center mt-4">
      {[...Array(totalPages).keys()].map((_, index) => (
        <Pagination.Item
          key={index}
          active={index + 1 === currentPage}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </Pagination.Item>
      ))}
    </Pagination>
  );
};

