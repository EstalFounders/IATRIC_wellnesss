import { signIn } from "next-auth/react";
import { api, contact_no } from "./constant";

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
  console.log(email, 'email',password,"password");
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

  




