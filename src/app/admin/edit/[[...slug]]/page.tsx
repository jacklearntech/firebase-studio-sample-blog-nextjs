'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getPostById, createPost, updatePost } from '@/lib/posts';
import type { BlogPost, BlogPostInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_TOKEN_KEY = 'adminApiToken';
const VALID_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN;


// Zod schema for validation
const postSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long." }),
});

type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams(); // { slug: ['postId'] } or { slug: undefined }
  const postId = params?.slug?.[0]; // Extract postId if editing
  const isEditing = !!postId;
  const [loading, setLoading] = useState(isEditing); // Only load post data if editing
  const [authLoading, setAuthLoading] = useState(true); // Loading state for auth check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

   const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // --- Authentication Check ---
   useEffect(() => {
     if (!VALID_TOKEN) {
        console.error("Admin API token is not configured. Set NEXT_PUBLIC_ADMIN_API_TOKEN.");
        setError("Admin access is not configured properly.");
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
     }

     const token = localStorage.getItem(ADMIN_TOKEN_KEY);
     if (token === VALID_TOKEN) {
         setIsAuthenticated(true);
     } else {
         setIsAuthenticated(false);
         toast({
             title: "Unauthorized",
             description: "Please log in to access this page.",
             variant: "destructive",
         });
         router.push('/admin/login'); // Redirect if not authenticated
     }
     setAuthLoading(false); // Mark auth check as complete
   }, [router, toast]);


  // --- Fetch Post Data (only if authenticated and editing) ---
  useEffect(() => {
    if (isAuthenticated && isEditing && postId) { // Ensure authenticated before fetching
      const fetchPost = async () => {
        try {
          setLoading(true); // Start loading post data
          setError(null);
          const post = await getPostById(postId);
          if (post) {
            form.reset({ title: post.title, content: post.content });
          } else {
             setError('Post not found.');
             toast({ title: "Error", description: "Blog post not found.", variant: "destructive" });
             router.push('/admin'); // Redirect if post doesn't exist
          }
        } catch (err) {
          console.error("Failed to fetch post:", err);
          setError('Failed to load post data.');
          toast({ title: "Error", description: "Failed to load post data.", variant: "destructive" });
        } finally {
          setLoading(false); // Finish loading post data
        }
      };
      fetchPost();
    } else if (isAuthenticated && !isEditing) {
       setLoading(false); // Not editing, so no post data loading needed
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isEditing, postId, router, form, toast]); // Add isAuthenticated


  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
     if (!isAuthenticated) {
         toast({ title: "Error", description: "You are not authorized to perform this action.", variant: "destructive" });
         return;
     }

     const postData: BlogPostInput = {
        ...data,
        date: new Date().toISOString(), // Set current date on save/update
     };

    try {
        setError(null);
        setLoading(true); // Indicate saving process
        if (isEditing && postId) {
            await updatePost(postId, postData);
            toast({ title: "Success", description: "Blog post updated successfully." });
        } else {
            await createPost(postData);
            toast({ title: "Success", description: "Blog post created successfully." });
        }
        router.push('/admin'); // Redirect to admin panel after successful operation
         router.refresh(); // Ensure the admin page re-fetches data
    } catch (err) {
      console.error("Failed to save post:", err);
      const action = isEditing ? 'update' : 'create';
      setError(`Failed to ${action} post. Please try again.`);
      toast({ title: "Error", description: `Failed to ${action} post.`, variant: "destructive" });
    } finally {
       setLoading(false); // Finish saving process
    }
  };

  if (authLoading) {
      return <div className="flex justify-center items-center h-64"><p>Verifying access...</p></div>;
  }

   if (!isAuthenticated) {
     // Render minimal content or a message, as redirection should handle this case mostly
     return <div className="flex justify-center items-center h-64"><p>Access Denied. Redirecting...</p></div>;
   }

   // Show skeleton while loading post data *only* when editing
   if (loading && isEditing) {
    return (
      <Card className="max-w-2xl mx-auto subtle-slide-up">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-4" />
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
           </div>
           <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-32 w-full" />
           </div>
        </CardContent>
         <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }


  return (
    <Card className="max-w-2xl mx-auto subtle-slide-up shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
               {error && <p className="text-destructive text-sm">{error}</p>}
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter post title" {...field} className="bg-background" disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Write your blog post content here..." {...field} rows={10} className="bg-background" disabled={form.formState.isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t">
                <Button type="submit" disabled={form.formState.isSubmitting || loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                </Button>
            </CardFooter>
           </form>
      </Form>
    </Card>
  );
}