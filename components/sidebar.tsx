"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ShoppingCart, UtensilsCrossed, Menu, X } from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/items", label: "Menu Items", icon: UtensilsCrossed },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-white hover:bg-slate-700 shadow-lg transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-full w-72 sm:w-80 md:w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 p-4 sm:p-6 transition-transform duration-300 ease-in-out md:translate-x-0 z-40 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 sm:mb-8 flex items-center gap-3 pt-14 md:pt-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <UtensilsCrossed size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">RestroAdmin</h1>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-2">Restaurant Admin System v1.0</p>
          <p className="text-xs text-slate-600">Firebase Integrated</p>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}
    </>
  )
}
