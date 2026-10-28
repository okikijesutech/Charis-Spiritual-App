/**
 * Charis Official Brand Logo Component
 * Renders the canonical wordmark or the squircle app icon.
 * Follows docs/CHARIS_BRAND_IDENTITY_FOUNDATION_V1.md specifications.
 */

import React from 'react'

interface CharisLogoProps {
  variant?: 'wordmark' | 'icon' | 'responsive'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  priority?: boolean
}

export const CharisLogo: React.FC<CharisLogoProps> = ({
  variant = 'wordmark',
  size = 'md',
  theme = 'auto',
  className = '',
}) => {
  // Size dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const wordmarkHeights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  }

  // Pure SVG App Icon (Squircle + Serif 'c' + Leaf Accent)
  const renderAppIcon = (extraClasses = '') => (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#C2654A] to-[#B05B42] text-white shadow-subtle ${iconSizes[size]} ${extraClasses}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lowercase serif 'c' */}
        <text
          x="46"
          y="62"
          fontFamily="'Newsreader', 'Playfair Display', Georgia, serif"
          fontSize="54"
          fontWeight="600"
          fill="#FFFDF9"
          textAnchor="middle"
          dominantBaseline="central"
        >
          c
        </text>
        {/* Leaf accent */}
        <path
          d="M 0 -4.5 C 3 -2.2 3.5 1.8 0 5.6 C -3.5 1.8 -3 -2.2 0 -4.5 Z"
          transform="translate(56, 32) rotate(42)"
          fill="#FFFDF9"
        />
      </svg>
    </div>
  )

  // Full Wordmark with Signature Terracotta Leaf Tittle
  const renderWordmark = (extraClasses = '') => {
    // When theme is 'auto', we display the light image in light mode and dark image in dark mode
    if (theme === 'light') {
      return (
        <img
          src="/charis-wordmark-light.png"
          alt="Charis"
          className={`${wordmarkHeights[size]} w-auto object-contain ${extraClasses}`}
        />
      )
    }

    if (theme === 'dark') {
      return (
        <img
          src="/charis-wordmark-dark.png"
          alt="Charis"
          className={`${wordmarkHeights[size]} w-auto object-contain ${extraClasses}`}
        />
      )
    }

    return (
      <div className={`relative flex items-center ${wordmarkHeights[size]} ${extraClasses}`}>
        <img
          src="/charis-wordmark-light.png"
          alt="Charis"
          className="dark:hidden h-full w-auto object-contain select-none"
        />
        <img
          src="/charis-wordmark-dark.png"
          alt="Charis"
          className="hidden dark:block h-full w-auto object-contain select-none"
        />
      </div>
    )
  }

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="Charis">
        {renderAppIcon()}
      </div>
    )
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="Charis">
        {renderWordmark()}
      </div>
    )
  }

  // Responsive: Icon on compact mobile, Full Wordmark on sm+ screens
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label="Charis">
      {renderAppIcon('sm:hidden')}
      {renderWordmark('hidden sm:flex')}
    </div>
  )
}
