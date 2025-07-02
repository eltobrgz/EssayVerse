import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockCommunityPosts } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Community Forum</h1>
            <p className="text-muted-foreground">Ask questions, share feedback, and learn together.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Post
        </Button>
      </div>

      <div className="space-y-4">
        {mockCommunityPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="hover:text-primary transition-colors">
                <Link href="#">{post.title}</Link>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.author.avatarUrl} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
                <span>&middot;</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{post.content}</p>
            </CardContent>
            <CardFooter>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.replyCount} replies</span>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto">
                    View Post
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
