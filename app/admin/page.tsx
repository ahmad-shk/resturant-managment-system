"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { MENU_ITEMS } from "@/lib/menu-items"
import { initializeFirebase, onDatabaseValue } from "@/lib/firebase"
import { ShoppingCart } from "lucide-react"

interface Order {
  id: string
  tableNumber: number
  items: Array<{ name: string; quantity: number }>
  timestamp: string
  status: string
  total: number
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [timeRange, setTimeRange] = useState("daily")
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupFirebase = async () => {
      try {
        const db = await initializeFirebase()
        if (!db) {
          console.log("[v0] Firebase not available")
          setLoading(false)
          return
        }

        setConnected(true)

        const unsub = await onDatabaseValue("orders", (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val()
            const ordersArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }))
            console.log("[v0] Orders loaded:", ordersArray.length)
            setOrders(ordersArray)
          } else {
            console.log("[v0] No orders found")
            setOrders([])
          }
          setLoading(false)
        })

        unsubscribe = unsub
      } catch (error) {
        console.error("[v0] Error setting up Firebase:", error)
        setLoading(false)
      }
    }

    setupFirebase()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const getChartData = () => {
    const aggregated: Record<string, Record<string, number>> = {}

    orders.forEach((order) => {
      const date = new Date(order.timestamp)
      let key = ""

      if (timeRange === "daily") {
        key = format(date, "MMM dd")
      } else if (timeRange === "weekly") {
        key = `Week ${Math.ceil(date.getDate() / 7)}`
      } else if (timeRange === "monthly") {
        key = format(date, "MMM")
      }

      if (!aggregated[key]) {
        aggregated[key] = {}
      }

      order.items.forEach((item) => {
        const menuItem = MENU_ITEMS.find((m) => m.name.toLowerCase() === item.name.toLowerCase())
        const itemName = menuItem?.name || item.name
        aggregated[key][itemName] = (aggregated[key][itemName] || 0) + item.quantity
      })
    })

    return Object.entries(aggregated).map(([date, items]) => ({
      date,
      ...items,
    }))
  }

  const getStatusStats = () => {
    const stats = { pending: 0, preparing: 0, ready: 0, served: 0 }
    orders.forEach((order) => {
      stats[order.status as keyof typeof stats]++
    })
    return stats
  }

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.total, 0)
  }

  const stats = getStatusStats()
  const chartData = getChartData()
  const totalRevenue = getTotalRevenue()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 text-sm">Connecting to Firebase...</p>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full">
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 sm:p-6 text-center space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-amber-200">Firebase Connection Required</h2>
          <p className="text-amber-100 text-sm">
            Please ensure your Firebase Realtime Database is enabled in the Firebase Console.
          </p>
          <div className="mt-4">
            <a
              href="https://console.firebase.google.com/project/restaurant-order-system-52c7e/database"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition"
            >
              Open Firebase Console →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full min-w-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-slate-800 border-slate-700 hover:border-amber-500/50 transition-all">
          <CardHeader className="pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400">{stats.pending}</div>
            <p className="text-xs text-slate-500 mt-1">Waiting to prepare</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-all">
          <CardHeader className="pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Preparing</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">{stats.preparing}</div>
            <p className="text-xs text-slate-500 mt-1">In kitchen</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:border-green-500/50 transition-all">
          <CardHeader className="pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Ready</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400">{stats.ready}</div>
            <p className="text-xs text-slate-500 mt-1">For delivery</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500/50 transition-all">
          <CardHeader className="pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-400 truncate">
              ₨{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">All orders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Recent Orders</CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm">Real-time order tracking</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm sm:text-base">No orders yet</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Orders will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-white truncate">Table {order.tableNumber}</p>
                    <p className="text-xs sm:text-sm text-slate-400">{order.items.length} items</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm sm:text-base font-medium text-green-400">₨{order.total}</p>
                    <p className="text-xs sm:text-sm text-slate-400 capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
