
'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const PasswordResetSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
});

const UpdatePasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  });

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
    const role = formData.get('role') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        if (error.message.includes('User already registered')) {
            return redirect(`/signup?message=${encodeURIComponent('Este email já está cadastrado. Tente fazer login ou redefinir sua senha.')}`);
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


export async function sendPasswordResetEmail(formData: FormData) {
  const validatedFields = PasswordResetSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
     return redirect(`/forgot-password?message=${encodeURIComponent('Email inválido.')}`);
  }
  
  const origin = headers().get('origin');
  const email = validatedFields.data.email;
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });

  if (error) {
    console.error('Password Reset Error:', error);
    return redirect(`/forgot-password?message=${encodeURIComponent('Não foi possível enviar o email de redefinição. Por favor, tente novamente.')}`);
  }

  return redirect(`/forgot-password?message=${encodeURIComponent('Se uma conta com este email existir, um link para redefinir a senha foi enviado.')}&type=success`);
}

export async function updatePassword(formData: FormData) {
  const validatedFields = UpdatePasswordSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.flatten().fieldErrors.password?.[0] || 'Senha inválida.';
    return redirect(`/auth/update-password?message=${encodeURIComponent(errorMessage)}`);
  }

  const { password } = validatedFields.data;
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(`/auth/update-password?message=${encodeURIComponent('Não foi possível atualizar a senha. Por favor, tente novamente.')}`);
  }
  
  redirect('/dashboard');
}
