import './globals.css'

export const metadata = {
  title: 'Army Dashboard',
  description: 'ระบบบัญชาการกองทัพ',
  icons: {
    icon: '/logo.png', // Fallback to logo.png which is also transparent
    shortcut: '/logo.png',
    apple: '/logo.png',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}