import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-heading font-bold text-2xl text-foreground">
                TeamSync
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast">
                Pricing
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast">
                About
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-fast"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="font-heading font-bold text-xl text-foreground">
                TeamSync
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                Modern team collaboration and workspace management platform.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-fast">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 TeamSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
