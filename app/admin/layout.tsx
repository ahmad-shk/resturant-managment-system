"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 relative z-40">
        <Header />
        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 md:py-8 overflow-x-hidden relative z-0">{children}</main>
      </div>
    </div>
  )
}
