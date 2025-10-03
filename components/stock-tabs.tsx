"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddStockForm } from "@/components/add-stock-form"
import { IssueStockForm } from "@/components/issue-stock-form"
import { TransactionHistory } from "@/components/transaction-history"
import { Plus, Minus, History, TrendingUp, TrendingDown } from "lucide-react"

type Item = {
  id: string
  name: string
}

type Size = {
  id: string
  name: string
}

type Transaction = {
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

type StockTabsProps = {
  initialItems: Item[]
  initialSizes: Size[]
  initialTransactions: Transaction[]
}

export function StockTabs({ initialItems, initialSizes, initialTransactions }: StockTabsProps) {
  const receivedTransactions = initialTransactions.filter((t) => t.received_quantity > 0)
  const issuedTransactions = initialTransactions.filter((t) => t.issued_quantity > 0)

  return (
    <Tabs defaultValue="add" className="w-full">
      <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-6 bg-gray-100 p-1">
        <TabsTrigger value="add" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <Plus className="h-4 w-4" />
          Add Stock
        </TabsTrigger>
        <TabsTrigger value="issue" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <Minus className="h-4 w-4" />
          Issue Stock
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <History className="h-4 w-4" />
          All History
        </TabsTrigger>
        <TabsTrigger value="received" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <TrendingUp className="h-4 w-4" />
          Received
        </TabsTrigger>
        <TabsTrigger value="issued" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <TrendingDown className="h-4 w-4" />
          Issued
        </TabsTrigger>
      </TabsList>

      <TabsContent value="add">
        <AddStockForm items={initialItems} sizes={initialSizes} />
      </TabsContent>

      <TabsContent value="issue">
        <IssueStockForm items={initialItems} sizes={initialSizes} />
      </TabsContent>

      <TabsContent value="history">
        <TransactionHistory transactions={initialTransactions} title="All Transactions" />
      </TabsContent>

      <TabsContent value="received">
        <TransactionHistory transactions={receivedTransactions} title="Received Transactions" type="received" />
      </TabsContent>

      <TabsContent value="issued">
        <TransactionHistory transactions={issuedTransactions} title="Issued Transactions" type="issued" />
      </TabsContent>
    </Tabs>
  )
}
