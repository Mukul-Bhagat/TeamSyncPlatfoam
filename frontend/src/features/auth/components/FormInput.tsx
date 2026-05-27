import { cn } from '@/lib/utils';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'form'> {
  label?: string;
  error?: string;
  name: string;
  form: any;
}

export function FormInput({
  label,
  error,
  name,
  form,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-foreground transition-colors duration-fast"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          {...form.register(name)}
          {...props}
          className={cn(
            'w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
            'transition-all duration-fast',
            'placeholder:text-muted-foreground/60',
            'hover:border-border/80',
            error && 'border-destructive/50 focus:ring-destructive/50 focus:border-destructive/50',
            !error && 'shadow-sm',
            className
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{error}</p>
      )}
    </div>
  );
}
