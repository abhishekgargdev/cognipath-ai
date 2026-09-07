import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db/mongodb';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      id: 'credentials',
      name: 'Demo Account',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || 'demo@cognipath.ai';
        return {
          id: 'demo-user-id',
          name: 'Scholar Candidate (Demo)',
          email,
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
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
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id || token?.sub || 'demo-user-id';
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.AUTH_SECRET,
});
