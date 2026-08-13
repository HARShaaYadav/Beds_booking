/**
 * Mock Authentication Module
 * 
 * IMPORTANT: This is a mock authentication system for development/demonstration purposes.
 * In production, replace this with a proper authentication system like:
 * - NextAuth.js (https://next-auth.js.org/)
 * - Auth0 (https://auth0.com/)
 * - Clerk (https://clerk.dev/)
 * - AWS Cognito
 * - Firebase Auth
 * 
 * The current implementation uses a hardcoded user ID.
 * This is NOT secure for production use.
 */

// Mock user ID for development
export const MOCK_USER_ID = 'mock-user-id';

/**
 * Get current user ID
 * In production, this would:
 * 1. Check the session/cookie
 * 2. Verify the JWT token
 * 3. Return the authenticated user's ID
 * 4. Throw error if not authenticated
 */
export function getCurrentUserId(): string {
  // TODO: Replace with real authentication
  // Example with NextAuth:
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) throw new Error('Unauthorized');
  // return session.user.id;
  
  return MOCK_USER_ID;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  // TODO: Replace with real authentication check
  return true;
}

/**
 * Get current user details
 * In production, this would fetch from database/session
 */
export async function getCurrentUser() {
  // TODO: Replace with real user fetch
  return {
    id: MOCK_USER_ID,
    name: 'Demo User',
    email: 'demo@hospital.com',
    role: 'RECEPTIONIST',
  };
}
