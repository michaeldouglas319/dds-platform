'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Workspace } from '@/lib/types/chat.types'
import { ChevronDown, Plus } from 'lucide-react'

interface WorkspaceSelectorProps {
  workspaces: Workspace[]
  currentWorkspace?: Workspace
  onSelectWorkspace: (workspaceId: string) => void
  isLoading?: boolean
  onCreateWorkspace?: () => void
}

/**
 * Workspace switcher dropdown
 */
export function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  isLoading,
  onCreateWorkspace,
}: WorkspaceSelectorProps) {
  const displayWorkspace = currentWorkspace || workspaces[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-3 py-2 h-auto"
          disabled={isLoading}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={displayWorkspace?.avatarUrl} />
            <AvatarFallback>
              {(displayWorkspace?.name?.[0] || '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate text-left">
            <div className="text-sm font-medium truncate">
              {displayWorkspace?.name || 'Select Workspace'}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {workspaces.length === 0 ? (
          <div className="px-2 py-2 text-xs text-muted-foreground text-center">
            No workspaces yet
          </div>
        ) : (
          workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace.id)}
              className="gap-2 cursor-pointer"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={workspace.avatarUrl} />
                <AvatarFallback>
                  {(workspace.name?.[0] || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{workspace.name}</div>
                {workspace.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {workspace.description}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        {onCreateWorkspace && (
          <DropdownMenuItem
            onClick={onCreateWorkspace}
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
