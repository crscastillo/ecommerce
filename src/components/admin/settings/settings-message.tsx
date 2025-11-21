import { AlertCircle, CheckCircle } from 'lucide-react'
import { useSettings } from '@/lib/contexts/settings-context'

export function SettingsMessage() {
  const { state } = useSettings()
  
  if (!state.message) return null

  const { type, text } = state.message

  return (
    <div className={`p-4 rounded-lg flex items-center space-x-2 ${
      type === 'success' 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span>{text}</span>
    </div>
  )
}