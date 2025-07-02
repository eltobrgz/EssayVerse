
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(
  prevState: { message?: string } | null,
  formData: FormData
) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/dashboard';

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error); // Log the error object for debugging
    return { message: error.message };
  }

  // On success, revalidate and redirect. This path does not return a state.
  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signup(
  prevState: { message: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = createClient();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const origin = new URL(process.env.NEXT_PUBLIC_BASE_URL!).origin;

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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { message: error.message };
  }

  if (data.user && !data.session) {
    return {
      message:
        'Please check your email to confirm your account before logging in.',
      success: true,
    };
  }
  
  // This case should ideally not happen if email confirmation is on,
  // but if it is, we redirect.
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
