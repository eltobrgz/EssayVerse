import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher') {
    // Or redirect to a "not authorized" page
    notFound();
  }

  return <>{children}</>;
}
