import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jarvis - gAIng-brAin Dashboard',
  description: 'Command center for the gAIng Collective - AI agent orchestration and monitoring',
  keywords: ['AI', 'agents', 'orchestration', 'dashboard', 'Jarvis', 'gAIng-brAin'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
