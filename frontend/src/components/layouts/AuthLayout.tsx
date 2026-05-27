import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-background/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="font-heading font-bold text-2xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-fast">
                TeamSync
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-fast shadow-lg shadow-primary/25"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="font-heading font-bold text-heading-xl text-foreground mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-body-md text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/50 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 TeamSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
