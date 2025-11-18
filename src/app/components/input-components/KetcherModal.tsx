'use client'

import { useState, useEffect } from 'react'
import { Modal } from 'antd'
import dynamic from 'next/dynamic'
import { Button } from '../workspace/Button'
import 'ketcher-react/dist/index.css'

const KetcherEditorWrapper = dynamic(() => import('./KetcherEditorWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-kit-primary-full)]"></div>
      <p className="text-gray-500">Loading Ketcher Editor...</p>
    </div>
  ),
})

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
  const [ketcher, setKetcher] = useState<any>(null)

  // Load or clear molfile when Ketcher is ready and modal is open
  useEffect(() => {
    if (isOpen && ketcher) {
      if (initialMolfile?.trim()) {
        ketcher.setMolecule(initialMolfile).catch((error: Error) => {
          console.error('Error loading molfile:', error)
        })
      } else {
        ketcher.setMolecule('').catch((error: Error) => {
          console.error('Error clearing editor:', error)
        })
      }
    }
  }, [isOpen, ketcher, initialMolfile])

  const handleSave = async () => {
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

  const handleCancel = () => {
    onClose()
  }

  const handleKetcherInit = (ketcherInstance: any) => {
    setKetcher(ketcherInstance)
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
          />
        </div>
      }
    >
      <div className="h-[600px]">
        {isOpen && <KetcherEditorWrapper onInit={handleKetcherInit} />}
      </div>
    </Modal>
  )
}
