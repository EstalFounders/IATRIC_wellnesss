import { dbConnect } from "../../../src/lib/db";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../src/models/userModel";
import Doctor from "../../../src/models/doctorModel";
import {
  getRequestOrigin,
  getSameSiteOrigin,
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
 * `${origin-from-NEXTAUTH_URL}${relativePath}`. When NEXTAUTH_URL is stale (it
 * was `http://localhost:3000` in .env.production) both login and logout sent the
 * browser to localhost. Here the origin comes from the live request
 * (`x-forwarded-host` / `Host`, see src/lib/appOrigin.js) with the configured
 * URL as fallback, same-site targets are re-anchored to it, absolute URLs are
 * only honoured when they point at this deployment, and there is no hardcoded
 * fallback.
 *
 * The result must stay an ABSOLUTE URL: next-auth's own client parses it with
 * `new URL(data.url)` for credentials sign-in (`next-auth/react/index.js`), so a
 * relative path throws `Failed to construct 'URL': Invalid URL` in the browser.
 * `baseUrl` is next-auth's detected origin, used only as a last resort.
 */
const buildOptions = (requestOrigin) => ({
  ...options,
  callbacks: {
    ...options.callbacks,
    redirect: ({ url, baseUrl }) => {
      const origin = getSameSiteOrigin({ requestOrigin, fallbackOrigin: baseUrl });

      const relative = toRelativePath(url, { requestOrigin });
      if (relative) return `${origin}${relative}`;

      if (isTrustedRedirectUrl(url, { requestOrigin })) return url;

      return `${origin}/`;
    },
  },
});

export default function handler(req, res) {
  return NextAuth(buildOptions(getRequestOrigin(req)))(req, res);
}
