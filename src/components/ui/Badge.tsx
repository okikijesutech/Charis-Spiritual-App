import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'sage' | 'terracotta' | 'neutral' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  const variantStyles = {
    sage: 'bg-[#78866B]/15 text-[#59664D] dark:bg-[#8E9E80]/20 dark:text-[#A7B798] border border-[#78866B]/20',
    terracotta: 'bg-[#D95740]/15 text-[#B6422D] dark:bg-[#E06D58]/20 dark:text-[#F39180] border border-[#D95740]/20',
    neutral: 'bg-charis-border-subtle text-charis-text-muted border border-charis-border/60',
    outline: 'border border-charis-border text-charis-text-muted bg-transparent'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${sizeStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
