'use client'; // Required for using hooks like useState, useEffect

import type { BlogPost } from '@/lib/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getPosts } from '@/lib/posts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns'; // For date formatting

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await getPosts();
        // Sort posts by date, newest first
        fetchedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-primary">Blog Posts</h1>

      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="subtle-slide-up">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

       {error && <p className="text-destructive text-center">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="text-center text-muted-foreground">No blog posts yet. Create one in the Admin Panel!</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow duration-300 subtle-slide-up bg-card text-card-foreground">
               <Link href={`/posts/${post.id}`} legacyBehavior>
                 <a className="block">
                    <CardHeader>
                        <CardTitle className="text-2xl text-accent hover:text-accent/80 transition-colors">{post.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                         Published on {format(new Date(post.date), 'MMMM d, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Display a short snippet or the beginning of the content */}
                        <p className="line-clamp-3">{post.content}</p>
                    </CardContent>
                 </a>
               </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
