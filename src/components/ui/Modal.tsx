import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  if (typeof document === 'undefined') return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content panel: Centered dialog on both mobile & desktop */}
      <div className={`relative w-full ${maxWidth} bg-charis-surface border border-charis-border rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[88dvh] flex flex-col transform transition-all dark:bg-[#1B1E2B]`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-3.5 border-b border-charis-border/60">
          <div className="min-w-0 pr-3">
            {title && <h2 className="text-base sm:text-lg font-serif font-semibold text-charis-text truncate">{title}</h2>}
            {description && <p className="text-xs text-charis-text-muted mt-0.5 line-clamp-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
