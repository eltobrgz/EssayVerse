import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  Flame,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { UserBadge } from '@/lib/definitions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const BadgeIcons: { [key: string]: LucideIcon } = {
  Award,
  Star,
  Trophy,
  Users,
  default: Award,
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: badges } = (await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', user.id)) as { data: UserBadge[] | null };

  if (!profile) {
    notFound();
  }

  const xpForNextLevel = 100;
  const xpProgress = profile.points % xpForNextLevel;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-3xl">
              {profile.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">
              {profile.full_name}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Flame className="h-5 w-5" />
                <span className="font-bold">{profile.current_streak}</span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Nível {profile.level}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={xpProgress} />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{xpProgress} / {xpForNextLevel} XP</span>
              <span>Total: {profile.points} XP</span>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Conquistas</CardTitle>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
              <TooltipProvider>
                <div className="flex flex-wrap gap-4">
                  {badges.map(({ badges: badge }) => {
                    const Icon = BadgeIcons[badge.icon_name] || BadgeIcons.default;
                    return (
                      <Tooltip key={badge.id}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg w-28 text-center bg-muted/50">
                            <Icon className="h-10 w-10 text-primary" />
                            <p className="text-xs font-semibold truncate w-full">{badge.name}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{badge.name}</p>
                          <p>{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            ) : (
              <p className="text-muted-foreground">
                Continue escrevendo para desbloquear novas conquistas!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
