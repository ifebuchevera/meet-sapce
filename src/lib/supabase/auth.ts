import { createClient } from './client';
import type { AuthUser, AuthSession } from './types';

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user
    ? {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {},
      }
    : null;
}

export async function getSession(): Promise<AuthSession | null> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email || '',
      user_metadata: session.user.user_metadata || {},
      app_metadata: session.user.app_metadata || {},
    },
    access_token: session.access_token,
    refresh_token: session.refresh_token || '',
  };
}

export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: AuthUser | null; error: Error | null }> {
  const supabase = createClient();

  const redirectUrl = `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName || '',
      },
    },
  });

  if (error) {
    return { user: null, error };
  }

  if (data.user) {
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata || {},
        app_metadata: data.user.app_metadata || {},
      },
      error: null,
    };
  }

  return { user: null, error: null };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  if (data.user) {
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata || {},
        app_metadata: data.user.app_metadata || {},
      },
      error: null,
    };
  }

  return { user: null, error: null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  return { error };
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const redirectUrl = `${window.location.origin}/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  return { error };
}

export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

// Watch for auth changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const supabase = createClient();

  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        user_metadata: session.user.user_metadata || {},
        app_metadata: session.user.app_metadata || {},
      });
    } else {
      callback(null);
    }
  });
}
