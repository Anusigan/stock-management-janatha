import { createClient } from "@/lib/supabase/server"
import { MasterDataManager } from "@/components/master-data-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Database } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  // Fetch existing items, sizes, and customers
  const { data: items } = await supabase.from("items").select("*").order("name")
  const { data: sizes } = await supabase.from("sizes").select("*").order("name")
  const { data: customers } = await supabase.from("customers").select("*").order("name")

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-2xl border-b-4 border-white/20 relative overflow-hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Master Data Management</h1>
                <p className="text-gray-400 text-sm">Manage items, sizes, and customers</p>
              </div>
            </div>
            <Button asChild variant="outline" className="bg-white text-black hover:bg-gray-100">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MasterDataManager initialItems={items || []} initialSizes={sizes || []} initialCustomers={customers || []} />
      </main>
    </div>
  )
}
