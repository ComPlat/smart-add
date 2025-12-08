import type { Metadata } from 'next'

import './globals.css'
import GlobalKetcherInit from './components/GlobalKetcherInit'

export const metadata: Metadata = {
  description: 'A description for SmartAdd app',
  title: 'SmartAdd',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GlobalKetcherInit />
        {children}
      </body>
    </html>
  )
}
