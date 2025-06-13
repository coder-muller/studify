import { useState, useEffect, useCallback, useRef } from "react"
import { useFiles } from "./useFiles"
import { useSettings } from "./useSettings"

interface UseAutoSaveProps {
  fileId: string | null
  initialTitle: string
  initialContent: string
  onSaveSuccess?: () => void
}

export function useAutoSave({ fileId, initialTitle, initialContent, onSaveSuccess }: UseAutoSaveProps) {
  const [isActive, setIsActive] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasChanges, setHasChanges] = useState(false)

  const { updateFile } = useFiles()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef({ title: initialTitle, content: initialContent })
  const { autoSave: autoSaveOn } = useSettings()

  // Atualizar valores quando o arquivo mudar
  useEffect(() => {
    if (fileId) {
      setTitle(initialTitle)
      setContent(initialContent)
      setIsActive(autoSaveOn)
      lastSavedRef.current = { title: initialTitle, content: initialContent }
      setHasChanges(false)
      setSaveStatus('idle')
    }
  }, [fileId, initialTitle, initialContent])

  // Função para salvar
  const saveFile = useCallback(async () => {
    if (!fileId || !hasChanges) return

    try {
      setSaveStatus('saving')
      await updateFile(fileId, { title, content })
      lastSavedRef.current = { title, content }
      setHasChanges(false)
      setSaveStatus('saved')
      onSaveSuccess?.()

      // Limpar status após 2 segundos
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error)
      setSaveStatus('error')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }, [fileId, title, content, hasChanges, updateFile, onSaveSuccess])

  // Auto-save com debounce de 1 segundo
  useEffect(() => {
    if (!isActive) return

    const currentTitle = title.trim()
    const currentContent = content.trim()
    const lastTitle = lastSavedRef.current.title.trim()
    const lastContent = lastSavedRef.current.content.trim()

    const hasActualChanges = currentTitle !== lastTitle || currentContent !== lastContent
    setHasChanges(hasActualChanges)

    if (hasActualChanges) {
      // Limpar timeout anterior
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Criar novo timeout
      saveTimeoutRef.current = setTimeout(() => {
        saveFile()
      }, 1000) // 1 segundo
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, content, saveFile])

  // Função para atualizar título
  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle)
  }, [])

  // Função para atualizar conteúdo
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  // Força salvamento imediato
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveFile()
  }, [saveFile])

  return {
    title,
    content,
    updateTitle,
    updateContent,
    saveStatus,
    hasChanges,
    forceSave,
    setIsActive,
    isActive
  }
}
