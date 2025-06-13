import { Save, SaveOff, Loader2, AlertTriangle, Edit3 } from 'lucide-react'
import { File } from '@/lib/types'

interface SaveIndicatorProps {
  selectedFile: File | null
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'editing'
  hasChanges?: boolean
}

export default function RenderSaveIndicator({
  selectedFile,
  saveStatus = 'idle',
  hasChanges = false,
}: SaveIndicatorProps) {

  if (!selectedFile) return null

  switch (saveStatus) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground" >
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )
    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm" >
          <Save className="w-4 h-4" />
        </div>
      )
    case 'error':
      return (
        <div className="flex items-center gap-2 text-sm text-red-500" >
          <AlertTriangle className="w-4 h-4" />
        </div>
      )
    default:
      if (hasChanges) {
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" >
            <SaveOff className="w-4 h-4" />
          </div>
        )
      }
      return null
  }
}
