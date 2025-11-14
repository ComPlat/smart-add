'use client'

import { useEffect, useRef } from 'react'
import { Button } from '../workspace/Button'
import { FaDownload, FaUpload } from 'react-icons/fa'

type ExportCollectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
  onUploadToChemotion: () => void
}

const ExportCollectionModal = ({
  isOpen,
  onClose,
  onDownload,
  onUploadToChemotion,
}: ExportCollectionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-lg border border-gray-300 bg-white p-6 shadow-lg"
      >
        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          Export Collection
        </h2>

        <div className="flex flex-col gap-4">
          {/* Download as ZIP Option */}
          <div
            onClick={onDownload}
            className="group cursor-pointer rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-kit-primary-full hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-kit-primary-full/10 p-3 group-hover:bg-kit-primary-full/20">
                <FaDownload className="h-6 w-6 text-kit-primary-full" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                  Download as ZIP
                </h3>
                <p className="text-sm text-gray-600">
                  Download your collection as a ZIP file to your computer. You
                  can manually upload it to Chemotion later.
                </p>
              </div>
            </div>
          </div>

          {/* Upload to Chemotion Option */}
          <div
            onClick={onUploadToChemotion}
            className="group cursor-pointer rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-kit-primary-full hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-kit-primary-full/10 p-3 group-hover:bg-kit-primary-full/20">
                <FaUpload className="h-6 w-6 text-kit-primary-full" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                  Upload to Chemotion ELN
                </h3>
                <p className="text-sm text-gray-600">
                  Connect to your Chemotion server and upload your collection
                  directly. No manual download needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button label="Cancel" onClick={onClose} variant="default" />
        </div>
      </div>
    </div>
  )
}

export { ExportCollectionModal }
