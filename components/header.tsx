"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { initializeFirebase } from "@/lib/firebase"

export function Header() {
  const pathname = usePathname()
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const db = await initializeFirebase()
        setIsLiveConnected(!!db)
      } catch (error) {
        console.error("[v0] Firebase check error:", error)
        setIsLiveConnected(false)
      } finally {
        setChecking(false)
      }
    }

    checkFirebase()
  }, [])

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard"
    if (pathname === "/admin/orders") return "Order Management"
    if (pathname === "/admin/items") return "Menu Items"
    return "Admin"
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-20 w-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ml-0 md:ml-0">
        <div className="w-full sm:w-auto pl-12 md:pl-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{getPageTitle()}</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Real-time restaurant management system</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto pl-12 md:pl-0">
          <p className="text-slate-300 text-sm font-medium">
            {checking ? "Checking..." : isLiveConnected ? "Firebase Connected" : "Firebase Setup Required"}
          </p>
          {!checking && (
            <>
              {isLiveConnected ? (
                <p className="text-green-400 text-xs font-semibold animate-pulse">● Live Data</p>
              ) : (
                <a
                  href="https://console.firebase.google.com/project/restaurant-order-system-52c7e/database"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 text-xs underline inline-block mt-1"
                >
                  Enable Realtime Database
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
