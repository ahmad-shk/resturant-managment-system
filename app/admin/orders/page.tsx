"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { initializeFirebase, onDatabaseValue, updateDatabase } from "@/lib/firebase"
import { format } from "date-fns"
import { ShoppingCart } from "lucide-react"

interface Order {
  id: string
  tableNumber: number
  items: Array<{ name: string; quantity: number; price: number }>
  timestamp: string
  status: "pending" | "preparing" | "ready" | "served"
  total: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "ready" | "served">("all")

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
            // Sort by timestamp, newest first
            ordersArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateDatabase(`orders/${orderId}`, { status: newStatus })
      console.log("[v0] Order status updated:", orderId, newStatus)
    } catch (error) {
      console.error("[v0] Error updating order status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "preparing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "ready":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "served":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter)

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    served: orders.filter((o) => o.status === "served").length,
  }

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
      <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Order Management</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage and track all incoming orders</p>
        </div>

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
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
            Order Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage and track all incoming orders</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {(["all", "pending", "preparing", "ready", "served"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 col-span-full">
            <CardContent className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-base sm:text-lg mb-1">
                No {filter !== "all" ? filter : ""} orders found
              </p>
              <p className="text-slate-500 text-sm">Orders will appear here in real-time</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all">
              <CardHeader className="pb-3 px-4 sm:px-6 pt-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">Table {order.tableNumber}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 truncate">
                      {format(new Date(order.timestamp), "MMM dd, yyyy 'at' hh:mm a")}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} flex-shrink-0 text-xs`}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs sm:text-sm gap-2">
                      <span className="text-slate-300 truncate flex-1">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-slate-400 flex-shrink-0">
                        ₨{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-slate-700 flex justify-between font-medium">
                  <span className="text-sm sm:text-base">Total</span>
                  <span className="text-sm sm:text-base text-green-400">₨{order.total.toLocaleString()}</span>
                </div>

                {/* Status Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, "preparing")}
                      className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm flex-1 h-9"
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, "ready")}
                      className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 h-9"
                    >
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, "served")}
                      className="bg-slate-600 hover:bg-slate-700 text-xs sm:text-sm flex-1 h-9"
                    >
                      Mark Served
                    </Button>
                  )}
                  {order.status === "served" && (
                    <Badge variant="outline" className="text-slate-400 text-xs sm:text-sm w-full justify-center py-2">
                      Order Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
