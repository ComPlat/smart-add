'use client'

import dynamic from 'next/dynamic'

const KetcherEditorWrapper = dynamic(
  () => import('./input-components/KetcherEditorWrapper'),
  {
    ssr: false,
  },
)

export default function GlobalKetcherInit() {
  return (
    <div
      id="global-ketcher-container"
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '800px',
        height: '600px',
        visibility: 'hidden',
      }}
    >
      <KetcherEditorWrapper />
    </div>
  )
}
