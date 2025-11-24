import { Ketcher } from 'ketcher-core'
import { Editor } from 'ketcher-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import 'ketcher-react/dist/index.css'

interface KetcherEditorWrapperProps {
  onInit?: (ketcher: Ketcher) => void
}
const structServiceProvider = new StandaloneStructServiceProvider()

export default function KetcherEditorWrapper({}: KetcherEditorWrapperProps) {
  return (
    <div className="h-full w-full">
      <Editor
        staticResourcesUrl="/"
        structServiceProvider={structServiceProvider}
        errorHandler={(error: string) => {
          console.error('Ketcher error:', error)
        }}
        onInit={(ketcher: Ketcher) => {
          // Make ketcher available globally for debugging (optional)
          if (typeof window !== 'undefined') {
            ;(window as any).ketcher = ketcher
          }
        }}
      />
    </div>
  )
}
