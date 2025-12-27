"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"]

interface Order {
  id: string
  tableNumber: number
  items: Array<{ name: string; quantity: number }>
  timestamp: Date
  status: string
  total: number
}

interface AdvancedChartsProps {
  orders: Order[]
}

export function AdvancedCharts({ orders }: AdvancedChartsProps) {
  const [chartPeriod, setChartPeriod] = useState("3months")

  const generateTimeSeriesData = () => {
    const now = new Date()
    const data: any[] = []

    if (chartPeriod === "daily") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          period: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          orders: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 50000) + 20000,
        })
      }
    } else if (chartPeriod === "weekly") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i * 7)
        data.push({
          period: `Week ${Math.ceil(date.getDate() / 7)}`,
          orders: Math.floor(Math.random() * 100) + 30,
          revenue: Math.floor(Math.random() * 300000) + 100000,
        })
      }
    } else if (chartPeriod === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        data.push({
          period: date.toLocaleDateString("en-US", { month: "short" }),
          orders: Math.floor(Math.random() * 300) + 100,
          revenue: Math.floor(Math.random() * 1000000) + 300000,
        })
      }
    } else if (chartPeriod === "3months") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      for (const month of months) {
        data.push({
          period: month,
          orders: Math.floor(Math.random() * 800) + 300,
          revenue: Math.floor(Math.random() * 2000000) + 800000,
        })
      }
    } else if (chartPeriod === "6months") {
      const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      for (const month of months) {
        data.push({
          period: month,
          orders: Math.floor(Math.random() * 800) + 300,
          revenue: Math.floor(Math.random() * 2000000) + 800000,
        })
      }
    } else if (chartPeriod === "yearly") {
      const years = ["2020", "2021", "2022", "2023", "2024"]
      for (const year of years) {
        data.push({
          period: year,
          orders: Math.floor(Math.random() * 3000) + 1000,
          revenue: Math.floor(Math.random() * 10000000) + 3000000,
        })
      }
    }

    return data
  }

  const getItemStats = () => {
    const itemCounts: Record<string, number> = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity
      })
    })
    return Object.entries(itemCounts).map(([name, value]) => ({ name, value }))
  }

  const timeSeriesData = generateTimeSeriesData()
  const itemStats = getItemStats()

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" },
          { label: "Monthly", value: "monthly" },
          { label: "3 Months", value: "3months" },
          { label: "6 Months", value: "6months" },
          { label: "Yearly", value: "yearly" },
        ].map((period) => (
          <button
            key={period.value}
            onClick={() => setChartPeriod(period.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              chartPeriod === period.value
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Revenue & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription className="text-slate-400">Total revenue over {chartPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value) => `₨${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Orders Count</CardTitle>
            <CardDescription className="text-slate-400">Total orders over {chartPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Item Sales & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription className="text-slate-400">Items by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={itemStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {itemStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription className="text-slate-400">Key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Total Orders</span>
                <span className="text-2xl font-bold text-green-400">
                  {timeSeriesData.reduce((sum, d) => sum + d.orders, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Total Revenue</span>
                <span className="text-2xl font-bold text-blue-400">
                  ₨{(timeSeriesData.reduce((sum, d) => sum + d.revenue, 0) / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Average Order Value</span>
                <span className="text-2xl font-bold text-amber-400">
                  ₨
                  {Math.round(
                    timeSeriesData.reduce((sum, d) => sum + d.revenue, 0) /
                      timeSeriesData.reduce((sum, d) => sum + d.orders, 0),
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Top Item</span>
                <span className="text-2xl font-bold text-purple-400">
                  {itemStats.length > 0 ? itemStats[0].name : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
