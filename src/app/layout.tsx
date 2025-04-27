import type {Metadata} from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { BookOpenText } from 'lucide-react'; // Minimalist icon

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Content Canvas',
  description: 'A simple blog CMS built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 fade-in">
            {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}


function Header() {
    return (
        <header className="bg-secondary shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                   <BookOpenText className="w-6 h-6 text-accent" /> Content Canvas
                </Link>
                <div>
                    <Link href="/" className="text-foreground hover:text-accent transition-colors mr-4">
                        Home
                    </Link>
                     {/* Removed Admin Panel link - access via /admin/login now */}
                     {/*
                     <Link href="/admin" className="text-foreground hover:text-accent transition-colors">
                        Admin Panel
                    </Link>
                     */}
                </div>
            </nav>
        </header>
    );
}

function Footer() {
    return (
        <footer className="bg-secondary py-4 mt-12 border-t">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                © {new Date().getFullYear()} Content Canvas. All rights reserved.
            </div>
        </footer>
    );
}
