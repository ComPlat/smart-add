'use client'

import { useRef } from 'react'
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
}

export default function KetcherModal({
  isOpen,
  onClose,
  onSave,
}: KetcherModalProps) {
  const ketcherRef = useRef<any>(null)

  const handleSave = async () => {
    if (ketcherRef.current) {
      try {
        const molfileData = await ketcherRef.current.getMolfile()
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

  // Pass the ref setter to the KetcherEditor
  const handleKetcherInit = (ketcher: any) => {
    ketcherRef.current = ketcher
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
