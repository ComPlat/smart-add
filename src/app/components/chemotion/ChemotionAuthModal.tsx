'use client'

import { useState, useEffect, useRef } from 'react'
import { chemotionApi } from '@/services/chemotionApi'

type ChemotionAuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onAuthenticate: (
    serverUrl: string,
    email: string,
    password: string,
  ) => Promise<void>
  isLoading?: boolean
}

const ChemotionAuthModal = ({
  isOpen,
  onClose,
  onBack,
  onAuthenticate,
  isLoading = false,
}: ChemotionAuthModalProps) => {
  const [serverUrl, setServerUrl] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pingStatus, setPingStatus] = useState<
    'idle' | 'checking' | 'success' | 'error'
  >('idle')
  const [pingMessage, setPingMessage] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved server URL from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('chemotion_server_url')
      if (savedUrl) {
        setServerUrl(savedUrl)
      }
    }
  }, [])

  // Auto-ping server with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current)
    }

    // Reset status if URL is empty
    if (!serverUrl) {
      setPingStatus('idle')
      setPingMessage('')
      return
    }

    // Basic URL validation
    try {
      new URL(serverUrl)
    } catch {
      setPingStatus('error')
      setPingMessage('Invalid URL format')
      return
    }

    // Set checking status and debounce the ping
    setPingStatus('checking')
    setPingMessage('Checking server...')

    pingTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await chemotionApi.ping(serverUrl)
        if (result.success) {
          setPingStatus('success')
          setPingMessage('Server is reachable')
        } else {
          setPingStatus('error')
          setPingMessage(result.message || 'Server unreachable')
        }
      } catch {
        setPingStatus('error')
        setPingMessage('Failed to connect to server')
      }
    }, 800) // 800ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current)
      }
    }
  }, [serverUrl])

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent multiple submissions
    if (isLoading) return

    if (serverUrl && email && password) {
      // Save server URL for next time
      if (typeof window !== 'undefined') {
        localStorage.setItem('chemotion_server_url', serverUrl)
      }
      await onAuthenticate(serverUrl, email, password)
    }
  }

  // Handle Escape key to close modal
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null // Do not render anything if modal is not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Connect to Chemotion ELN
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Server URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="https://your-chemotion-server.com"
                className={`w-full rounded-lg border px-3 py-2 shadow-sm outline-none focus:ring-1 ${
                  pingStatus === 'success'
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                    : pingStatus === 'error'
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-kit-primary-full focus:ring-kit-primary-full'
                }`}
                disabled={isLoading}
                required
              />
              {pingStatus === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-kit-primary-full"></div>
                </div>
              )}
              {pingStatus === 'success' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {pingStatus === 'error' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>
            {pingMessage && (
              <p
                className={`mt-1 text-xs ${
                  pingStatus === 'success'
                    ? 'text-green-600'
                    : pingStatus === 'error'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {pingMessage}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="your login name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-kit-primary-full focus:ring-1 focus:ring-kit-primary-full"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-kit-primary-full focus:ring-1 focus:ring-kit-primary-full"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex justify-between space-x-2 pt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center justify-center text-gray-600 border border-gray-300 gap-2 disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none hover:bg-gray-50 duration-150 rounded-lg bg-white p-2 min-w-[80px] text-sm"
            >
              ← Back
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex items-center justify-center text-kit-primary-full border border-kit-primary-full gap-2 disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none hover:bg-kit-primary-light/5 duration-150 rounded-lg bg-white p-2 min-w-[80px] text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !serverUrl ||
                  !email ||
                  !password ||
                  isLoading ||
                  pingStatus === 'checking' ||
                  pingStatus === 'error'
                }
                className="flex items-center justify-center text-white gap-2 border disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none hover:bg-kit-primary-full/90 duration-150 rounded-lg bg-kit-primary-full p-2 min-w-[80px] text-sm"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export { ChemotionAuthModal }
