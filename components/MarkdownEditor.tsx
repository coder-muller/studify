"use client"

import { useRef, useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { File } from "@/lib/types"
import { useAutoSave } from "@/hooks/useAutoSave"
import { Edit3, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MarkdownEditorProps {
  file: File
  onSaveSuccess?: () => void
  onStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error', hasChanges: boolean) => void
}

export function MarkdownEditor({ file, onSaveSuccess, onStatusChange }: MarkdownEditorProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(true)

  const {
    title,
    content,
    updateTitle,
    updateContent,
    saveStatus,
    hasChanges,
    isActive: isAutoSaveActive,
    forceSave
  } = useAutoSave({
    fileId: file.id,
    initialTitle: file.title,
    initialContent: file.content || "",
    onSaveSuccess
  })

  // Notificar mudanças de status para o pai
  useEffect(() => {
    onStatusChange?.(saveStatus, hasChanges)
  }, [saveStatus, hasChanges, onStatusChange])

  // Sincronizar refs com estado quando o arquivo mudar
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      titleRef.current.textContent = title
    }
  }, [title])

  useEffect(() => {
    if (contentRef.current && contentRef.current.value !== content) {
      contentRef.current.value = content
    }
  }, [content])

  // Handler para mudanças no título
  const handleTitleChange = () => {
    if (titleRef.current) {
      const newTitle = titleRef.current.textContent || ""
      updateTitle(newTitle)
    }
  }

  // Handler para mudanças no conteúdo
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    updateContent(newContent)
  }

  // Prevenir quebra de linha no título
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Focar no conteúdo quando pressionar Enter no título
      contentRef.current?.focus()
    }
  }

  // Auto-resize do textarea
  const handleTextareaResize = () => {
    if (contentRef.current) {
      // Reset height to auto to get the correct scrollHeight
      contentRef.current.style.height = 'auto'
      // Set height to scrollHeight to fit all content
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px'
    }
  }

  // Resize on content change
  useEffect(() => {
    handleTextareaResize()
  }, [content])

  // Resize when component mounts and when switching to edit mode
  useEffect(() => {
    if (!isPreviewMode && contentRef.current) {
      // Small delay to ensure the textarea is rendered
      setTimeout(() => {
        handleTextareaResize()
      }, 0)
    }
  }, [isPreviewMode])

  // Resize on input
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    handleTextareaResize()
    handleContentChange(e as React.ChangeEvent<HTMLTextAreaElement>)
  }

  const handleSave = () => {
    setIsPreviewMode(true)
    forceSave()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsPreviewMode(true)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [rootRef])


  return (
    <div
      ref={rootRef}
      className="w-full mx-auto"
      onClick={() => setIsPreviewMode(false)}
    >
      {/* Título editável */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          className="text-5xl font-bold outline-none border-none focus:ring-0 text-foreground transition-colors hover:bg-muted/20 rounded-md p-2 -m-2 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
          data-placeholder="Título do arquivo"
          style={{
            caretColor: 'hsl(var(--foreground))',
            wordBreak: 'break-word',
            lineHeight: '1.1'
          }}
        />

        {/* Toggle entre edição e preview */}
        <div className="flex items-center justify-end z-10 gap-8 mb-4">
          {!isPreviewMode && (
            <span className="animate-pulse text-sm text-muted-foreground flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              editando...
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={!isPreviewMode ? () => handleSave() : () => setIsPreviewMode(false)}
            className={cn("flex items-center gap-2 w-24")}
          >
            {isPreviewMode && (
              <>
                <Edit3 className="w-4 h-4" />
                editar
              </>
            )}
            {!isPreviewMode && (
              <>
                <Save className="w-4 h-4" />
                salvar
              </>
            )}
          </Button>
        </div>
      </div>


      {/* Conteúdo */}
      {isPreviewMode ? (
        /* Modo Preview - Renderização Markdown */
        <div className="min-h-[400px] p-4">
          {content.trim() ? (
            <div
              onClick={() => setIsPreviewMode(false)}
              className="prose prose-neutral dark:prose-invert max-w-none"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Customizar componentes se necessário
                  h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-medium mb-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic mb-3">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3">
                      {children}
                    </pre>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              Comece a escrever para ver o preview...
            </p>
          )}
        </div>
      ) : (
        /* Modo Edição - Textarea */
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleInput}
          onClick={() => setIsPreviewMode(false)}
          placeholder="Comece a escrever em Markdown...
                        # Título
                        ## Subtítulo

                        - Lista item 1
                        - Lista item 2

                        **Texto em negrito**
                        *Texto em itálico*

                        ```javascript
                        // Código
                        console.log('Hello World')
                        ```

                        > Citação

                        [Link](https://example.com)"
          className="w-full p-4 text-base leading-7 outline-none resize-none bg-background text-foreground placeholder:text-muted-foreground overflow-hidden"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: '200px', // Altura mínima menor
            height: 'auto' // Permite crescimento automático
          }}
        />
      )}
    </div>
  )
} 
