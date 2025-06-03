import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EVBolt',
  description: 'Listing your charging EV charging station.',
  generator: 'Swapnanil Manna',
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
