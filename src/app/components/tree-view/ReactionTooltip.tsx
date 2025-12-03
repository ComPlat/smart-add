'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ReactionTooltipProps {
  reactionSvgUrl?: string
  children: React.ReactNode
  'data-mykey'?: string | number
}

export default function ReactionTooltip({
  reactionSvgUrl,
  children,
  'data-mykey': dataMykey,
}: ReactionTooltipProps) {
  const defaultImageUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3dSEtDvpd9KAn4SdFJVoL0K1lj4Xfc-wVWQ&s'

  // Check if content is inline SVG (starts with <svg)
  const isSvgContent = (content: string | undefined) => {
    if (!content) return false
    return content.trim().startsWith('<svg')
  }

  // Check if URL is valid
  const isValidUrl = (url: string | undefined) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isInlineSvg = isSvgContent(reactionSvgUrl)
  const imageUrl =
    !isInlineSvg && isValidUrl(reactionSvgUrl)
      ? reactionSvgUrl!
      : defaultImageUrl

  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.right + 8,
        y: rect.top,
      })
    }
    if (!isInlineSvg) {
      setIsLoading(true)
    }
    setIsHovered(true)
  }

  const hasReactionImage = isInlineSvg || !!imageUrl

  return (
    <>
      <div
        ref={containerRef}
        className="relative inline-block"
        data-mykey={dataMykey}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={() => setIsHovered(false)}
      >
        {children}
      </div>

      {isHovered &&
        hasReactionImage &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[45] rounded-md border border-gray-200 bg-white p-2 shadow-lg overflow-hidden flex flex-col"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              minWidth: '300px',
              maxWidth: '400px',
            }}
          >
            {isInlineSvg ? (
              // Render inline SVG content
              <div
                className="flex-1 w-full flex items-center justify-center [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: reactionSvgUrl || '' }}
              />
            ) : (
              // Render image from URL
              <>
                {isLoading && (
                  <div
                    className="flex items-center justify-center"
                    style={{ minHeight: '150px' }}
                  >
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-kit-primary-full"></div>
                  </div>
                )}
                <img
                  src={imageError ? defaultImageUrl : imageUrl}
                  alt="Reaction scheme"
                  className="w-full h-auto max-h-[300px] object-contain"
                  style={{ display: isLoading ? 'none' : 'block' }}
                  onLoad={() => setIsLoading(false)}
                  onLoadStart={() => setIsLoading(true)}
                  onError={() => {
                    setIsLoading(false)
                    if (!imageError) {
                      setImageError(true)
                    }
                  }}
                />
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
