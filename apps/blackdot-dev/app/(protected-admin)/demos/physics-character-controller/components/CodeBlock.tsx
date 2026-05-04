'use client'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
}: CodeBlockProps) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border/50">
      {filename && (
        <div className="bg-slate-800 px-4 py-2 text-sm text-slate-300 font-mono flex items-center">
          <svg
            className="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4z" />
          </svg>
          {filename}
          <span className="ml-auto text-xs text-slate-500">{language}</span>
        </div>
      )}
      <pre className="bg-slate-900 text-slate-100 p-4 overflow-x-auto">
        <code className={`language-${language} text-sm font-mono leading-relaxed`}>
          {code}
        </code>
      </pre>
    </div>
  )
}
