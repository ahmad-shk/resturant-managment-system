import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant Admin Dashboard",
  description: "Real-time order management and analytics for restaurants",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased overflow-x-hidden">
        <div className="flex min-h-screen w-full overflow-x-hidden">
          {/* Sidebar - responsive mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Mobile sidebar */}
          <div className="md:hidden">
            <Sidebar />
          </div>

          {/* Main content - responsive layout */}
          <div className="flex-1 flex flex-col w-full md:ml-64 min-w-0">
            <Header />
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-950 w-full min-w-0 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="top-right" theme="dark" />
        <Analytics />
      </body>
    </html>
  )
}
