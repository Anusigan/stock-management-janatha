'use client'

import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/components/dashboard-stats"
import { StockTabs } from "@/components/stock-tabs"
import { UserMenu } from "@/components/user-menu"
import { Loader2 } from "lucide-react"

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
        console.log('Fetching dashboard data...')
        
        // Test simple query first
        const testResult = await supabase.from("items").select("count", { count: "exact" })
        console.log('Test query result:', testResult)
        
        // Fetch data with error handling for each table
        const itemsResult = await supabase.from("items").select("*").order("name")
        console.log('Items result:', itemsResult)
        
        const sizesResult = await supabase.from("sizes").select("*").order("name")
        console.log('Sizes result:', sizesResult)
        
        const transactionsResult = await supabase
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
        
        console.log('Transactions result:', transactionsResult)

        console.log('Data fetch results:', {
          items: itemsResult.data?.length || 0,
          sizes: sizesResult.data?.length || 0,
          transactions: transactionsResult.data?.length || 0,
          itemsError: itemsResult.error,
          sizesError: sizesResult.error,
          transactionsError: transactionsResult.error
        })

        if (itemsResult.error) {
          console.error('Items error:', itemsResult.error)
        } else if (itemsResult.data) {
          setItems(itemsResult.data)
        }
        
        if (sizesResult.error) {
          console.error('Sizes error:', sizesResult.error)
        } else if (sizesResult.data) {
          setSizes(sizesResult.data)
        }
        
        if (transactionsResult.error) {
          console.error('Transactions error:', transactionsResult.error)
        } else if (transactionsResult.data) {
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
          <div className="w-20 h-20 mx-auto mb-6">
            <img 
              src="/flux-logo.png" 
              alt="Flux Logo" 
              className="w-full h-full object-cover rounded-2xl shadow-xl"
            />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Flux</h2>
          <p className="text-slate-600 mb-4">Stock Management Simplified</p>
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mx-auto" />
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
                  <div className="w-10 h-10">
                    <img 
                      src="/flux-logo.png" 
                      alt="Flux Logo" 
                      className="w-full h-full object-cover rounded-full shadow-lg border border-white/30"
                    />
                  </div>
                </div>
                
                {/* Compact title */}
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                    Flux
                  </h1>
                  <span className="text-xs text-gray-400 font-medium">
                    Stock Management Simplified
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
