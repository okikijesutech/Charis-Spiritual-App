import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content panel: Bottom Sheet on Mobile, Dialog on larger screens */}
      <div className={`relative w-full ${maxWidth} bg-charis-surface border-t sm:border border-charis-border rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden z-10 max-h-[90vh] flex flex-col transform transition-all`}>
        {/* Grab handle for mobile */}
        <div className="w-12 h-1.5 bg-charis-border rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-2 pb-4 border-b border-charis-border/60">
          <div>
            {title && <h2 className="text-lg font-serif font-semibold text-charis-text">{title}</h2>}
            {description && <p className="text-xs text-charis-text-muted mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto pb-safe">
          {children}
        </div>
      </div>
    </div>
  )
}
