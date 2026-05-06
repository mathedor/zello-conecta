import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/entrar',
    error: '/entrar',
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      const t = token as { role?: string; kycStatus?: string };
      if (t.role) {
        (session.user as { role?: string }).role = t.role;
      }
      if (t.kycStatus) {
        (session.user as { kycStatus?: string }).kycStatus = t.kycStatus;
      }
      return session;
    },
  },
  trustHost: true,
};
