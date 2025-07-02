import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { CommunityPostDialog } from '@/components/community-post-dialog';

export default async function CommunityPage() {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Community Forum</h1>
          <p className="text-muted-foreground">
            Ask questions, share feedback, and learn together.
          </p>
        </div>
        <CommunityPostDialog />
      </div>

      <div className="space-y-4">
        {posts?.map(post => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="hover:text-primary transition-colors text-lg">
                    <Link href="#">{post.title}</Link>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.profiles?.full_name || 'Anonymous'}</span>
                    <span>&middot;</span>
                    <span>
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {post.content && (
                <p className="text-muted-foreground mb-4">{post.content}</p>
              )}
              {post.image_url && (
                <div className="relative mt-4 aspect-video w-full max-w-lg overflow-hidden rounded-lg border">
                  <Image
                    src={post.image_url}
                    alt={`Image for post: ${post.title}`}
                    fill
                    className="object-cover"
                    data-ai-hint="community post"
                  />
                </div>
              )}
              {post.video_url && (
                <div className="mt-4">
                  <video
                    controls
                    className="w-full max-w-lg rounded-lg border bg-black"
                    src={post.video_url}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                View Post
              </Button>
            </CardFooter>
          </Card>
        ))}
        {posts?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No posts yet. Be the first to start a conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
