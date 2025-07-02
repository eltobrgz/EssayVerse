import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AppLayoutClient } from './app-layout-client';
import type { Profile } from '@/lib/definitions';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should not happen due to middleware, but as a safeguard
    return notFound();
  }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as { data: Profile | null };

  if (!profile) {
    // This could happen if the profile trigger fails.
    // Handle appropriately, e.g., show an error or redirect.
    return notFound();
  }

  return (
    <AppLayoutClient profile={profile}>
      {children}
    </AppLayoutClient>
  );
}
