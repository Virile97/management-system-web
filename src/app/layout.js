import { Source_Serif_4, Inter } from "next/font/google"
import "../globals.css"

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Management System",
  description: "Management System",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
