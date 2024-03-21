import { signIn } from "next-auth/react";
import { contact_no } from "./constant";
import axios from 'axios';



export const loginUser = async ({ email, password }) => {
  console.log("login user console");
  const res = await signIn("credentials", {
    redirect: false,
    email,
    password,
  });

  return res;
};

export async function loginDoctor(credentials) {
  try {
    // Make a POST request to your backend login route
    const response = await axios.post("/api/doctorLogin", credentials);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response.data.message || "An error occurred.",
    };
  }
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
