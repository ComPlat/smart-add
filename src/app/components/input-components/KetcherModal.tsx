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
    const checkKetcher = setInterval(async () => {
      if (typeof window !== 'undefined' && (window as any).ketcher) {
        const ketcher = (window as any).ketcher
        setIsReady(true)
        await ketcher.setMolecule(initialMolfile)
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
    const ketcher = (window as any).ketcher
    ketcher?.setMolecule('')
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
