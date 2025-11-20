'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from 'antd'
import { Button } from '../workspace/Button'
import 'ketcher-react/dist/index.css'

interface KetcherModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (molfile: string) => void
  initialMolfile?: string
}

export default function KetcherModal({
  isOpen,
  onClose,
  onSave,
  initialMolfile,
}: KetcherModalProps) {
  const [isReady, setIsReady] = useState(false)
  const modalContainerRef = useRef<HTMLDivElement>(null)

  // Check if global Ketcher is ready
  useEffect(() => {
    const checkKetcher = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).ketcher) {
        setIsReady(true)
        clearInterval(checkKetcher)
      }
    }, 100)

    return () => clearInterval(checkKetcher)
  }, [])

  // Move Ketcher container into modal when it opens
  useEffect(() => {
    const ketcherContainer = document.getElementById('global-ketcher-container')
    const modalContainer = modalContainerRef.current

    if (isOpen && isReady && ketcherContainer && modalContainer) {
      // Make visible and move into modal
      Object.assign(ketcherContainer.style, {
        position: 'static',
        top: 'auto',
        left: 'auto',
        visibility: 'visible',
        width: '100%',
        height: '100%',
      })
      modalContainer.appendChild(ketcherContainer)

      // Load molfile AFTER container is visible and ready
      const loadMolfile = async () => {
        const ketcher = (window as any).ketcher
        if (!ketcher) {
          console.error('❌ Ketcher instance not found')
          return
        }

        const molfile = initialMolfile?.trim() || ''

        try {
          if (molfile) {
            console.log(
              '📝 Calling setMolecule with molfile length:',
              molfile.length,
            )
            const result = await ketcher.setMolecule(molfile)
            console.log('✅ setMolecule result:', result)

            // Verify it loaded
            const currentMol = await ketcher.getMolfile()
            console.log(
              '🔍 Current molfile in editor (first 200 chars):',
              currentMol.substring(0, 200),
            )
            console.log(
              '🔍 Has atoms:',
              currentMol.includes('V2000') && !currentMol.includes('0  0  0'),
            )
          }
        } catch (error) {
          console.error('❌ Error loading molfile:', error)
        }
      }

      // Give the DOM time to update after moving the container
      setTimeout(loadMolfile, 800)
    }

    // Move back when modal closes
    return () => {
      if (ketcherContainer && document.body) {
        Object.assign(ketcherContainer.style, {
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          width: '800px',
          height: '600px',
        })
        document.body.appendChild(ketcherContainer)
      }
    }
  }, [isOpen, isReady, initialMolfile])

  const handleSave = async () => {
    if (typeof window !== 'undefined') {
      const ketcher = (window as any).ketcher
      if (ketcher) {
        try {
          const molfileData = await ketcher.getMolfile()
          onSave(molfileData)
          onClose()
        } catch (error) {
          console.error('Error getting molfile:', error)
          alert('Error generating molfile. Please try again.')
        }
      } else {
        alert('Ketcher editor is not initialized yet.')
      }
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      width="90%"
      style={{ top: 20 }}
      title="Draw Molecule Structure"
      footer={
        <div className="flex flex-row justify-end gap-2">
          <Button key="back" label="Cancel" onClick={handleCancel} />
          <Button
            key="submit"
            label="Save Molfile"
            onClick={handleSave}
            variant="primary"
            disabled={!isReady}
          />
        </div>
      }
    >
      <div ref={modalContainerRef} className="h-[600px]">
        {!isReady && (
          <div className="flex h-[600px] flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-kit-primary-full)]"></div>
            <p className="text-gray-500">Loading Ketcher Editor...</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
