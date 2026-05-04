'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Users } from 'lucide-react'
import type { Channel, Workspace } from '@/lib/types/chat.types'

interface GlobalChatTabsProps {
  workspaces: Workspace[]
  channels: Channel[]
  currentWorkspaceId: string | null
  currentChannelId: string | null
  onSelectWorkspace: (workspaceId: string) => void
  onSelectChannel: (channelId: string) => void
  onOpenUserDirectory: () => void
  WorkspaceContentComponent?: React.ComponentType<any>
  workspaceChannelsComponent?: React.ReactNode
  directMessagesComponent?: React.ReactNode
}

/**
 * Tab-based navigation for global chat system
 * Shows two tabs: Workspaces (project channels) and Direct Messages (global DMs)
 */
export function GlobalChatTabs({
  onOpenUserDirectory,
  workspaceChannelsComponent,
  directMessagesComponent,
}: GlobalChatTabsProps) {
  const [activeTab, setActiveTab] = useState('workspaces')

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Workspaces</span>
          </TabsTrigger>
          <TabsTrigger value="direct-messages" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Direct Messages</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces" className="mt-0">
          {workspaceChannelsComponent}
        </TabsContent>

        <TabsContent value="direct-messages" className="mt-0">
          <div className="space-y-4">
            <button
              onClick={onOpenUserDirectory}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              + New Message
            </button>
            {directMessagesComponent}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
