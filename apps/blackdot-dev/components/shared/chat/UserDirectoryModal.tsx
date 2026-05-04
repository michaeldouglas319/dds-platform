'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import type { DirectoryUser } from '@/lib/types/chat.types'
import { cn } from '@/lib/utils'

interface UserDirectoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (userId: string) => Promise<void>
  currentUserId: string
}

export function UserDirectoryModal({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId,
}: UserDirectoryModalProps) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSelectingUser, setIsSelectingUser] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const loadUsers = useCallback(async (searchTerm: string, pageNum: number) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: pageNum.toString(),
      })
      const response = await fetch(`/api/users/directory?${params}`)
      const data = await response.json()

      if (data.success) {
        if (pageNum === 0) {
          setUsers(data.data)
        } else {
          setUsers((prev) => [...prev, ...data.data])
        }
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setPage(0)
      loadUsers(search, 0)
    }
  }, [isOpen, search, loadUsers])

  const handleSelectUser = async (userId: string) => {
    setIsSelectingUser(true)
    try {
      await onSelectUser(userId)
      onClose()
    } finally {
      setIsSelectingUser(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-96 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Message</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  disabled={isSelectingUser}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className={cn('h-2 w-2 rounded-full', user.isOnline ? 'bg-green-500' : 'bg-gray-300')} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {hasMore && (
          <div className="p-4 border-t">
            <button
              onClick={() => {
                setPage((p) => p + 1)
                loadUsers(search, page + 1)
              }}
              disabled={isLoading}
              className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
