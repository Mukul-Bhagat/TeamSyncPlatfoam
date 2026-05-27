import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-heading-xl text-foreground mb-2">
            Settings
          </h1>
          <p className="text-body-md text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-soft-md">
            <h2 className="font-heading font-semibold text-heading-lg text-foreground mb-4">
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-fast"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-fast"
                  placeholder="you@example.com"
                />
              </div>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity duration-fast">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-soft-md">
            <h2 className="font-heading font-semibold text-heading-lg text-foreground mb-4">
              Preferences
            </h2>
            <p className="text-body-md text-muted-foreground">
              More settings coming soon
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
