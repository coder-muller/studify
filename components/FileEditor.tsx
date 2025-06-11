"use client"

import { useRef, useEffect } from "react"
import { File } from "@/lib/types"
import { useAutoSave } from "@/hooks/useAutoSave"

interface FileEditorProps {
    file: File
    onSaveSuccess?: () => void
    onStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error', hasChanges: boolean) => void
}

export function FileEditor({ file, onSaveSuccess, onStatusChange }: FileEditorProps) {
    const titleRef = useRef<HTMLHeadingElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const {
        title,
        content,
        updateTitle,
        updateContent,
        saveStatus,
        hasChanges
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
        if (contentRef.current && contentRef.current.textContent !== content) {
            contentRef.current.textContent = content
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
    const handleContentChange = () => {
        if (contentRef.current) {
            const newContent = contentRef.current.textContent || ""
            updateContent(newContent)
        }
    }

    // Prevenir quebra de linha no título
    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Focar no conteúdo quando pressionar Enter no título
            contentRef.current?.focus()
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Área de edição */}
            <div className="flex-1 mx-auto w-full overflow-y-auto">
                {/* Título editável */}
                <h1
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    className="text-5xl font-bold mb-8 outline-none border-none focus:ring-0 text-foreground transition-colors rounded-md p-2 -m-2 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
                    data-placeholder="Título do arquivo"
                    style={{ 
                        caretColor: 'hsl(var(--foreground))',
                        wordBreak: 'break-word',
                        lineHeight: '1.1'
                    }}
                />

                {/* Conteúdo editável */}
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleContentChange}
                    className="min-h-[400px] text-base leading-7 outline-none border-none focus:ring-0 text-foreground transition-colors hover:bg-muted/10 rounded-md p-3 -m-3 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
                    data-placeholder="Comece a escrever..."
                    style={{ 
                        caretColor: 'hsl(var(--foreground))',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
                    }}
                />
            </div>
        </div>
    )
} 