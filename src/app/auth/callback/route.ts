
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if this is a password recovery confirmation
      if (data.session.user.recovery_sent_at) {
        return NextResponse.redirect(`${origin}/auth/update-password`);
      }
      
      // On successful email confirmation, redirect to the dashboard.
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=Não foi possível autenticar o usuário. O link pode ter expirado.`);
}
