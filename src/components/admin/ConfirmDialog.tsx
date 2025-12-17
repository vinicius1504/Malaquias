'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

interface ConfirmProviderProps {
  children: ReactNode
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsLoading(true)
    setTimeout(() => {
      resolvePromise?.(true)
      setIsOpen(false)
      setIsLoading(false)
      setOptions(null)
    }, 100)
  }

  const handleCancel = () => {
    resolvePromise?.(false)
    setIsOpen(false)
    setOptions(null)
  }

  const getTypeStyles = () => {
    switch (options?.type) {
      case 'danger':
        return {
          icon: 'bg-red-100 text-red-600',
          button: 'bg-red-500 hover:bg-red-600',
        }
      case 'warning':
        return {
          icon: 'bg-amber-100 text-amber-600',
          button: 'bg-amber-500 hover:bg-amber-600',
        }
      default:
        return {
          icon: 'bg-blue-100 text-blue-600',
          button: 'bg-blue-500 hover:bg-blue-600',
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AnimatePresence>
        {isOpen && options && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.icon}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {options.title || 'Confirmação'}
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-gray-600 leading-relaxed">{options.message}</p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2.5 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${styles.button}`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {options.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}
