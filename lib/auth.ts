/**
 * Enhanced Authentication Utilities with NextAuth.js
 * 
 * This module provides secure session management, user context,
 * and role-based access control for all API routes and components.
 */

import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

/**
 * Get current authenticated session
 * Throws error if not authenticated
 * 
 * Usage:
 * const session = await auth();
 * if (!session) throw new Error('Not authenticated');
 */
export const auth = async (): Promise<Session | null> => {
  return getServerSession(authOptions);
};

/**
 * Get current user ID from session
 * Throws error if not authenticated
 * 
 * Always use this instead of trusting frontend-provided user IDs
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }
  // NextAuth session may not expose the user's DB id. Prefer id, otherwise
  // resolve the user record by email to obtain the canonical id.
  const sessionUser: any = session.user;
  if (sessionUser.id) {
    return sessionUser.id;
  }

  const email: string | undefined = sessionUser.email;
  if (!email) {
    throw new Error('User ID not found in session');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.id;
}

/**
 * Get current user with full details from database
 * Never trust frontend user data - always fetch from DB
 */
export async function getCurrentUser() {
  const userId = await getCurrentUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Check if user has required role
 */
export async function hasRole(allowedRoles: string[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return allowedRoles.includes(user.role);
  } catch {
    return false;
  }
}

/**
 * Verify user owns a resource (booking, admission, etc.)
 * Prevents users from accessing other user's data
 */
export async function isResourceOwner(userId: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  return currentUser.id === userId;
}

/**
 * RBAC middleware helper for API routes
 */
export async function requireRole(...roles: string[]) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}

/**
 * Get user's active session
 */
export async function getSession(): Promise<Session | null> {
  return auth();
}

/**
 * Verify session is still valid
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const session = await auth();
    return !!session?.user;
  } catch {
    return false;
  }
}
