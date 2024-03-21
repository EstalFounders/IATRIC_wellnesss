// pages/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { loginDoctor } from "../../src/helper";
import DoctorLogin from "../../src/components/registerDocComponent/DoctorLogin";
import Layouts from "../../src/layout/Layouts";

export default function Login() {
  return (
    <Layouts header={6} footer={7}>
      <DoctorLogin />
    </Layouts>
  );
}
