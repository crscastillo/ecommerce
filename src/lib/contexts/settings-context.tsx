'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

// Types
export interface Message {
  type: 'success' | 'error'
  text: string
}

export interface SettingsState {
  loading: boolean
  saving: boolean
  message: Message | null
}

export type SettingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_MESSAGE'; payload: Message | null }
  | { type: 'CLEAR_MESSAGE' }

// Initial state
const initialState: SettingsState = {
  loading: false,
  saving: false,
  message: null,
}

// Reducer
function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SAVING':
      return { ...state, saving: action.payload }
    case 'SET_MESSAGE':
      return { ...state, message: action.payload }
    case 'CLEAR_MESSAGE':
      return { ...state, message: null }
    default:
      return state
  }
}

// Context
const SettingsContext = createContext<{
  state: SettingsState
  dispatch: React.Dispatch<SettingsAction>
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setMessage: (message: Message | null) => void
  clearMessage: () => void
  showSuccess: (text: string) => void
  showError: (text: string) => void
} | null>(null)

// Provider
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState)

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setSaving = (saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving })
  }

  const setMessage = (message: Message | null) => {
    dispatch({ type: 'SET_MESSAGE', payload: message })
  }

  const clearMessage = () => {
    dispatch({ type: 'CLEAR_MESSAGE' })
  }

  const showSuccess = (text: string) => {
    setMessage({ type: 'success', text })
  }

  const showError = (text: string) => {
    setMessage({ type: 'error', text })
  }

  return (
    <SettingsContext.Provider
      value={{
        state,
        dispatch,
        setLoading,
        setSaving,
        setMessage,
        clearMessage,
        showSuccess,
        showError,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

// Hook
export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}