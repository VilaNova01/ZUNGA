import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email ou Telefone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const identifier = credentials.email.trim();
        // Try email first, then phone
        let user = await prisma.user.findUnique({ where: { email: identifier } });
        if (!user) {
          user = await prisma.user.findUnique({ where: { phone: identifier } });
        }
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        if (user.status === 'SUSPENDED') throw new Error('Conta suspensa.');
        // NextAuth requires a non-null email; use phone as fallback for phone-only accounts
        return { id: user.id, name: user.name, email: user.email ?? user.phone ?? user.id, role: user.role, isPremium: user.isPremium };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isPremium = (user as any).isPremium;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isPremium = token.isPremium;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
