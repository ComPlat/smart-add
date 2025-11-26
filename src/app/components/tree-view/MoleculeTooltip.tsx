'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface MoleculeTooltipProps {
  molfile?: string
  smiles?: string
  children: React.ReactNode
}

export default function MoleculeTooltip({
  molfile,
  smiles,
  children,
}: MoleculeTooltipProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generateSvg = async () => {
      if (!isHovered || (!molfile && !smiles)) return

      if (typeof window === 'undefined' || !(window as any).ketcher) return

      setIsLoading(true)
      try {
        const ketcher = (window as any).ketcher
        const input = molfile || smiles || ''

        const svgBase64 = await ketcher.structService.generateImageAsBase64(
          input,
          {
            outputFormat: 'svg',
            'dearomatize-on-load': true,
          },
        )
        // Decode base64 to get actual SVG string
        const svgString = atob(svgBase64)
        setSvg(svgString)
      } catch (error) {
        console.error('Error generating molecule SVG:', error)
        setSvg(null)
      } finally {
        setIsLoading(false)
      }
    }

    generateSvg()
  }, [isHovered, molfile, smiles])

  const handleMouseEnter = () => {
    if (!molfile && !smiles) return

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.right + 8,
        y: rect.top,
      })
    }
    setIsHovered(true)
  }

  const hasMoleculeData = !!(molfile || smiles)

  return (
    <>
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>

      {isHovered &&
        hasMoleculeData &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[9999] rounded-md border border-gray-200 bg-white p-2 shadow-lg"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              minWidth: '200px',
              maxWidth: '300px',
            }}
          >
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-kit-primary-full"></div>
              </div>
            )}

            {!isLoading && svg && (
              <div
                className="w-full [&>svg]:h-auto [&>svg]:max-h-[200px] [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}

            {!isLoading && !svg && (
              <p className="text-xs text-gray-500">
                Unable to generate structure, Please wait and hover again.
                otherwise check the molecule data.
                <div className="flex items-center justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-kit-primary-full"></div>
                </div>
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
