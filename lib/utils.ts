import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateQRCodeUrl(tableNumber: number): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  return `${baseUrl}/order?table=${tableNumber}`
}

export function getTableNumberFromQuery(): number | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const table = params.get("table")
  return table ? Number.parseInt(table, 10) : null
}
