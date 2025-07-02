'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  return redirect('/dashboard');
}


export async function signup(formData: FormData) {
    const origin = headers().get('origin');
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
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
        if (error.message.includes('User already registered')) {
            return redirect(`/signup?message=${encodeURIComponent('Este email já está cadastrado. Tente fazer login ou verifique seu email para confirmação.')}`);
        }
        return redirect(`/signup?message=${encodeURIComponent(error.message)}`);
    }

    return redirect(`/signup?message=${encodeURIComponent('Sucesso! Por favor, verifique sua caixa de entrada para confirmar seu email.')}&type=success`);
}


export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
