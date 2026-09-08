import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db/mongodb';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
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
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim()?.toLowerCase();
        const password = credentials?.password as string;
        const name = (credentials?.name as string) || email?.split('@')[0];

        if (!email) return null;

        try {
          await connectToDatabase();

          // Query user from MongoDB
          let user = await User.findOne({ email }).select('+passwordHash');

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

          // Register new user dynamically in MongoDB if credentials provided
          const hashedPassword = password ? await hashPassword(password) : undefined;
          user = await User.create({
            name: name || 'Scholar User',
            email,
            passwordHash: hashedPassword,
            role: 'student',
          });

          // Ensure UserProfile exists for newly registered user
          await UserProfile.findOneAndUpdate(
            { userId: user._id.toString() },
            {
              userId: user._id.toString(),
              targetGoal: 'Full Stack Architect',
              experienceLevel: 'Intermediate',
              dailyCommitmentMinutes: 30,
              learningPreferences: ['code-first', 'theoretical-monographs'],
              streakDays: 1,
              xp: 100,
              overallMastery: 10,
              completedQuestionsToday: 0,
              totalQuestionsTargetToday: 5,
              currentTopicId: 'js-event-loop',
              theme: 'light',
            },
            { upsert: true, returnDocument: 'after' }
          );

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
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
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string) || '';
        (session.user as any).role = (token.role as string) || 'student';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow redirects to onboarding and dashboard
      if (url.startsWith(`${baseUrl}/onboarding`) || url.startsWith(`${baseUrl}/dashboard`)) {
        return url;
      }
      // Default to dashboard for relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.AUTH_SECRET,
});
