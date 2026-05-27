import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function FormButton({
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  className,
  ...props
}: FormButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'w-full bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-3 rounded-lg font-medium',
        'hover:opacity-90 hover:shadow-lg hover:shadow-primary/25',
        'active:scale-[0.98]',
        'transition-all duration-fast',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100',
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
