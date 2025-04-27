'use client';

import type { BlogPost } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPosts, deletePost } from '@/lib/posts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function AdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
       toast({
          title: "Error",
          description: "Failed to load posts.",
          variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch posts on initial load

  const handleCreate = () => {
    router.push('/admin/edit'); // Navigate to create new post page
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/edit/${id}`); // Navigate to edit post page
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });
      await fetchPosts(); // Re-fetch posts after deletion
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
        <Button onClick={handleCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
        </Button>
      </div>

      {loading && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <CardFooter className="flex justify-end gap-2">
                 <Skeleton className="h-8 w-16" />
                 <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-destructive text-center">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="text-center text-muted-foreground">No blog posts yet. Click "Create New Post" to get started!</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col justify-between subtle-slide-up bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Published on {format(new Date(post.date), 'PP')} {/* 'PP' is a compact date format */}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-4 text-sm">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEdit(post.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="sm">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the blog post
                          "{post.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
