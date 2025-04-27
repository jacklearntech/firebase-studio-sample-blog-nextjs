'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import type { BlogPost } from '@/lib/types';
import { getPostById } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string | undefined; // Ensure type
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
        // If there's no postId, it's an invalid route client-side.
        // `notFound()` only works in Server Components, so we handle it here.
        setError("Post ID is missing.");
        setLoading(false);
        // Consider redirecting or showing a specific message
        // router.push('/404'); // Option: redirect to a custom 404
        return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPost = await getPostById(postId);
        if (!fetchedPost) {
            setError('Post not found.');
            // Trigger Next.js 404 page. In App Router, this can be tricky client-side.
            // We'll rely on rendering the error message.
            // For better SEO/SSR, handle notFound in a Server Component if possible.
             // notFound(); // This won't work directly in a 'use client' component like this
        } else {
            setPost(fetchedPost);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError('Failed to load post data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => {
    router.back(); // Go back to the previous page
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/4 mb-6" /> {/* Back button placeholder */}
        <Skeleton className="h-10 w-3/4 mb-2" /> {/* Title */}
        <Skeleton className="h-5 w-1/3 mb-6" /> {/* Date */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

   if (error === 'Post not found.') {
     // Render a specific "Not Found" message or component
     return (
        <div className="text-center py-10">
             <h1 className="text-2xl font-semibold mb-4">Post Not Found</h1>
             <p className="text-muted-foreground mb-6">Sorry, we couldn't find the post you're looking for.</p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
             </Button>
        </div>
     )
   }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  if (!post) {
     // Should ideally be caught by the error state, but good fallback.
     return <p className="text-center text-muted-foreground">Post data is unavailable.</p>;
  }

  return (
    <article className="max-w-3xl mx-auto subtle-slide-up">
        <Button onClick={handleBack} variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
        </Button>
      <Card className="bg-card text-card-foreground shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-secondary/50">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{post.title}</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2">
             Published on {format(new Date(post.date), 'PPPP')} {/* PPPP gives full date format */}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4 md:px-6 prose prose-lg max-w-none prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-foreground">
          {/* Render content - basic paragraph rendering for now */}
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>
    </article>
  );
}
