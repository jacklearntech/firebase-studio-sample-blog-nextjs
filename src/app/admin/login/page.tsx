'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from 'lucide-react'; // Icon for token

const ADMIN_TOKEN_KEY = 'adminApiToken';
const VALID_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN;

export default function AdminLoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

   if (!VALID_TOKEN) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md bg-destructive text-destructive-foreground">
                 <CardHeader>
                    <CardTitle>Configuration Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Admin API token is not configured. Please set NEXT_PUBLIC_ADMIN_API_TOKEN environment variable.</p>
                </CardContent>
            </Card>
        </div>
    );
   }


  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (token === VALID_TOKEN) {
      try {
         localStorage.setItem(ADMIN_TOKEN_KEY, token);
         toast({
            title: "Success",
            description: "Authentication successful. Redirecting...",
         });
         router.push('/admin');
      } catch (storageError) {
          console.error("Failed to save token to localStorage:", storageError);
          setError("Failed to save authentication. Please ensure localStorage is enabled.");
           toast({
                title: "Error",
                description: "Could not save authentication.",
                variant: "destructive",
           });
          setLoading(false);
      }
    } else {
      setError('Invalid API token. Please try again.');
       toast({
            title: "Authentication Failed",
            description: "Invalid API token provided.",
            variant: "destructive",
       });
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md subtle-slide-up shadow-lg bg-card text-card-foreground">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">Admin Panel Access</CardTitle>
          <CardDescription>Please enter the API token to proceed.</CardDescription>
        </CardHeader>
         <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="api-token">API Token</Label>
                <Input
                id="api-token"
                type="password" // Use password type to obscure token
                placeholder="Enter your API token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="bg-background"
                />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? 'Verifying...' : 'Login'}
            </Button>
            </CardFooter>
         </form>
      </Card>
    </div>
  );
}