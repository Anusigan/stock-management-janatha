import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard-stats"
import { StockTabs } from "@/components/stock-tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings, Package, Sparkles } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()

  // Fetch items, sizes, and transactions
  const { data: items } = await supabase.from("items").select("*").order("name")
  const { data: sizes } = await supabase.from("sizes").select("*").order("name")
  const { data: transactions } = await supabase
    .from("stock_transactions")
    .select(
      `
      *,
      items (name),
      sizes (name)
    `,
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })

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
              {/* Compact Settings Button */}
              <Button
                asChild
                className="bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-lg transition-all duration-300 font-medium text-sm px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <DashboardStats transactions={transactions || []} />

        <StockTabs initialItems={items || []} initialSizes={sizes || []} initialTransactions={transactions || []} />
      </main>
    </div>
  )
}
