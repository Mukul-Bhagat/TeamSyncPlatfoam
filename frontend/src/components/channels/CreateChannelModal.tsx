import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Hash, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChannelType, ChannelVisibility } from '@/features/channels/types/channel.types';
import { useCreateChannel } from '@/features/channels/hooks/useChannels';
import { useToast } from '@/components/common/Toast';

const createChannelSchema = z.object({
  name: z.string().min(1, 'Channel name is required').max(50, 'Channel name must be less than 50 characters'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug must be less than 50 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  type: z.nativeEnum(ChannelType),
  visibility: z.nativeEnum(ChannelVisibility),
  icon: z.string().optional(),
});

type CreateChannelFormData = z.infer<typeof createChannelSchema>;

interface CreateChannelModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CHANNEL_TYPE_OPTIONS = [
  { value: ChannelType.TEXT, label: 'Text Channel', description: 'For team discussions and collaboration' },
  { value: ChannelType.VOICE, label: 'Voice Channel', description: 'For voice conversations' },
  { value: ChannelType.ANNOUNCEMENT, label: 'Announcement', description: 'For important announcements' },
  { value: ChannelType.INCIDENT, label: 'Incident Room', description: 'For incident coordination' },
  { value: ChannelType.DEPLOYMENT, label: 'Deployment Feed', description: 'For deployment events' },
  { value: ChannelType.AI, label: 'AI Room', description: 'For AI collaboration' },
  { value: ChannelType.ACTIVITY_FEED, label: 'Activity Feed', description: 'For ecosystem activity' },
];

const ICON_OPTIONS = ['#', '💬', '📢', '🚨', '🚀', '🤖', '📊', '✨', '🎯', '💡'];

export function CreateChannelModal({ workspaceId, isOpen, onClose }: CreateChannelModalProps) {
  const { toast } = useToast();
  const createChannel = useCreateChannel();
  const [selectedIcon, setSelectedIcon] = useState<string>('#');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateChannelFormData>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      type: ChannelType.TEXT,
      visibility: ChannelVisibility.PUBLIC,
      icon: '#',
    },
  });

  const selectedType = watch('type');
  const selectedVisibility = watch('visibility');

  const onSubmit = async (data: CreateChannelFormData) => {
    try {
      await createChannel.mutateAsync({
        ...data,
        workspace_id: workspaceId,
        icon: selectedIcon,
      });
      toast.success('Channel created successfully!');
      reset();
      setSelectedIcon('#');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create channel');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setValue('slug', slug);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-glass border border-glass-border rounded-xl',
          'shadow-elevation-lg backdrop-blur-xl',
          'animate-in fade-in slide-in-from-bottom-4'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-foreground">Create Channel</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Channel Name</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...register('name', { onChange: handleNameChange })}
                placeholder="e.g. general"
                className={cn(
                  'w-full pl-10 pr-4 py-2',
                  'bg-glass border border-glass-border rounded-lg',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  'transition-all duration-fast',
                  errors.name && 'border-danger'
                )}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Slug</label>
            <input
              {...register('slug')}
              placeholder="e.g. general"
              className={cn(
                'w-full px-4 py-2',
                'bg-glass border border-glass-border rounded-lg',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'transition-all duration-fast',
                errors.slug && 'border-danger'
              )}
            />
            {errors.slug && (
              <p className="text-xs text-danger">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (optional)</label>
            <textarea
              {...register('description')}
              placeholder="What's this channel about?"
              rows={3}
              className={cn(
                'w-full px-4 py-2 resize-none',
                'bg-glass border border-glass-border rounded-lg',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'transition-all duration-fast',
                errors.description && 'border-danger'
              )}
            />
            {errors.description && (
              <p className="text-xs text-danger">{errors.description.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Channel Type</label>
            <div className="grid grid-cols-1 gap-2">
              {CHANNEL_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('type', option.value)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-fast',
                    selectedType === option.value
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-glass border-glass-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs opacity-70">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('visibility', ChannelVisibility.PUBLIC)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-all duration-fast',
                  selectedVisibility === ChannelVisibility.PUBLIC
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-glass border-glass-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('visibility', ChannelVisibility.PRIVATE)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-all duration-fast',
                  selectedVisibility === ChannelVisibility.PRIVATE
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-glass border-glass-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Private</span>
              </button>
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Icon (optional)</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'w-10 h-10 rounded-lg border flex items-center justify-center text-lg transition-all duration-fast',
                    selectedIcon === icon
                      ? 'bg-primary/20 border-primary'
                      : 'bg-glass border-glass-border hover:border-primary/50'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-glass-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium',
                'hover:opacity-90 transition-opacity duration-fast',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
