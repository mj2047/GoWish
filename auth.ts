import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/username";
import { generateUniquePublicShareSlug } from "@/lib/slug";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Allows sign-in when the app is reached via a LAN IP (e.g. testing on a
  // phone) instead of localhost — Auth.js otherwise rejects unrecognized hosts.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: {}, // email, phone, or username
        password: {},
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: identifier }, { username: identifier }],
          },
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          image: user.profilePhotoUrl ?? undefined,
          username: user.username,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      const OAUTH_PROVIDERS = new Set(["google", "facebook"]);
      if (!account || !OAUTH_PROVIDERS.has(account.provider)) return true;
      if (!user.email) return false;

      let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!dbUser) {
        const username = await generateUniqueUsername(user.email.split("@")[0]);
        const publicShareSlug = await generateUniquePublicShareSlug(username);
        dbUser = await prisma.user.create({
          data: {
            name: user.name || username,
            username,
            email: user.email,
            profilePhotoUrl: user.image ?? null,
            publicShareSlug,
          },
        });
      }

      user.id = dbUser.id;
      (user as { username?: string }).username = dbUser.username;
      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
