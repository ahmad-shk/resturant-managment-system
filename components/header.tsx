"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

export function Header() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const t = (key: string) => getTranslation(language, key as any)

  const getPageTitle = () => {
    if (pathname === "/admin") return t("adminDashboard")
    if (pathname === "/admin/orders") return "Order Management"
    if (pathname === "/admin/items") return t("menuManagement")
    return "Admin"
  }

  return (
    // Tabdeeli: z-index ko z-40 kiya taake Sidebar (jo aksar z-50 hota hai) iske upar aaye
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-40 w-full shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Mobile Layout Fix: flex-nowrap aur items-center */}
        <div className="flex items-center justify-between gap-2">
          
          <div className="min-w-0 flex-1 overflow-hidden">
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">
              {getPageTitle()}
            </h2>
            {/* Mobile pe sub-text chota aur saaf dikhega */}
            <p className="text-slate-400 text-[10px] sm:text-sm mt-0.5 hidden xs:block truncate">
              Real-time management
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Language Switcher container */}
            <div className="flex items-center bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <Button
                onClick={() => setLanguage("en")}
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-[10px] sm:text-xs ${language === 'en' ? 'bg-blue-600' : 'text-slate-400'}`}
              >
                EN
              </Button>
              <Button
                onClick={() => setLanguage("zh")}
                variant={language === "zh" ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-[10px] sm:text-xs ${language === 'zh' ? 'bg-blue-600' : 'text-slate-400'}`}
              >
                中文
              </Button>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}