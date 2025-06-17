import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PUA Game Mobile - 学术PUA生存游戏',
  description: '在这个模拟游戏中，你将扮演一名研究生，面对学术PUA导师的各种压力和挑战。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-mono">
        {children}
      </body>
    </html>
  )
}