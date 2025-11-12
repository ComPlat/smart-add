'use client'

import { useState } from 'react'
import { Editor } from 'ketcher-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import 'ketcher-react/dist/index.css'

interface KetcherEditorWrapperProps {
  onInit?: (ketcher: any) => void
}

export default function KetcherEditorWrapper({
  onInit,
}: KetcherEditorWrapperProps) {
  const [structServiceProvider] = useState(
    () => new StandaloneStructServiceProvider(),
  )

  return (
    <div className="h-full w-full">
      <Editor
        staticResourcesUrl=""
        structServiceProvider={structServiceProvider}
        errorHandler={(error: string) => {
          console.error('Ketcher error:', error)
        }}
        onInit={(ketcher: any) => {
          console.log('Ketcher initialized:', ketcher)
          onInit?.(ketcher)
        }}
      />
    </div>
  )
}
