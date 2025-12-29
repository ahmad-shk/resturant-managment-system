import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { RestaurantProvider } from "@/lib/restaurant-context"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <RestaurantProvider>
            {children}
            <Analytics />
          </RestaurantProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
