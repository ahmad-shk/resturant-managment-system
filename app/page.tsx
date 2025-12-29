"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { getTranslation } from "@/lib/translations"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function HomePage() {
  const { language, setLanguage } = useLanguage()
  const t = (key: string) => getTranslation(language, key as any)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full bg-slate-900 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{t("appName")}</h1>
          <div className="flex gap-2">
            <Button onClick={() => setLanguage("en")} variant={language === "en" ? "default" : "outline"} size="sm">
              EN
            </Button>
            <Button onClick={() => setLanguage("zh")} variant={language === "zh" ? "default" : "outline"} size="sm">
              中文
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-foreground mb-3">{t("homeDescription")}</h2>
            <p className="text-lg text-muted-foreground">{t("adminWelcome")}</p>
          </div>

          {/* Admin Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-orange-100 dark:bg-orange-900 p-6 rounded-lg">
                <Shield className="w-16 h-16 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-semibold text-foreground mb-3">{t("adminPanel")}</h2>
                <p className="text-muted-foreground mb-6 text-lg">{t("adminPanelDescription")}</p>
                <Link href="/admin">
                  <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6">
                    {t("openAdminPanel")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
