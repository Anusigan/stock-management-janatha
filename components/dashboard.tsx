'use client'

import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/components/dashboard-stats"
import { StockTabs } from "@/components/stock-tabs"
import { UserMenu } from "@/components/user-menu"
import { Package, Loader2 } from "lucide-react"

interface Item {
  id: string
  name: string
  created_at: string
}

interface Size {
  id: string
  name: string
  created_at: string
}

interface RawTransaction {
  id: string
  transaction_date: string
  item_id: string
  size_id: string
  brand: string
  received_quantity: number
  issued_quantity: number
  balance: number
  items: { name: string }[] | { name: string }
  sizes: { name: string }[] | { name: string }
}

interface Transaction {
  id: string
  transaction_date: string
  item_id: string
  size_id: string
  brand: string
  received_quantity: number
  issued_quantity: number
  balance: number
  items: { name: string }
  sizes: { name: string }
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      try {
        // Fetch items, sizes, and transactions
        const [itemsResult, sizesResult, transactionsResult] = await Promise.all([
          supabase.from("items").select("*").order("name"),
          supabase.from("sizes").select("*").order("name"),
          supabase
            .from("stock_transactions")
            .select(`
              id,
              transaction_date,
              item_id,
              size_id,
              brand,
              received_quantity,
              issued_quantity,
              balance,
              items (name),
              sizes (name)
            `)
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false })
        ])

        if (itemsResult.data) setItems(itemsResult.data)
        if (sizesResult.data) setSizes(sizesResult.data)
        if (transactionsResult.data) {
          // Transform the data to match expected format
          const transformedTransactions: Transaction[] = transactionsResult.data.map((t: RawTransaction) => ({
            ...t,
            items: Array.isArray(t.items) ? t.items[0] : t.items,
            sizes: Array.isArray(t.sizes) ? t.sizes[0] : t.sizes
          }))
          setTransactions(transformedTransactions)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="sticky top-0 z-50 m-4">
        <div className="bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-full">
          <div className="px-6 py-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Compact logo */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-white to-gray-100 p-2 rounded-full shadow-lg border border-white/30">
                    <Package className="h-5 w-5 text-gray-800" />
                  </div>
                </div>
                
                {/* Compact title */}
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                    Stock Manager
                  </h1>
                  <span className="text-xs text-gray-400 font-medium">
                    by Tekvo Labs
                  </span>
                </div>
              </div>
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <DashboardStats transactions={transactions} />
        <StockTabs initialItems={items} initialSizes={sizes} initialTransactions={transactions} />
      </main>
    </div>
  )
}
