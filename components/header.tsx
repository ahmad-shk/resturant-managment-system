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
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50 w-full shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
              {getPageTitle()}
            </h2>
            <p className="text-slate-400 text-[10px] sm:text-sm mt-0.5 hidden sm:block">
              Real-time restaurant management system
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                onClick={() => setLanguage("en")}
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-sm min-w-[36px] sm:min-w-[44px]"
              >
                EN
              </Button>
              <Button
                onClick={() => setLanguage("zh")}
                variant={language === "zh" ? "default" : "outline"}
                size="sm"
                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-sm min-w-[36px] sm:min-w-[44px]"
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
