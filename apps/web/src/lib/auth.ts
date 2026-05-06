import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma, type Role } from '@zello/db';
import { z } from 'zod';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      kycStatus: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: Role;
    kycStatus?: string;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/entrar',
    error: '/entrar',
  },
  providers: [
    Credentials({
      name: 'Email e senha',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status !== 'ACTIVE') return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? null,
          role: user.role,
          kycStatus: user.kycStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        (token as { role?: Role }).role = user.role;
        (token as { kycStatus?: string }).kycStatus = user.kycStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      const t = token as { role?: Role; kycStatus?: string };
      if (t.role) session.user.role = t.role;
      if (t.kycStatus) session.user.kycStatus = t.kycStatus;
      return session;
    },
  },
  trustHost: true,
});
