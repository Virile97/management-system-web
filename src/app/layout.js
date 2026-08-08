import { Plus_Jakarta_Sans, Inter } from "next/font/google"
import "../globals.css"

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: "Management System",
  icons: {
    icon: "/images/logo.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
