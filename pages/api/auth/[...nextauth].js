import { dbConnect } from "../../../src/lib/db";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../src/models/userModel";
import Doctor from "../../../src/models/doctorModel";
import {
  getRequestOrigin,
  isTrustedRedirectUrl,
  toRelativePath,
} from "../../../src/lib/appOrigin";

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

/**
 * Options are built per request so the redirect callback can trust the live
 * request origin (`x-forwarded-host` / `Host`, see src/lib/appOrigin.js)
 * instead of only the configured `NEXTAUTH_URL`.
 *
 * Replaces next-auth's default redirect callback, which returns
 * `${origin-from-NEXTAUTH_URL}${relativePath}` - an *absolute* URL. When
 * NEXTAUTH_URL is stale (it was `http://localhost:3000` in .env.production)
 * both login and logout sent the browser to localhost. Here same-site targets
 * stay relative (the browser resolves them against the domain actually serving
 * the panel), absolute URLs are only honoured when they point at this
 * deployment, and there is no hardcoded fallback.
 */
const buildOptions = (requestOrigin) => ({
  ...options,
  callbacks: {
    ...options.callbacks,
    redirect: ({ url }) => {
      const relative = toRelativePath(url, { requestOrigin });
      if (relative) return relative;

      if (isTrustedRedirectUrl(url, { requestOrigin })) return url;

      return "/";
    },
  },
});

export default function handler(req, res) {
  return NextAuth(buildOptions(getRequestOrigin(req)))(req, res);
}
