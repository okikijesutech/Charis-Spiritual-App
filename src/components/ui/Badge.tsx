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
    sage: 'bg-charis-secondary/15 text-charis-secondary border border-charis-secondary/25',
    terracotta: 'bg-charis-primary/15 text-charis-primary border border-charis-primary/25',
    neutral: 'bg-charis-border-subtle text-charis-text-muted border border-charis-border/60',
    outline: 'border border-charis-border text-charis-text-muted bg-transparent'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${sizeStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
