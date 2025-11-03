import { dbConnect } from "../../../src/lib/db";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../src/models/userModel";
import Doctor from "../../../src/models/doctorModel";

const options = {
  providers: [
    CredentialsProvider({
      id: "superAdmin-credentials",
      name: "SuperAdmin Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect().catch((err) => {
          throw new Error(err);
        });

        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
    CredentialsProvider({
      id: "doctor-credentials",
      name: "Doctor Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect().catch((err) => {
          throw new Error(err);
        });
        const user = await Doctor.findOne({
          email: credentials?.email,
        }).select("+password");
        if (!user) {
          throw new Error("Invalid credentials");
        }
        console.log(user, "user in server");
        const isPasswordCorrect = credentials.password === user.password;

        if (isPasswordCorrect) {
          console.log("Password is correct");
        } else {
          console.log("Password is incorrect");
        }

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: {
      superAdmin: "/superAdmin/onload",
      doctor: "/doctor/login",
    },
  },
  session: false,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};

export default NextAuth(options);
