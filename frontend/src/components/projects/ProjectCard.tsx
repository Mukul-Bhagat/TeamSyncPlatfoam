import { Users, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project & {
    organization?: string;
    workspace?: string;
    members?: Array<{ id: string; avatar_url?: string; full_name?: string }>;
    taskCount?: number;
    memberCount?: number;
    dueDate?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const {
    name,
    description,
    icon = '🚀',
    color = '#6366f1',
    status,
    organization,
    workspace,
    members = [],
    taskCount = 0,
    memberCount = 0,
    dueDate,
  } = project;

  const statusConfig = {
    planning: { color: 'bg-yellow-500', label: 'Planning' },
    active: { color: 'bg-green-500', label: 'Active' },
    on_hold: { color: 'bg-orange-500', label: 'On Hold' },
    completed: { color: 'bg-blue-500', label: 'Completed' },
    archived: { color: 'bg-gray-500', label: 'Archived' },
  };

  const statusInfo = statusConfig[status] || statusConfig.planning;

  const displayMembers = members.slice(0, 4);
  const remainingMembers = Math.max(0, members.length - 4);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <span>{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
            {(organization || workspace) && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {organization && <span>{organization}</span>}
                {organization && workspace && <span>•</span>}
                {workspace && <span>{workspace}</span>}
              </div>
            )}
          </div>
        </div>
        <button
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            // Handle menu click
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      {description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{description}</p>
      )}

      {/* Status Badge */}
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', statusInfo.color)} />
        <span className="text-xs font-medium text-gray-600">{statusInfo.label}</span>
      </div>

      {/* Metrics */}
      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
        {taskCount > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{taskCount} tasks</span>
          </div>
        )}
        {memberCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{memberCount} members</span>
          </div>
        )}
        {dueDate && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{new Date(dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Team Members */}
      {displayMembers.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {displayMembers.map((member) => (
              <div
                key={member.id}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600"
                title={member.full_name || 'Team member'}
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name || 'Avatar'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{member.full_name?.charAt(0).toUpperCase() || '?'}</span>
                )}
              </div>
            ))}
          </div>
          {remainingMembers > 0 && (
            <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600">
              +{remainingMembers}
            </div>
          )}
        </div>
      )}

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent transition-all group-hover:ring-gray-200" />
    </div>
  );
}
