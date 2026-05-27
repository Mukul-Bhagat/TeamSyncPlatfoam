import { LandingLayout } from '@/components/layouts/LandingLayout';

export function LandingPage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading font-bold text-heading-xl text-foreground mb-6">
              TeamSync
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Modern team collaboration and workspace management platform built for teams that want to work smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity duration-fast"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="w-full sm:w-auto border border-input bg-card px-8 py-3 rounded-xl font-medium hover:bg-muted transition-colors duration-fast"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-heading-lg text-foreground mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-body-md text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help your team work together seamlessly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-xl p-6 shadow-soft-md">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-heading-md text-foreground mb-2">
                Team Collaboration
              </h3>
              <p className="text-body-sm text-muted-foreground">
                Work together in real-time with your team members
              </p>
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-soft-md">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-heading-md text-foreground mb-2">
                Project Management
              </h3>
              <p className="text-body-sm text-muted-foreground">
                Organize and track all your projects in one place
              </p>
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-soft-md">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-heading-md text-foreground mb-2">
                Analytics & Insights
              </h3>
              <p className="text-body-sm text-muted-foreground">
                Get insights into your team's productivity
              </p>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
