"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRestaurant } from "@/lib/restaurant-context"
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react"
import { getTranslation } from "@/lib/translations"
import { useLanguage } from "@/lib/language-context"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { Order } from "@/lib/types"

export default function AdminDashboard() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key as any)

  const { getAllActiveOrders, getCompletedOrders, loading, error } = useRestaurant()
  const [orders, setOrders] = useState<Order[]>([])
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "3m" | "6m" | "1y">("1w")

  useEffect(() => {
    const activeOrders = getAllActiveOrders()
    const completed = getCompletedOrders()
    const allOrders = [...activeOrders, ...completed]
    setOrders(allOrders)
  }, [getAllActiveOrders, getCompletedOrders])

  const analytics = useMemo(() => {
    const now = Date.now()
    const ranges = {
      "1d": 24 * 60 * 60 * 1000,
      "1w": 7 * 24 * 60 * 60 * 1000,
      "1m": 30 * 24 * 60 * 60 * 1000,
      "3m": 90 * 24 * 60 * 60 * 1000,
      "6m": 180 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    }

    const filteredOrders = orders.filter((order) => now - order.createdAt <= ranges[timeRange])

    // Total revenue and orders
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalOrders = filteredOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Revenue over time (grouped by day/week/month based on range)
    const revenueByTime: { [key: string]: number } = {}
    const ordersByTime: { [key: string]: number } = {}

    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt)
      let key: string

      if (timeRange === "1d") {
        key = `${date.getHours()}:00`
      } else if (timeRange === "1w" || timeRange === "1m") {
        key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      } else {
        key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      }

      revenueByTime[key] = (revenueByTime[key] || 0) + (order.totalAmount || 0)
      ordersByTime[key] = (ordersByTime[key] || 0) + 1
    })

    const revenueChartData = Object.keys(revenueByTime)
      .map((key) => ({
        date: key,
        revenue: revenueByTime[key],
        orders: ordersByTime[key],
      }))
      .slice(-20) // Last 20 data points

    // Top selling items
    const itemCounts: { [key: string]: { count: number; revenue: number } } = {}
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 }
        }
        itemCounts[item.name].count += item.quantity
        itemCounts[item.name].revenue += (item.price || 0) * item.quantity
      })
    })

    const topItems = Object.keys(itemCounts)
      .map((name) => ({ name, ...itemCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Order status distribution
    const statusCounts = {
      pending: filteredOrders.filter((o) => o.status === "pending").length,
      preparing: filteredOrders.filter((o) => o.status === "preparing").length,
      ready: filteredOrders.filter((o) => o.status === "ready").length,
      serving: filteredOrders.filter((o) => o.status === "serving").length,
      completed: filteredOrders.filter((o) => o.status === "completed").length,
    }

    const statusChartData = Object.keys(statusCounts)
      .map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusCounts[status as keyof typeof statusCounts],
      }))
      .filter((item) => item.value > 0)

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueChartData,
      topItems,
      statusChartData,
      statusCounts,
    }
  }, [orders, timeRange])

  const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full">
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 sm:p-6 text-center space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-amber-200">Firebase Connection Required</h2>
          <p className="text-amber-100 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Restaurant Analytics</h1>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-slate-800 border-slate-700 h-9 sm:h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="1d">Last 24 Hours</SelectItem>
            <SelectItem value="1w">Last Week</SelectItem>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-850 border-slate-700 hover:border-slate-600 transition-all shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-400">€{analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">From {analytics.totalOrders} orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-850 border-slate-700 hover:border-slate-600 transition-all shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Total Orders</CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">{analytics.totalOrders}</div>
            <p className="text-xs text-slate-500 mt-1">Orders processed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-850 border-slate-700 hover:border-slate-600 transition-all shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Average Order</CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              €{analytics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Per order value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-850 border-slate-700 hover:border-slate-600 transition-all shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Active Orders</CardTitle>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-orange-400">
              {analytics.statusCounts.pending +
                analytics.statusCounts.preparing +
                analytics.statusCounts.ready +
                analytics.statusCounts.serving}
            </div>
            <p className="text-xs text-slate-500 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Over Time */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Revenue Trend</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Revenue and orders over time
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.revenueChartData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "10px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (€)" />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Order Status</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">Current order distribution</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={window.innerWidth < 640 ? 70 : 85}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: window.innerWidth < 640 ? "10px" : "12px" }}
                >
                  {analytics.statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Top Selling Items</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Most popular menu items by quantity sold
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.topItems} margin={{ left: -20, right: 10, top: 5, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  style={{ fontSize: window.innerWidth < 640 ? "9px" : "11px" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="count" fill="#f97316" name="Quantity Sold" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (€)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Items Table */}
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Top Items Details</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Detailed breakdown of best sellers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-400">Item Name</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-slate-400">Qty Sold</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-slate-400">Revenue</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-slate-400">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-750 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-white font-medium">{item.name}</td>
                      <td className="py-3 px-3 sm:px-4 text-right text-blue-400 font-semibold">{item.count}</td>
                      <td className="py-3 px-3 sm:px-4 text-right text-green-400 font-semibold">
                        €{item.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right text-slate-300">
                        €{(item.revenue / item.count).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
