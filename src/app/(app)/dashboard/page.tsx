
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateUserStreak, getTeacherDashboardStats, getStudentDashboardStats } from '@/lib/actions';
import type { Profile } from '@/lib/definitions';
import { TeacherDashboard } from '@/components/teacher-dashboard';
import { StudentDashboard } from '@/components/student-dashboard';

export default async function Dashboard() {
  await updateUserStreak();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile };

  if (!profile) {
    return notFound();
  }
  
  if (profile.role === 'teacher') {
    const stats = await getTeacherDashboardStats(user.id);
    return <TeacherDashboard profile={profile} stats={stats} />;
  }
  
  // Default to student
  const { essays, stats } = await getStudentDashboardStats(user.id);
  return <StudentDashboard profile={profile} essays={essays} stats={stats} />;
}
