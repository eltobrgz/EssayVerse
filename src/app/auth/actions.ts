
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(
  prevState: { message: string } | null,
  formData: FormData
) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message };
  }

  redirect('/dashboard');
}

export async function signup(
  prevState: { message: string, success?: boolean } | null,
  formData: FormData
) {
  const supabase = createClient();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    return { message: 'Full name, email and password are required.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // This is the default, but it's good to be explicit
      // The user will be sent a confirmation email.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { message: error.message };
  }
  
  // If the user is created but needs to confirm their email, 
  // we don't get a session. This is the state we want to inform the user about.
  if (data.user && !data.session) {
    return { 
      message: 'Please check your email to confirm your account before logging in.',
      success: true,
    };
  }

  // If for some reason auto-confirmation is on, and we get a session, we redirect.
  if (data.session) {
    redirect('/dashboard');
  }

  // Fallback for any other unexpected case
  return { message: 'An unexpected error occurred. Please try again.' };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
