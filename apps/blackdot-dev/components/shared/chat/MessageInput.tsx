'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Message } from '@/lib/types/chat.types'
import { validateMessageContent, debounceTyping, formatUserName } from '@/lib/chat/utils'
import { Send, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTyping?: () => void
  isLoading?: boolean
  placeholder?: string
  replyingTo?: Message
  onCancelReply?: () => void
}

/**
 * Message composition input with auto-resize and typing indicator
 */
export function MessageInput({
  onSend,
  onTyping,
  isLoading,
  placeholder = 'Type a message...',
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Debounced typing indicator
  const handleTyping = useCallback(
    debounceTyping(() => {
      onTyping?.()
    }, 500),
    [onTyping]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    handleTyping()
  }

  const handleSend = async () => {
    const validation = validateMessageContent(content)

    if (!validation) {
      // Could show a toast here
      return
    }

    setIsSending(true)
    try {
      await onSend(content)
      setContent('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
      return
    }

    // Allow Shift + Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-white/10 bg-background/60 backdrop-blur-md p-4 space-y-3">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-background/60 border border-white/10 rounded-lg px-3 py-2">
          <div className="text-xs">
            <span className="text-muted-foreground">Replying to</span>
            <span className="ml-1 font-medium text-foreground">
              {formatUserName(replyingTo.user?.firstName, replyingTo.user?.lastName)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onCancelReply}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Input container */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoResize
          disabled={isLoading || isSending}
          className="resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={
            isLoading ||
            isSending ||
            !content.trim() ||
            !validateMessageContent(content)
          }
          size="icon"
          className="h-auto mt-auto"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 bg-background/80 rounded border border-white/10">
          Ctrl/Cmd + Enter
        </kbd>{' '}
        or click send
      </div>
    </div>
  )
}
