import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'MoodTune - 心声日记',
  description: '用音乐记录每一天的心情，AI 陪你看见情绪的轨迹',
  keywords: ['心情日记', '音乐', 'AI', '情绪追踪', '心理健康'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
