import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DareePayco',
  description: 'Dareesoft 페이코 점심 메뉴 뽑기',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
