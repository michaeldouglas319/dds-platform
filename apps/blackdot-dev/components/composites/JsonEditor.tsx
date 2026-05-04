'use client'

import { useState, useEffect } from 'react'
import Editor, { type EditorProps, type Monaco } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * JsonEditor - Reusable Monaco-based JSON editor component
 *
 * Purpose-agnostic editor for JSON data with validation, formatting, and save functionality.
 * Built on Monaco Editor (VS Code engine) with full TypeScript support.
 *
 * @example
 * ```tsx
 * <JsonEditor
 *   title="API Configuration"
 *   description="Edit your API settings"
 *   initialValue={{ apiKey: "..." }}
 *   onSave={async (data) => await saveToBackend(data)}
 *   metadata={{ version: 2, lastUpdated: "2024-01-20" }}
 * />
 * ```
 */

export interface JsonEditorMetadata {
  [key: string]: any
}

export interface JsonEditorProps {
  // Content
  title?: string
  description?: string
  initialValue: object | string
  placeholder?: string

  // Save functionality
  onSave?: (value: object) => Promise<void> | void
  saveLabel?: string
  isSaving?: boolean

  // Refresh functionality
  onRefresh?: () => Promise<void> | void
  refreshLabel?: string
  showRefresh?: boolean

  // Metadata display
  metadata?: JsonEditorMetadata
  metadataRender?: (metadata: JsonEditorMetadata) => React.ReactNode
  tags?: string[]

  // Editor configuration
  height?: string | number
  theme?: 'vs-dark' | 'light' | 'vs'
  language?: string
  readOnly?: boolean
  editorOptions?: Record<string, unknown>

  // Monaco events
  onMount?: (editor: unknown, monaco: Monaco) => void
  onChange?: (value: string | undefined) => void
  onValidate?: (markers: unknown[]) => void

  // Validation
  validateOnChange?: boolean
  customValidator?: (value: string) => { valid: boolean; error?: string }

  // UI customization
  className?: string
  cardClassName?: string
  editorClassName?: string
  headerClassName?: string
  hideHeader?: boolean
  hideMetadata?: boolean

  // Actions
  additionalActions?: React.ReactNode
}

export function JsonEditor({
  // Content
  title = 'JSON Editor',
  description,
  initialValue,
  placeholder = '{}',

  // Save functionality
  onSave,
  saveLabel = 'Save Changes',
  isSaving = false,

  // Refresh functionality
  onRefresh,
  refreshLabel = 'Refresh',
  showRefresh = false,

  // Metadata
  metadata,
  metadataRender,
  tags,

  // Editor configuration
  height = '600px',
  theme = 'vs-dark',
  language = 'json',
  readOnly = false,
  editorOptions,

  // Monaco events
  onMount,
  onChange: onChangeProp,
  onValidate,

  // Validation
  validateOnChange = true,
  customValidator,

  // UI customization
  className,
  cardClassName,
  editorClassName,
  headerClassName,
  hideHeader = false,
  hideMetadata = false,

  // Actions
  additionalActions,
}: JsonEditorProps) {
  const [editorValue, setEditorValue] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize editor value from initialValue
  useEffect(() => {
    const formattedValue = typeof initialValue === 'string'
      ? initialValue
      : JSON.stringify(initialValue, null, 2)
    setEditorValue(formattedValue)
    setHasChanges(false)
  }, [initialValue])

  const handleEditorChange = (value: string | undefined) => {
    setEditorValue(value || '')
    setHasChanges(true)

    // Validate JSON
    if (validateOnChange && value) {
      try {
        JSON.parse(value)
        setValidationError(null)

        // Custom validator
        if (customValidator) {
          const result = customValidator(value)
          if (!result.valid) {
            setValidationError(result.error || 'Validation failed')
          }
        }
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : 'Invalid JSON')
      }
    }

    onChangeProp?.(value)
  }

  const handleSave = async () => {
    if (!onSave) return

    try {
      const parsed = JSON.parse(editorValue)
      await onSave(parsed)
      setHasChanges(false)
      setValidationError(null)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON - cannot save')
    }
  }

  const handleRefresh = async () => {
    if (!onRefresh) return

    setIsRefreshing(true)
    try {
      await onRefresh()
      setHasChanges(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  const defaultEditorOptions: Record<string, unknown> = {
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    readOnly,
    ...editorOptions,
  }

  return (
    <div className={cn('space-y-6', className)}>
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showRefresh && onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                {refreshLabel}
              </Button>
            )}
            {additionalActions}
          </div>
        </div>
      )}

      <Card className={cardClassName}>
        <CardHeader className={headerClassName}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-lg">{title}</CardTitle>
              {(tags || metadata) && (
                <CardDescription className="space-x-2 mt-2">
                  {metadata?.version && (
                    <Badge variant="outline">v{metadata.version}</Badge>
                  )}
                  {metadata?.namespace && (
                    <Badge variant="secondary">{metadata.namespace}</Badge>
                  )}
                  {tags?.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </CardDescription>
              )}
            </div>
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges || !!validationError}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {saveLabel}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {validationError && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">{validationError}</div>
            </div>
          )}
          <div className={cn('border rounded-lg overflow-hidden', editorClassName)}>
            <Editor
              height={height}
              defaultLanguage={language}
              language={language}
              value={editorValue}
              onChange={handleEditorChange}
              onMount={onMount}
              onValidate={onValidate}
              theme={theme}
              options={defaultEditorOptions}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>

      {!hideMetadata && metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {metadataRender ? (
              metadataRender(metadata)
            ) : (
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="mt-1">
                      {typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)
                        ? new Date(value).toLocaleString()
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
