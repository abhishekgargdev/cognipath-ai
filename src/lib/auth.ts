import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db/mongodb';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { verifyPassword } from '@/lib/auth/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim();
        const password = credentials?.password as string;

        if (!email) return null;

        try {
          await connectToDatabase();

          // Query user from MongoDB
          const user = await User.findOne({ email }).select('+passwordHash');

          if (user) {
            // Verify password if user has passwordHash set
            if (user.passwordHash && password) {
              const isValid = await verifyPassword(password, user.passwordHash);
              if (!isValid) {
                console.warn(`[Auth.js] Password verification failed for ${email}`);
                return null;
              }
            }

            return {
              id: user._id.toString(),
              name: user.name || 'Scholar User',
              email: user.email,
              image: user.image,
              role: user.role || 'student',
            };
          }

          // Fallback demo user if DB user not yet created
          return {
            id: 'demo-user-id',
            name: 'Scholar Candidate (Demo)',
            email,
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'student',
          };
        } catch (error) {
          console.error('[Auth.js] Credentials authorize error:', error);
          return null;
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      try {
        await connectToDatabase();
        const existingProfile = await UserProfile.findOne({ userId: user.id });
        if (!existingProfile) {
          await UserProfile.create({
            userId: user.id,
            targetGoal: 'Full Stack Architect',
            experienceLevel: 'Intermediate',
            dailyCommitmentMinutes: 30,
            learningPreferences: ['code-first', 'theoretical-monographs'],
            streakDays: 0,
            xp: 0,
            overallMastery: 0,
            completedQuestionsToday: 0,
            totalQuestionsTargetToday: 5,
            currentTopicId: 'js-event-loop',
            theme: 'light',
          });
        }
      } catch (error) {
        console.error('[Auth.js] Failed to create user profile on createUser event:', error);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'student';
      }
      return token;
    },
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id || (token?.id as string) || token?.sub || 'demo-user-id';
        (session.user as any).role = (user as any)?.role || (token?.role as string) || 'student';
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.AUTH_SECRET,
});
