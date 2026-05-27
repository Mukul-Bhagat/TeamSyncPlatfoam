export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`} />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-soft-md">
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}
