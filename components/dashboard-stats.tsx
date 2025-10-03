"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type Transaction = {
  id: string
  received_quantity: number
  issued_quantity: number
  balance: number
  item_id: string
  brand: string
  transaction_date: string
  items: { name: string }
  sizes: { name: string }
}

type DashboardStatsProps = {
  transactions: Transaction[]
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  const stockByItem = transactions.reduce(
    (acc, t) => {
      const key = `${t.brand}|${t.items.name}|${t.sizes.name}`
      if (!acc[key]) {
        acc[key] = {
          brand: t.brand,
          item: t.items.name,
          size: t.sizes.name,
          totalReceived: 0,
          totalIssued: 0,
        }
      }
      // Sum up all received and issued quantities
      acc[key].totalReceived += t.received_quantity
      acc[key].totalIssued += t.issued_quantity
      return acc
    },
    {} as Record<string, { brand: string; item: string; size: string; totalReceived: number; totalIssued: number }>,
  )

  // Calculate current stock for each item
  const stockItems = Object.values(stockByItem).map((item) => ({
    ...item,
    currentStock: item.totalReceived - item.totalIssued,
  }))

  // Get low stock items (current stock < 10)
  const lowStockItems = stockItems.filter((item) => item.currentStock > 0 && item.currentStock < 10)

  // Get top received items
  const topReceivedItems = [...stockItems].sort((a, b) => b.totalReceived - a.totalReceived).slice(0, 5)

  // Get top issued items
  const topIssuedItems = [...stockItems].sort((a, b) => b.totalIssued - a.totalIssued).slice(0, 5)

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6 mb-10">
      {/* Top Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 bg-gradient-to-br from-green-50 to-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Top Received Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topReceivedItems.length > 0 ? (
              topReceivedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">
                    {item.brand} - {item.item} ({item.size})
                  </span>
                  <Badge className="bg-green-500 text-white hover:bg-green-600 ml-2">+{item.totalReceived}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-red-50 to-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Top Issued Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topIssuedItems.length > 0 ? (
              topIssuedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">
                    {item.brand} - {item.item} ({item.size})
                  </span>
                  <Badge className="bg-red-500 text-white hover:bg-red-600 ml-2">-{item.totalIssued}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-yellow-50 to-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Low Stock Alert ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">
                    {item.brand} - {item.item} ({item.size})
                  </span>
                  <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 ml-2">{item.currentStock}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">All items well stocked</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Stock Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl text-white">
                  <th className="text-left py-4 px-6 font-semibold rounded-l-2xl">Brand</th>
                  <th className="text-left py-4 px-6 font-semibold">Item</th>
                  <th className="text-left py-4 px-6 font-semibold">Size</th>
                  <th className="text-right py-4 px-6 font-semibold rounded-r-2xl">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.length > 0 ? (
                  stockItems
                    .sort((a, b) => b.currentStock - a.currentStock)
                    .map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{item.brand}</td>
                        <td className="py-3 px-4">{item.item}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{item.size}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            className={
                              item.currentStock === 0
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : item.currentStock < 10
                                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                  : "bg-green-500 text-white hover:bg-green-600"
                            }
                          >
                            {item.currentStock}
                          </Badge>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No stock data available. Start by adding stock!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-2 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {txn.received_quantity > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {txn.brand} - {txn.items.name} ({txn.sizes.name})
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(txn.transaction_date || Date.now()), "PP")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {txn.received_quantity > 0 ? (
                      <Badge className="bg-green-500 text-white">+{txn.received_quantity}</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">-{txn.issued_quantity}</Badge>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Balance: {txn.balance}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
