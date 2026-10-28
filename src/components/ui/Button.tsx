import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'terracotta-soft'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[48px]',
  }

  const variantStyles = {
    primary: 'bg-charis-primary text-white hover:bg-charis-primary-hover shadow-sm',
    secondary: 'bg-charis-secondary text-white hover:opacity-90 shadow-sm',
    outline: 'border border-charis-border bg-charis-surface text-charis-text hover:bg-charis-border-subtle',
    ghost: 'text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle',
    'terracotta-soft': 'bg-charis-primary/10 text-charis-primary hover:bg-charis-primary/15',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
